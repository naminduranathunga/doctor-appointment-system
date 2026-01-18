"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, CheckCircle, Play, Timer, UserCheck, UserX } from "lucide-react"
import { getLocalTodayString } from "@/lib/utils"

interface Doctor {
    id: string
    name: string
}

interface Schedule {
    id: string
    doctorId: string
    date: string
    startTime: string
    endTime: string
    totalSlots: number
    doctor: Doctor
    _count: { slots: number }
}

interface Slot {
    id: string
    slotNumber: number
    time: string
    status: 'AVAILABLE' | 'BOOKED' | 'RESERVED_MANUAL' | 'CANCELLED' | 'SERVING' | 'COMPLETED' | 'NO_SHOW'
    patient?: {
        name: string
        mobile: string
    }
}

export default function DoctorConsolePage() {
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null)
    const [slots, setSlots] = useState<Slot[]>([])
    const [loading, setLoading] = useState(false)

    // Fetch Today's Schedules
    useEffect(() => {
        const today = getLocalTodayString()
        fetch(`/api/v1/schedules?date=${today}`)
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data) ? data : []
                setSchedules(list)
                if (list.length > 0) {
                    handleSelectSchedule(list[0]) // Auto-select first
                }
            })
    }, [])

    const handleSelectSchedule = (schedule: Schedule) => {
        setActiveSchedule(schedule)
        fetchSlots(schedule.id)
    }

    const fetchSlots = async (scheduleId: string) => {
        setLoading(true)
        const res = await fetch(`/api/v1/schedules/${scheduleId}/slots`)
        const data = await res.json()
        setSlots(Array.isArray(data) ? data : [])
        setLoading(false)
    }

    const updateStatus = async (slotId: string, status: 'SERVING' | 'COMPLETED' | 'NO_SHOW') => {
        try {
            await fetch(`/api/v1/slots/${slotId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            })
            if (activeSchedule) fetchSlots(activeSchedule.id)
        } catch (error) {
            console.error("Status update failed", error)
        }
    }

    const servingSlot = slots.find(s => s.status === 'SERVING')
    const nextSlots = slots.filter(s => ['BOOKED', 'RESERVED_MANUAL'].includes(s.status)).sort((a, b) => a.slotNumber - b.slotNumber)
    const completedSlots = slots.filter(s => s.status === 'COMPLETED').sort((a, b) => b.slotNumber - a.slotNumber) // Newest first

    return (
        <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Live Console</h2>
                    <p className="text-muted-foreground">Manage ongoing appointments in real-time.</p>
                </div>
                {activeSchedule && (
                    <div className="flex items-center space-x-2 bg-muted px-3 py-1 rounded-full">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{activeSchedule.doctor.name}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                {/* Left: Schedule List */}
                <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Today's Lists</h3>
                    {schedules.length === 0 && <p className="text-sm text-muted-foreground">No schedules for today.</p>}
                    {schedules.map(schedule => (
                        <div
                            key={schedule.id}
                            onClick={() => handleSelectSchedule(schedule)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-accent ${activeSchedule?.id === schedule.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                        >
                            <div className="font-bold">{schedule.doctor.name}</div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main: Live View */}
                <div className="lg:col-span-3 space-y-6 flex flex-col min-h-0">
                    {activeSchedule && (
                        <>
                            {/* Current Serving - Hero Card */}
                            <Card className="border-primary/50 shadow-lg bg-gradient-to-br from-background to-primary/5">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-primary">
                                            <ActivityIcon className="h-5 w-5 animate-pulse" />
                                            <span className="font-bold uppercase tracking-widest text-sm">Now Serving</span>
                                        </div>
                                        {servingSlot && <Badge className="text-lg px-3 py-1">Token #{servingSlot.slotNumber}</Badge>}
                                    </div>
                                </CardHeader>
                                <CardContent className="py-8 text-center space-y-6">
                                    {servingSlot ? (
                                        <div className="space-y-6">
                                            <div>
                                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">
                                                    {servingSlot.patient?.name || "Manual Booking"}
                                                </h1>
                                                {servingSlot.patient?.mobile && (
                                                    <p className="text-xl text-muted-foreground font-mono">{servingSlot.patient.mobile}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2 justify-center pt-4">
                                                <Button size="lg" className="h-14 px-8 text-lg" onClick={() => updateStatus(servingSlot.id, 'COMPLETED')}>
                                                    <CheckCircle className="mr-2 h-6 w-6" />
                                                    Complete Appointment
                                                </Button>
                                                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg" onClick={() => updateStatus(servingSlot.id, 'NO_SHOW')}>
                                                    <UserX className="mr-2 h-6 w-6" />
                                                    No Show
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-2xl text-muted-foreground">No patient currently serving.</p>
                                            {nextSlots.length > 0 && (
                                                <Button size="lg" variant="outline" onClick={() => updateStatus(nextSlots[0].id, 'SERVING')}>
                                                    <Play className="mr-2 h-5 w-5" />
                                                    Call Next: {nextSlots[0].patient?.name || `Token #${nextSlots[0].slotNumber}`}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                                {/* Next in Line */}
                                <Card className="flex flex-col min-h-0">
                                    <CardHeader className="py-3 bg-muted/30">
                                        <CardTitle className="text-sm font-medium flex items-center">
                                            <Timer className="h-4 w-4 mr-2" />
                                            Up Next ({nextSlots.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto p-0">
                                        <ul className="divide-y">
                                            {nextSlots.map(slot => (
                                                <li key={slot.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                                                    <div>
                                                        <div className="font-medium flex items-center">
                                                            <Badge variant="outline" className="mr-2">#{slot.slotNumber}</Badge>
                                                            {slot.patient?.name || "Guest"}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-0.5">
                                                            {new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => updateStatus(slot.id, 'SERVING')}
                                                    >
                                                        Call
                                                    </Button>
                                                </li>
                                            ))}
                                            {nextSlots.length === 0 && (
                                                <li className="p-8 text-center text-muted-foreground text-sm">No bookings pending.</li>
                                            )}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Completed */}
                                <Card className="flex flex-col min-h-0">
                                    <CardHeader className="py-3 bg-muted/30">
                                        <CardTitle className="text-sm font-medium flex items-center">
                                            <UserCheck className="h-4 w-4 mr-2" />
                                            Completed ({completedSlots.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto p-0">
                                        <ul className="divide-y">
                                            {completedSlots.map(slot => (
                                                <li key={slot.id} className="p-4 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                                                    <div>
                                                        <div className="font-medium flex items-center">
                                                            <Badge variant="secondary" className="mr-2">#{slot.slotNumber}</Badge>
                                                            {slot.patient?.name || "Guest"}
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                            {completedSlots.length === 0 && (
                                                <li className="p-8 text-center text-muted-foreground text-sm">No patients served yet.</li>
                                            )}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

function ActivityIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
