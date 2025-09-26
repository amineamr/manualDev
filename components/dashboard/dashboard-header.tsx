"use client"
import { useUserContext } from "@/context/UserContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PWAStatus } from "@/components/pwa/pwa-status"
import { Zap, Settings, LogOut, User, ClipboardCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface UserData {
    id: string
    email: string
    name?: string
}

export function DashboardHeader() {
    const { userContext } = useUserContext() // ✅ get userContext from the centralized context
    const [user, setUser] = useState<UserData | null>(null)
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (user) {
                setUser({
                    id: user.id,
                    email: user.email || "",
                    name: user.user_metadata?.name || user.email?.split("@")[0],
                })
            }
        }

        getUser()
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground">Certily</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        {userContext?.role !== "shop_owner" && (
                            <>
                                {/* Full Audit button on medium+ screens */}
                                <Link href="/audit" className="hidden sm:block">
                                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                        <ClipboardCheck className="w-4 h-4 mr-2" />
                                        Audit
                                    </Button>
                                </Link>

                                {/* Icon-only Audit button on small screens */}
                                <Link href="/audit" className="block sm:hidden">
                                    <Button
                                        size="icon"
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                        title="Audit"
                                    >
                                        <ClipboardCheck className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-accent text-accent-foreground">
                                            {user?.name?.charAt(0).toUpperCase() ||
                                                user?.email?.charAt(0).toUpperCase() ||
                                                "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 bg-popover border-border"
                                align="end"
                            >
                                {/* User info */}
                                <div className="flex items-center justify-start gap-2 p-2">
                                    <div className="flex flex-col space-y-1 leading-none">
                                        <p className="font-medium text-foreground">{user?.name || "User"}</p>
                                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>

                                <DropdownMenuSeparator />

                                {/* PWA Status inside the menu */}
                                <div className="px-4 py-2">
                                    <PWAStatus />
                                </div>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem className="text-foreground hover:bg-accent hover:text-accent-foreground">
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-foreground hover:bg-accent hover:text-accent-foreground">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-foreground hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                                    onClick={handleSignOut}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    )
}
