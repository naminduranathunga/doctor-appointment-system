"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import MobileNav from "@/components/mobile-nav"

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await fetch("/api/v1/auth/logout", { method: "POST" })
            router.push("/")
            router.refresh()
        } catch (error) {
            console.error("Logout failed", error)
        }
    }

    return (
        <div className="min-h-screen flex flex-col pb-16 md:pb-0">
            {/* Desktop / Tablet Header */}
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-primary">
                        MedCare
                    </Link>
                    <nav className="hidden md:flex items-center space-x-4">
                        <Link href="/medical-centers">
                            <Button variant="ghost">Find Centers</Button>
                        </Link>
                        <Link href="/my-appointments">
                            <Button variant="ghost">My Appointments</Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            Logout
                        </Button>
                    </nav>
                    <div className="md:hidden">
                        {/* Mobile Header Actions (e.g. User Profile or minimalist) */}
                        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 bg-muted/10 container mx-auto px-4 py-6 md:py-8">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileNav />
        </div>
    )
}
