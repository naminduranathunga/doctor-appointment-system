"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminSlotGrid } from "@/components/AdminSlotGrid"
import { Calendar, Clock, User, CircleX } from "lucide-react"
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
    status: 'DRAFT' | 'PUBLISHED'
    doctor: Doctor
}

export default function SchedulesPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [startDate, setStartDate] = useState(getLocalTodayString())
    const [endDate, setEndDate] = useState(() => {
        const d = new Date()
        d.setDate(d.getDate() + 7)
        return d.toISOString().split('T')[0]
    })
    const [selectedDoctor, setSelectedDoctor] = useState("")
    const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null)
    const [slots, setSlots] = useState<any[]>([])

    const [formData, setFormData] = useState({
        doctorId: "",
        date: getLocalTodayString(),
        startTime: "",
        endTime: "",
        slotDuration: 15,
        bufferTime: 5,
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch("/api/v1/doctors")
            .then(res => res.json())
            .then(data => setDoctors(Array.isArray(data) ? data : []))
    }, [])

    const fetchSchedules = useCallback(async () => {
        const params = new URLSearchParams()
        params.append("startDate", startDate)
        params.append("endDate", endDate)
        if (selectedDoctor) params.append("doctorId", selectedDoctor)

        const res = await fetch(`/api/v1/schedules?${params.toString()}`)
        const data = await res.json()

        setSchedules(Array.isArray(data) ? data : [])
    }, [startDate, endDate, selectedDoctor])

    useEffect(() => {
        fetchSchedules()
    }, [fetchSchedules])

    const fetchSlots = async (scheduleId: string) => {
        const res = await fetch(`/api/v1/schedules/${scheduleId}/slots`)
        const data = await res.json()
        setSlots(Array.isArray(data) ? data : [])
    }

    const handleViewSlots = (schedule: Schedule) => {
        setActiveSchedule(schedule)
        fetchSlots(schedule.id)
    }

    const handleUpdateStatus = async (id: string, status: 'DRAFT' | 'PUBLISHED') => {
        const res = await fetch("/api/v1/schedules", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status })
        })
        if (res.ok) fetchSchedules()
    }

    const handleDeleteSchedule = async (id: string) => {
        if (!confirm("Are you sure? This will delete all slots associated with this schedule.")) return
        const res = await fetch(`/api/v1/schedules?id=${id}`, { method: "DELETE" })
        if (res.ok) {
            fetchSchedules()
            if (activeSchedule?.id === id) setActiveSchedule(null)
        }
    }

    const handleReserve = async (slotId: string, patientInfo?: { mobile: string, name: string }) => {
        try {
            const res = await fetch(`/api/v1/slots/${slotId}/reserve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: patientInfo ? "PATIENT" : "MANUAL",
                    patientMobile: patientInfo?.mobile,
                    patientName: patientInfo?.name
                })
            })
            if (res.ok && activeSchedule) {
                fetchSlots(activeSchedule.id)
            }
        } catch (error) {
            console.error("Reservation failed:", error)
        }
    }

    const handleRelease = async (slotId: string) => {
        try {
            const res = await fetch(`/api/v1/slots/${slotId}/release`, {
                method: "POST"
            })
            if (res.ok && activeSchedule) {
                fetchSlots(activeSchedule.id)
            }
        } catch (error) {
            console.error("Release failed:", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const startStr = `${formData.date}T${formData.startTime}`
            const endStr = `${formData.date}T${formData.endTime}`

            const res = await fetch("/api/v1/schedules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    startTime: new Date(startStr).toISOString(),
                    endTime: new Date(endStr).toISOString(),
                }),
            })
            if (res.ok) {
                alert("Schedule created in DRAFT mode!")
                if (formData.date === startDate) fetchSchedules()
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Schedule Management</h2>
                <p className="text-muted-foreground">Draft and publish section availability.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Creation Form */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Generate (Draft)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Section</label>
                                    <select
                                        required
                                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                        value={formData.doctorId}
                                        onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                    >
                                        <option value="">Choose a section</option>
                                        {doctors.map((doc) => (
                                            <option key={doc.id} value={doc.id}>{doc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date</label>
                                    <Input
                                        required
                                        type="date"
                                        min={getLocalTodayString()}
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Start</label>
                                        <Input
                                            required
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">End</label>
                                        <Input
                                            required
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Serve Time (mins)</label>
                                        <Input
                                            required
                                            type="number"
                                            min="5"
                                            value={formData.slotDuration}
                                            onChange={(e) => setFormData({ ...formData, slotDuration: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Gap (mins)</label>
                                        <Input
                                            required
                                            type="number"
                                            min="0"
                                            value={formData.bufferTime}
                                            onChange={(e) => setFormData({ ...formData, bufferTime: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Generating..." : "Generate Draft"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Browser & Slot View */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                            <CardTitle className="text-lg">Browser Schedules</CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center space-x-1">
                                    <Input
                                        type="date"
                                        className="w-36 h-8 text-xs"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <Input
                                        type="date"
                                        className="w-36 h-8 text-xs"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs w-36"
                                    value={selectedDoctor}
                                    onChange={(e) => setSelectedDoctor(e.target.value)}
                                >
                                    <option value="">All Sections</option>
                                    {doctors.map((doc) => (
                                        <option key={doc.id} value={doc.id}>{doc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {schedules.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                        No schedules found for this view.
                                    </div>
                                ) : (
                                    schedules.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className={`p-4 rounded-lg border transition-all cursor-pointer hover:border-primary ${activeSchedule?.id === schedule.id ? 'border-primary bg-primary/5' : ''}`}
                                            onClick={() => handleViewSlots(schedule)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="p-2 bg-primary/10 rounded-full">
                                                        <User className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <p className="font-semibold">{schedule.doctor.name}</p>
                                                            <Badge variant={schedule.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                                                {schedule.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center text-xs text-muted-foreground space-x-3">
                                                            <span className="flex items-center">
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                {new Date(schedule.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                {new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <span className="flex items-center font-medium">
                                                                {schedule.totalSlots} Slots
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {schedule.status === 'DRAFT' && (
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="h-8 px-3 text-[10px] cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleUpdateStatus(schedule.id, 'PUBLISHED')
                                                            }}
                                                        >
                                                            Publish
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-destructive cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteSchedule(schedule.id)
                                                        }}
                                                    >
                                                        <CircleX size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {activeSchedule && (
                        <Card className="animate-in slide-in-from-bottom-4 duration-300">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span>Slots for Section {activeSchedule.doctor.name}</span>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline">
                                            {new Date(activeSchedule.date).toLocaleDateString()}
                                        </Badge>
                                        <Badge variant={activeSchedule.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                            {activeSchedule.status}
                                        </Badge>
                                    </div>
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
                    )}
                </div>
            </div>
        </div>
    )
}
