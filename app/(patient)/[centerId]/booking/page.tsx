"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getLocalTodayString } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface Doctor {
    id: string
    name: string
    specialty: string
}

interface Slot {
    id: string
    time: string
}

export default function BookingPage() {
    const { centerId } = useParams()
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
    const [date, setDate] = useState(getLocalTodayString())
    const [slots, setSlots] = useState<Slot[]>([])
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

    const [showAuth, setShowAuth] = useState(false)
    const [authStep, setAuthStep] = useState<1 | 2>(1)
    const [authData, setAuthData] = useState({ mobile: "", name: "", otp: "" })
    const [authLoading, setAuthLoading] = useState(false)
    const [pendingSlotId, setPendingSlotId] = useState<string | null>(null)

    const handleBook = async (slotId: string) => {
        try {
            const res = await fetch("/api/v1/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slotId }),
            })

            if (res.status === 401) {
                setPendingSlotId(slotId)
                setShowAuth(true)
                return
            }

            if (res.ok) {
                alert("Booking successful!")
                router.push("/my-appointments")
            } else {
                const data = await res.json()
                alert(data.error || "Booking failed")
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setAuthLoading(true)
        try {
            if (authStep === 1) {
                const res = await fetch("/api/v1/auth/patient/otp-request", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mobile: authData.mobile }),
                })
                if (res.ok) {
                    setAuthStep(2)
                    alert("OTP sent! (Check console)")
                } else {
                    const data = await res.json()
                    alert(data.error)
                }
            } else {
                const res = await fetch("/api/v1/auth/patient/otp-verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(authData),
                })
                if (res.ok) {
                    setShowAuth(false)
                    if (pendingSlotId) {
                        handleBook(pendingSlotId)
                    }
                } else {
                    const data = await res.json()
                    alert(data.error)
                }
            }
        } catch (err) {
            console.error(err)
        } finally {
            setAuthLoading(false)
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
                        {doctors.map((doc) => (
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
                            min={getLocalTodayString()}
                            onChange={(e) => setDate(e.target.value)}
                        />

                        {loading ? (
                            <div className="text-center py-8">Loading slots...</div>
                        ) : selectedDoctor ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {slots.length === 0 ? (
                                    <div className="col-span-3 text-center py-8 text-muted-foreground">
                                        No available slots for this date.
                                    </div>
                                ) : (
                                    slots.map((slot) => (
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

            {/* Auth Modal */}
            {showAuth && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-sm relative animate-in fade-in zoom-in-95 duration-200">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 h-8 w-8 p-0"
                            onClick={() => setShowAuth(false)}
                        >
                            <span className="text-lg">×</span>
                        </Button>
                        <CardHeader>
                            <CardTitle>
                                {authStep === 1 ? "Quick Login / Register" : "Verify OTP"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAuthSubmit} className="space-y-4">
                                {authStep === 1 ? (
                                    <>
                                        <div className="space-y-2">
                                            <Input
                                                placeholder="Your Name"
                                                required
                                                value={authData.name}
                                                onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                                            />
                                            <Input
                                                placeholder="Mobile Number"
                                                required
                                                type="tel"
                                                value={authData.mobile}
                                                onChange={(e) => setAuthData({ ...authData, mobile: e.target.value })}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={authLoading}>
                                            {authLoading ? "Sending OTP..." : "Get OTP"}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Input
                                            placeholder="Enter 6-digit OTP"
                                            required
                                            value={authData.otp}
                                            onChange={(e) => setAuthData({ ...authData, otp: e.target.value })}
                                        />
                                        <Button type="submit" className="w-full" disabled={authLoading}>
                                            {authLoading ? "Verifying..." : "Verify & Book"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full"
                                            onClick={() => setAuthStep(1)}
                                        >
                                            Back
                                        </Button>
                                    </>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
