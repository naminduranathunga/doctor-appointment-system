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
    const [upcomingSchedules, setUpcomingSchedules] = useState<any[]>([])
    const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null)
    const [slots, setSlots] = useState<Slot[]>([])
    const [loading, setLoading] = useState(false)
    const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (centerId) {
            fetch(`/api/v1/public/centers/${centerId}/doctors`)
                .then(res => res.json())
                .then(data => setDoctors(Array.isArray(data) ? data : []))
        }
    }, [centerId])

    const handleSelectDoctor = (docId: string) => {
        setSelectedDoctor(docId)
        setBookingStep(2)
        setSelectedSchedule(null)
        setSlots([])
        setLoading(true)
        fetch(`/api/v1/public/doctors/${docId}/schedules`)
            .then(res => res.json())
            .then(data => {
                setUpcomingSchedules(Array.isArray(data) ? data : [])
                setLoading(false)
            })
    }

    const handleSelectSchedule = (schedule: any) => {
        setSelectedSchedule(schedule)
        setBookingStep(3)
        setLoading(true)
        fetch(`/api/v1/public/schedules/${schedule.id}/slots`)
            .then(res => res.json())
            .then(data => {
                const availableSlots = Array.isArray(data) ? data.filter((s: any) => s.status === 'AVAILABLE') : []
                setSlots(availableSlots)
                setLoading(false)
            })
    }

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
                setMessage({ text: "Booking successful!", type: "success" })
                setTimeout(() => router.push("/my-appointments"), 2000)
            } else {
                const data = await res.json()
                setMessage({ text: data.error || "Booking failed", type: "error" })
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
                    setMessage({ text: "OTP sent! (Check console)", type: "info" })
                    setTimeout(() => setMessage(null), 5000)
                } else {
                    const data = await res.json()
                    setMessage({ text: data.error, type: "error" })
                }
            } else {
                const res = await fetch("/api/v1/auth/patient/otp-verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(authData),
                })
                if (res.ok) {
                    setShowAuth(false)
                    setMessage({ text: "Verification successful!", type: "success" })
                    if (pendingSlotId) {
                        handleBook(pendingSlotId)
                    }
                } else {
                    const data = await res.json()
                    setMessage({ text: data.error, type: "error" })
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
                <p className="text-muted-foreground">Select a section and available time slot.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-center animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                        message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                            'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
                {/* Step 1: Select Section */}
                <Card className={bookingStep !== 1 ? "opacity-50" : ""}>
                    <CardHeader>
                        <CardTitle className="text-lg flex justify-between items-center">
                            <span>1. Select Section</span>
                            {bookingStep > 1 && <Button variant="ghost" size="sm" onClick={() => setBookingStep(1)}>Change</Button>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {doctors.map((doc) => (
                            <button
                                key={doc.id}
                                onClick={() => handleSelectDoctor(doc.id)}
                                disabled={bookingStep !== 1 && selectedDoctor !== doc.id}
                                className={`w-full p-3 rounded-lg border text-left transition-all ${selectedDoctor === doc.id
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "hover:bg-accent"
                                    } ${bookingStep !== 1 && selectedDoctor !== doc.id ? "hidden" : ""}`}
                            >
                                <div className="font-semibold text-sm">{doc.name}</div>
                                <div className="text-xs text-muted-foreground">{doc.specialty}</div>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {/* Step 2: Select Schedule */}
                <Card className={bookingStep < 2 ? "opacity-50" : bookingStep > 2 ? "opacity-50" : ""}>
                    <CardHeader>
                        <CardTitle className="text-lg flex justify-between items-center">
                            <span>2. Upcoming</span>
                            {bookingStep > 2 && <Button variant="ghost" size="sm" onClick={() => setBookingStep(2)}>Change</Button>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {bookingStep === 1 ? (
                            <div className="text-center py-8 text-xs text-muted-foreground italic">Select a doctor first</div>
                        ) : loading && bookingStep === 2 ? (
                            <div className="text-center py-8 text-xs">Loading schedules...</div>
                        ) : upcomingSchedules.length === 0 ? (
                            <div className="text-center py-8 text-xs text-muted-foreground italic">No upcoming schedules</div>
                        ) : (
                            upcomingSchedules.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => handleSelectSchedule(s)}
                                    disabled={bookingStep !== 2 && selectedSchedule?.id !== s.id}
                                    className={`w-full p-3 rounded-lg border text-left transition-all ${selectedSchedule?.id === s.id
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "hover:bg-accent"
                                        } ${bookingStep !== 2 && selectedSchedule?.id !== s.id ? "hidden" : ""}`}
                                >
                                    <div className="font-semibold text-sm">
                                        {new Date(s.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {s.availableSlots} slots left
                                    </div>
                                </button>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Step 3: Select Slot */}
                <Card className={bookingStep < 3 ? "opacity-50" : ""}>
                    <CardHeader>
                        <CardTitle className="text-lg">3. Pick a Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {bookingStep < 3 ? (
                            <div className="text-center py-8 text-xs text-muted-foreground italic">Select a schedule first</div>
                        ) : loading && bookingStep === 3 ? (
                            <div className="text-center py-8 text-xs">Loading slots...</div>
                        ) : slots.length === 0 ? (
                            <div className="text-center py-8 text-xs text-muted-foreground italic">All slots booked</div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {slots.map((slot) => (
                                    <Button
                                        key={slot.id}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-9"
                                        onClick={() => handleBook(slot.id)}
                                    >
                                        {new Date(slot.time).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Button>
                                ))}
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
