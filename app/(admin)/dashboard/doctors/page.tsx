"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CircleX } from "lucide-react"

interface Doctor {
    id: string
    name: string
    specialty: string
}

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [name, setName] = useState("")
    const [specialty, setSpecialty] = useState("")
    const [loading, setLoading] = useState(false)

    const fetchDoctors = async () => {
        const res = await fetch("/api/v1/doctors")
        const data = await res.json()
        setDoctors(Array.isArray(data) ? data : [])
    }

    useEffect(() => {
        fetchDoctors()
    }, [])

    const handleAddDoctor = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch("/api/v1/doctors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, specialty }),
            })
            if (res.ok) {
                setName("")
                setSpecialty("")
                fetchDoctors()
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Doctors</h2>
                    <p className="text-muted-foreground">Manage the doctors at your center.</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Add Doctor Form */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Add New Doctor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddDoctor} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Doctor Name</label>
                                <Input
                                    required
                                    placeholder="e.g. Dr. John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Specialty</label>
                                <Input
                                    required
                                    placeholder="e.g. Dentist"
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Adding..." : "Add Doctor"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Doctors List */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Doctors List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {doctors.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No doctors added yet.</div>
                            ) : (
                                <div className="divide-y">
                                    {doctors.map((doc) => (
                                        <div key={doc.id} className="py-4 flex justify-between items-center">
                                            <div>
                                                <div className="font-medium">{doc.name}</div>
                                                <div className="text-sm text-muted-foreground">{doc.specialty}</div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button variant="outline" size="sm">Manage Schedule</Button>
                                                <Button
                                                    variant="ghost"
                                                    className="text-red-400 cursor-pointer"
                                                    size="sm"
                                                    onClick={async () => {
                                                        if (confirm("Are you sure you want to remove this doctor?")) {
                                                            const res = await fetch(`/api/v1/doctors?id=${doc.id}`, { method: "DELETE" })
                                                            if (res.ok) fetchDoctors()
                                                            else {
                                                                const err = await res.json()
                                                                alert(err.error || "Failed to delete doctor")
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <CircleX size={18} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
