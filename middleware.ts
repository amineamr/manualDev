// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => req.cookies.getAll(),
                setAll: (cookies) =>
                    cookies.forEach(({ name, value, options }) =>
                        res.cookies.set(name, value, options)
                    ),
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // protect /dashboard routes
    if (!user && req.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    // prevent logged-in users from seeing login page
    if (user && req.nextUrl.pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
}
