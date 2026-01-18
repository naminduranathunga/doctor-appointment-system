"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Hospital, UserCircle, QrCode } from "lucide-react"

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Hospital className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">MedCare</span>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
                        Appointment Management <br />
                        <span className="text-primary text-4xl sm:text-5xl">Made Simple.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        A SaaS solution for small dispensaries and medical centers to manage
                        doctor appointments with ease. Scan, book, and go.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 pt-8">
                        <Link href="/auth/login">
                            <Button size="lg" className="w-full h-32 flex flex-col space-y-2 text-center">
                                <Hospital className="h-8 w-8 mx-auto" />
                                <span>Medical Center Portal</span>
                            </Button>
                        </Link>
                        <Link href="/auth/patient">
                            <Button size="lg" variant="outline" className="w-full h-32 flex flex-col space-y-2 text-center">
                                <UserCircle className="h-8 w-8 mx-auto" />
                                <span>Patient Portal</span>
                            </Button>
                        </Link>
                    </div>

                    <div className="pt-12 border-t text-muted-foreground">
                        <p className="flex items-center justify-center space-x-2">
                            <QrCode className="h-5 w-5" />
                            <span>Scanning a QR code? Redirect to your center&apos;s booking page.</span>
                        </p>
                    </div>
                </div>
            </main>

            <footer className="border-t py-8 text-center text-sm text-muted-foreground">
                © 2026 MedCare SaaS. Built for dispensaries.
            </footer>
        </div>
    )
}
