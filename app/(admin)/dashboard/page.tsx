"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, Calendar, CheckCircle, Link as LinkIcon, Copy, ExternalLink } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

export default function DashboardOverview() {
    const [stats, setStats] = useState({
        doctors: 0,
        activeSchedules: 0,
        todayBookings: 0,
    })
    const [center, setCenter] = useState<any>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docsRes, bookingsRes, meRes] = await Promise.all([
                    fetch("/api/v1/doctors"),
                    fetch("/api/v1/bookings"),
                    fetch("/api/v1/medical-center/me")
                ])

                const doctors = await docsRes.json()
                const bookings = await bookingsRes.json()
                const me = await meRes.json()

                setStats({
                    doctors: Array.isArray(doctors) ? doctors.length : 0,
                    activeSchedules: 0,
                    todayBookings: Array.isArray(bookings) ? bookings.length : 0,
                })
                setCenter(me)
            } catch (err) {
                console.error("Failed to fetch data", err)
            }
        }
        fetchData()
    }, [])

    const bookingUrl = center ? `${window.location.origin}/${center.id}/booking` : ""

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookingUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const cards = [
        { title: "Total Sections", value: stats.doctors, icon: Users, color: "text-blue-500" },
        { title: "Active Schedules", value: stats.activeSchedules, icon: Calendar, color: "text-green-500" },
        { title: "Today's Bookings", value: stats.todayBookings, icon: CheckCircle, color: "text-purple-500" },
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                    <p className="text-muted-foreground">Manage your center at a glance.</p>
                </div>
                {center && (
                    <div className="text-right">
                        <p className="text-sm font-medium text-primary">{center.name}</p>
                        <p className="text-xs text-muted-foreground">{center.email}</p>
                    </div>
                )}
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

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <LinkIcon className="h-5 w-5 text-primary" />
                            <span>Patient Booking Portal</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center items-center space-y-6 py-10">
                        {center ? (
                            <>
                                <div className="p-4 bg-white rounded-xl shadow-inner border">
                                    <QRCodeSVG
                                        value={bookingUrl}
                                        size={180}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>
                                <div className="w-full max-w-sm space-y-2">
                                    <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg border group relative">
                                        <div className="flex-1 truncate text-xs font-mono">
                                            {bookingUrl}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={copyToClipboard}
                                        >
                                            <Copy className={`h-4 w-4 ${copied ? 'text-green-500' : ''}`} />
                                        </Button>
                                    </div>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => window.open(bookingUrl, '_blank')}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open Booking Page
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="animate-pulse flex flex-col items-center space-y-4">
                                <div className="h-40 w-40 bg-muted rounded-lg" />
                                <div className="h-8 w-64 bg-muted rounded" />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg h-[300px] flex items-center justify-center">
                            Recent booking activity will appear here.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
