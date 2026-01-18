import Link from "next/link"
import { Button } from "@/components/ui/button"
import MobileNav from "@/components/mobile-nav"

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-primary">
                        MedCare
                    </Link>
                    <nav className="flex items-center space-x-4">
                        <Link href="/medical-centers">
                            <Button variant="ghost">Find Centers</Button>
                        </Link>
                        <Link href="/my-appointments">
                            <Button variant="outline">My Appointments</Button>
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1 bg-muted/10 pb-16 md:pb-0">
                {children}
            </main>
            <MobileNav />
        </div>
    )
}
