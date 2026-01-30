"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Calendar, ClipboardList } from "lucide-react"

export default function PatientDashboard() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl text-center">
                            Welcome to Your Health Center
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8">
                        <p className="text-center text-muted-foreground text-lg">
                            What would you like to do today?
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {/* Book Appointment Card */}
                            <Link href="http://localhost:3000/medical-centers" className="block">
                                <Card className="h-40 flex flex-col items-center justify-center rounded-xl hover:shadow-lg transition-all duration-200 hover:border-primary cursor-pointer bg-card hover:bg-accent border-2 border-transparent">
                                    <Calendar className="w-12 h-12 mb-3 text-primary" />
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-lg font-semibold">Book Appointment</span>
                                        <span className="text-xs text-muted-foreground">Schedule a new appointment</span>
                                    </div>
                                </Card>
                            </Link>

                            {/* My Appointments Card */}
                            <Link href="http://localhost:3000/my-appointments" className="block">
                                <Card className="h-40 flex flex-col items-center justify-center rounded-xl hover:shadow-lg transition-all duration-200 hover:border-primary cursor-pointer bg-card hover:bg-accent border-2 border-transparent">
                                    <ClipboardList className="w-12 h-12 mb-3 text-primary" />
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-lg font-semibold">My Appointments</span>
                                        <span className="text-xs text-muted-foreground">View your bookings</span>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
