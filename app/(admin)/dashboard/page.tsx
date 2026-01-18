"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, Calendar, CheckCircle } from "lucide-react"

export default function DashboardOverview() {
    const [stats, setStats] = useState({
        doctors: 0,
        activeSchedules: 0,
        todayBookings: 0,
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [docsRes, bookingsRes] = await Promise.all([
                    fetch("/api/v1/doctors"),
                    fetch("/api/v1/bookings"),
                ])

                const doctors = await docsRes.json()
                const bookings = await bookingsRes.json()

                setStats({
                    doctors: Array.isArray(doctors) ? doctors.length : 0,
                    activeSchedules: 0,
                    todayBookings: Array.isArray(bookings) ? bookings.length : 0,
                })
            } catch (err) {
                console.error("Failed to fetch stats", err)
            }
        }
        fetchStats()
    }, [])

    const cards = [
        { title: "Total Doctors", value: stats.doctors, icon: Users, color: "text-blue-500" },
        { title: "Active Schedules", value: stats.activeSchedules, icon: Calendar, color: "text-green-500" },
        { title: "Today's Bookings", value: stats.todayBookings, icon: CheckCircle, color: "text-purple-500" },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-muted-foreground">Manage your center at a glance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {cards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
                        Statistics are being populated.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
