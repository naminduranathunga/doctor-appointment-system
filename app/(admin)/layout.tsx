"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, Calendar, BookOpen, LogOut, Maximize, Minimize, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Sections", href: "/dashboard/doctors", icon: Users },
        { label: "Schedules", href: "/dashboard/schedules", icon: Calendar },
        { label: "Manual Booking", href: "/dashboard/manual-booking", icon: BookOpen },
        { label: "Live Console", href: "/dashboard/doctor", icon: Activity },
    ]

    const [isFullscreen, setIsFullscreen] = useState(false)

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
                setIsFullscreen(false)
            }
        }
    }

    const handleLogout = async () => {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
        router.push("/auth/login")
        router.refresh()
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-primary">MedCare Admin</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                                pathname === item.href
                                    ? "bg-primary text-primary-foreground font-medium"
                                    : "hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t space-y-4">
                    <button
                        onClick={toggleFullscreen}
                        className="flex w-full items-center space-x-3 px-3 py-2 hover:bg-accent rounded-lg transition-colors"
                    >
                        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                        <span>{isFullscreen ? "Exit Full Screen" : "Full Screen"}</span>
                    </button>
                    <div className="flex items-center justify-between px-3">
                        <span className="text-sm">Theme</span>
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center space-x-3 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
