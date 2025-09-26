import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard/super-admin': ['super_user'],
  '/audit': ['airport_manager', 'super_user'],
  '/dashboard/': ['shop_owner', 'airport_manager', 'super_user'],
  '/dashboard/assessments': ['shop_owner', 'airport_manager', 'super_user'],
  '/dashboard/shops': ['airport_manager', 'super_user'],
  '/dashboard/analytics': ['airport_manager', 'super_user'],
}

// Public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Check if current route is protected
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  )

  // Redirect unauthenticated users from protected routes to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from public auth pages to dashboard
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // Role-based access control for authenticated users
  if (user && isProtectedRoute) {
    // Get user's role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // No profile found, redirect to unauthorized
      const url = request.nextUrl.clone()
      url.pathname = "/unauthorized"
      return NextResponse.redirect(url)
    }

    // Find the required role for the current route
    const requiredRoles = Object.entries(protectedRoutes).find(([route]) => 
      pathname.startsWith(route)
    )?.[1]

    // Check if user has required role
    if (requiredRoles && !requiredRoles.includes(profile.role)) {
      const url = request.nextUrl.clone()
      url.pathname = "/unauthorized"
      return NextResponse.redirect(url)
    }

    // Add user role to headers for use in server components
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-role', profile.role)
    requestHeaders.set('x-user-id', user.id)

    supabaseResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return supabaseResponse
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
