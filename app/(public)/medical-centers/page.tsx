"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Search, MapPin, Phone, Building2 } from "lucide-react"
import Link from "next/link"

export default function MedicalCentersPage() {
    const [centers, setCenters] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)

    const fetchCenters = async (query = "") => {
        setLoading(true)
        try {
            const res = await fetch(`/api/v1/public/medical-centers${query ? `?query=${query}` : ''}`)
            const data = await res.json()
            setCenters(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Failed to fetch centers", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCenters()
    }, [])

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col items-center space-y-4 text-center">
                <h1 className="text-4xl font-bold tracking-tight">Find Medical Centers</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Discover and book appointments with top medical centers near you.
                </p>
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                        placeholder="Search by name or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchCenters(search)}
                    />
                    <Button onClick={() => fetchCenters(search)}>
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading centers...</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {centers.map((center) => (
                        <Card key={center.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    <span>{center.name}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3 text-sm">
                                {center.address && (
                                    <div className="flex items-start space-x-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                        <span>{center.address}</span>
                                    </div>
                                )}
                                {center.phone && (
                                    <div className="flex items-center space-x-2 text-muted-foreground">
                                        <Phone className="h-4 w-4 shrink-0" />
                                        <span>{center.phone}</span>
                                    </div>
                                )}
                                <div className="pt-2">
                                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                                        {center._count?.doctors || 0} Sections Available
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href={`/${center.id}/booking`} className="w-full">
                                    <Button className="w-full">Book Appointment</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                    {centers.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No medical centers found.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
