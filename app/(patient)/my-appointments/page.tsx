"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User } from "lucide-react"

export default function MyAppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await fetch("/api/v1/patient/appointments")
                if (res.status === 401) {
                    window.location.href = "/auth/patient"
                    return
                }
                if (res.ok) {
                    const data = await res.json()
                    setAppointments(Array.isArray(data) ? data : [])
                }
            } catch (error) {
                console.error("Failed to fetch appointments", error)
            } finally {
                setLoading(false)
            }
        }
        fetchAppointments()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'BOOKED': return 'bg-green-500/10 text-green-500'
            case 'SERVING': return 'bg-blue-500/10 text-blue-500 animate-pulse'
            case 'COMPLETED': return 'bg-gray-500/20 text-gray-500'
            case 'NO_SHOW': return 'bg-red-500/20 text-red-500'
            case 'CANCELLED': return 'bg-red-500/10 text-red-500'
            default: return 'bg-gray-500/10 text-gray-500'
        }
    }

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading appointments...</div>

    const upcoming = appointments.filter(a => new Date(a.time) >= new Date())
    const past = appointments.filter(a => new Date(a.time) < new Date())

    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Appointments</h1>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>Upcoming</span>
                    </h2>
                    {upcoming.length === 0 ? (
                        <div className="text-muted-foreground italic">No upcoming appointments.</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {upcoming.map(app => <AppointmentCard key={app.id} appointment={app} getStatusColor={getStatusColor} />)}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4 text-muted-foreground flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Past History</span>
                    </h2>
                    {past.length === 0 ? (
                        <div className="text-muted-foreground italic">No past appointments.</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-75 grayscale hover:grayscale-0 transition-all">
                            {past.map(app => <AppointmentCard key={app.id} appointment={app} getStatusColor={getStatusColor} />)}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

function AppointmentCard({ appointment, getStatusColor }: { appointment: any, getStatusColor: (s: string) => string }) {
    const { schedule } = appointment
    const { doctor } = schedule
    const { medicalCenter } = doctor

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">{doctor.name}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(appointment.status)}>
                        {appointment.status}
                    </Badge>
                </div>
                <div className="text-xs text-muted-foreground">{doctor.specialty}</div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{medicalCenter.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(appointment.time).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(appointment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Live Status */}
                {appointment.status === 'BOOKED' && (
                    <div className="mt-4 pt-4 border-t border-dashed">
                        {appointment.currentServingToken ? (
                            <div className="flex items-center justify-between">
                                <div className="text-xs">
                                    <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Current Token</p>
                                    <p className="text-xl font-bold text-primary">#{appointment.currentServingToken}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Your Token</p>
                                    <p className="text-xl font-bold">#{appointment.slotNumber}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-2 rounded text-xs">
                                <Clock className="h-4 w-4" />
                                <span>Waiting for doctor to start...</span>
                            </div>
                        )}
                        {appointment.currentServingToken && appointment.currentServingToken === appointment.slotNumber && (
                            <div className="mt-2 text-center bg-green-500 text-white py-1 rounded text-xs font-bold animate-pulse">
                                IT'S YOUR TURN!
                            </div>
                        )}
                    </div>
                )}
                <div className="pt-2 border-t mt-2 flex justify-between items-center text-xs text-muted-foreground">
                    <span>Slot #{appointment.slotNumber}</span>
                    <span>{medicalCenter.phone}</span>
                </div>
            </CardContent>
        </Card>
    )
}

function Building2({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            <path d="M10 6h4" />
            <path d="M10 10h4" />
            <path d="M10 14h4" />
            <path d="M10 18h4" />
        </svg>
    )
}
