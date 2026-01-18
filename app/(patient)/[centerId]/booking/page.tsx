"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function BookingPage() {
    const { centerId } = useParams()
    const [doctors, setDoctors] = useState([])
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [slots, setSlots] = useState([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (centerId) {
            fetch(`/api/v1/public/centers/${centerId}/doctors`)
                .then(res => res.json())
                .then(data => setDoctors(Array.isArray(data) ? data : []))
        }
    }, [centerId])

    useEffect(() => {
        if (selectedDoctor && date) {
            setLoading(true)
            fetch(`/api/v1/public/doctors/${selectedDoctor}/slots?date=${date}`)
                .then(res => res.json())
                .then(data => {
                    setSlots(Array.isArray(data) ? data : [])
                    setLoading(false)
                })
        }
    }, [selectedDoctor, date])

    const handleBook = async (slotId: string) => {
        try {
            const res = await fetch("/api/v1/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slotId }),
            })

            if (res.status === 401) {
                router.push("/auth/patient")
                return
            }

            if (res.ok) {
                alert("Booking successful!")
                router.push("/")
            } else {
                const data = await res.json()
                alert(data.error || "Booking failed")
            }
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 py-12">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Book an Appointment</h1>
                <p className="text-muted-foreground">Select a doctor and available time slot.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>1. Select Doctor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {doctors.map((doc: any) => (
                            <button
                                key={doc.id}
                                onClick={() => setSelectedDoctor(doc.id)}
                                className={`w-full p-4 rounded-lg border text-left transition-colors ${selectedDoctor === doc.id
                                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                                    : "hover:bg-accent"
                                    }`}
                            >
                                <div className="font-semibold">{doc.name}</div>
                                <div className="text-sm text-muted-foreground">{doc.specialty}</div>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>2. Available Slots</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            type="date"
                            value={date}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setDate(e.target.value)}
                        />

                        {loading ? (
                            <div className="text-center py-8">Loading slots...</div>
                        ) : selectedDoctor ? (
                            <div className="grid grid-cols-3 gap-2">
                                {slots.length === 0 ? (
                                    <div className="col-span-3 text-center py-8 text-muted-foreground">
                                        No available slots for this date.
                                    </div>
                                ) : (
                                    slots.map((slot: any) => (
                                        <Button
                                            key={slot.id}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBook(slot.id)}
                                        >
                                            {new Date(slot.time).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </Button>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Please select a doctor first.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
