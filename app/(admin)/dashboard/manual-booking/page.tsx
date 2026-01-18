"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AdminSlotGrid } from "@/components/AdminSlotGrid"
import { Badge } from "@/components/ui/badge"
import { Search, User, Calendar } from "lucide-react"
import { getLocalTodayString } from "@/lib/utils"

interface Doctor {
    id: string
    name: string
    specialty: string
}

interface Slot {
    id: string
    slotNumber: number
    time: string
    status: 'AVAILABLE' | 'BOOKED' | 'RESERVED_MANUAL' | 'CANCELLED'
    patient?: {
        name: string
        mobile: string
    }
}

export default function ManualBookingPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [selectedDoctor, setSelectedDoctor] = useState("")
    const [selectedDate, setSelectedDate] = useState(getLocalTodayString())
    const [schedules, setSchedules] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [activeSchedule, setActiveSchedule] = useState<any>(null)
    const [slots, setSlots] = useState<Slot[]>([])

    useEffect(() => {
        fetch("/api/v1/doctors")
            .then(res => res.json())
            .then(data => setDoctors(Array.isArray(data) ? data : []))
    }, [])

    const searchSlots = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append("date", selectedDate)
            if (selectedDoctor) params.append("doctorId", selectedDoctor)

            const res = await fetch(`/api/v1/schedules?${params.toString()}`)
            const data = await res.json()
            const publishedSchedules = Array.isArray(data) ? data.filter((s: any) => s.status === 'PUBLISHED') : []
            setSchedules(publishedSchedules)
            setActiveSchedule(null)
            setSlots([])
        } finally {
            setLoading(false)
        }
    }

    const fetchSlots = async (scheduleId: string) => {
        const res = await fetch(`/api/v1/schedules/${scheduleId}/slots`)
        const data = await res.json()
        setSlots(Array.isArray(data) ? data : [])
    }

    const handleSelectSchedule = (schedule: any) => {
        setActiveSchedule(schedule)
        fetchSlots(schedule.id)
    }

    const handleReserve = async (slotId: string, patientInfo?: { mobile: string, name: string }) => {
        const res = await fetch(`/api/v1/slots/${slotId}/reserve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: patientInfo ? "PATIENT" : "MANUAL",
                patientMobile: patientInfo?.mobile,
                patientName: patientInfo?.name
            })
        })
        if (res.ok && activeSchedule) fetchSlots(activeSchedule.id)
    }

    const handleRelease = async (slotId: string) => {
        const res = await fetch(`/api/v1/slots/${slotId}/release`, { method: "POST" })
        if (res.ok && activeSchedule) fetchSlots(activeSchedule.id)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Manual Booking</h2>
                <p className="text-muted-foreground">Find and book slots for patients manually.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                        <Search className="h-5 w-5" />
                        <span>Search Available Slots</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Date</label>
                            <Input
                                type="date"
                                className="w-48"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Doctor (Optional)</label>
                            <select
                                className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm w-48"
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                            >
                                <option value="">All Doctors</option>
                                {doctors.map((doc) => (
                                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={searchSlots} disabled={loading}>
                            {loading ? "Searching..." : "Search Schedules"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {schedules.length === 0 ? (
                                <div className="text-center py-4 text-xs text-muted-foreground border border-dashed rounded-md">
                                    No published schedules found.
                                </div>
                            ) : (
                                schedules.map((s) => (
                                    <div
                                        key={s.id}
                                        onClick={() => handleSelectSchedule(s)}
                                        className={`p-3 rounded-md border text-sm cursor-pointer transition-colors hover:border-primary ${activeSchedule?.id === s.id ? 'border-primary bg-primary/5' : ''}`}
                                    >
                                        <div className="font-semibold flex items-center justify-between">
                                            <span>{s.doctor.name}</span>
                                            <Badge variant="outline" className="text-[9px]">{s.doctor.specialty}</Badge>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2">
                    {activeSchedule ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">
                                    Slots for {activeSchedule.doctor.name} on {selectedDate}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AdminSlotGrid
                                    slots={slots}
                                    onReserve={handleReserve}
                                    onRelease={handleRelease}
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full min-h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
                            Select a schedule to view slots
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
