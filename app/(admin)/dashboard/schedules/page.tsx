"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface Doctor {
    id: string
    name: string
}

export default function SchedulesPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [formData, setFormData] = useState({
        doctorId: "",
        date: "",
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
                alert("Schedule created and slots generated!")
                setFormData({ ...formData, startTime: "", endTime: "" })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Schedule Management</h2>
                <p className="text-muted-foreground">Create schedules and generate appointment slots.</p>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Generate New Slots</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Doctor</label>
                                <select
                                    required
                                    className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={formData.doctorId}
                                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                >
                                    <option value="">Choose a doctor</option>
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
                                    min={new Date().toISOString().split("T")[0]}
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Time</label>
                                <Input
                                    required
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Time</label>
                                <Input
                                    required
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Slot Duration (mins)</label>
                                <Input
                                    required
                                    type="number"
                                    value={formData.slotDuration}
                                    onChange={(e) => setFormData({ ...formData, slotDuration: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Buffer Time (mins)</label>
                                <Input
                                    required
                                    type="number"
                                    value={formData.bufferTime}
                                    onChange={(e) => setFormData({ ...formData, bufferTime: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Generating Slots..." : "Create Schedule & Generate Slots"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
