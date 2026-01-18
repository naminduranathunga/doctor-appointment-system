"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

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

interface AdminSlotGridProps {
    slots: Slot[]
    onReserve: (slotId: string, patientInfo?: { mobile: string, name: string }) => Promise<void>
    onRelease: (slotId: string) => Promise<void>
}

export function AdminSlotGrid({ slots, onReserve, onRelease }: AdminSlotGridProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [bookingId, setBookingId] = useState<string | null>(null)
    const [patientInfo, setPatientInfo] = useState({ mobile: '', name: '' })

    const handleAction = async (id: string, action: () => Promise<void>) => {
        setLoadingId(id)
        try {
            await action()
            setBookingId(null)
            setPatientInfo({ mobile: '', name: '' })
        } finally {
            setLoadingId(null)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
            case 'BOOKED': return 'bg-blue-500/10 text-blue-500 border-blue-500'
            case 'RESERVED_MANUAL': return 'bg-orange-500/10 text-orange-500 border-orange-500'
            default: return 'bg-gray-500/10 text-gray-500'
        }
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {slots.map((slot) => (
                <div key={slot.id} className="relative group p-3 rounded-lg border bg-card shadow-sm flex flex-col items-center justify-center space-y-2">
                    <div className="absolute top-2 left-2 flex items-center justify-center w-5 h-5 bg-muted rounded-full text-[10px] font-bold">
                        {slot.slotNumber}
                    </div>

                    <span className="text-sm font-bold pt-1">
                        {new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <Badge variant="outline" className={getStatusColor(slot.status)}>
                        {slot.status}
                    </Badge>

                    {slot.patient && (
                        <div className="text-[10px] text-center text-muted-foreground truncate w-full px-1">
                            {slot.patient.name || slot.patient.mobile}
                        </div>
                    )}

                    <div className="w-full pt-1 space-y-1">
                        {slot.status === 'AVAILABLE' || slot.status === 'RESERVED_MANUAL' ? (
                            <>
                                {bookingId === slot.id ? (
                                    <div className="space-y-2 p-2 border rounded bg-muted/50 animate-in fade-in zoom-in-95 duration-200">
                                        <input
                                            placeholder="Mobile"
                                            className="w-full text-[10px] px-2 py-1 border rounded"
                                            value={patientInfo.mobile}
                                            onChange={e => setPatientInfo({ ...patientInfo, mobile: e.target.value })}
                                        />
                                        <input
                                            placeholder="Name (Optional)"
                                            className="w-full text-[10px] px-2 py-1 border rounded"
                                            value={patientInfo.name}
                                            onChange={e => setPatientInfo({ ...patientInfo, name: e.target.value })}
                                        />
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                className="flex-1 h-6 text-[9px]"
                                                onClick={() => handleAction(slot.id, () => onReserve(slot.id, patientInfo))}
                                                disabled={loadingId === slot.id || !patientInfo.mobile}
                                            >
                                                Book
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 px-2 text-[9px]"
                                                onClick={() => setBookingId(null)}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="w-full h-8 text-[10px]"
                                            onClick={() => setBookingId(slot.id)}
                                            disabled={loadingId === slot.id}
                                        >
                                            Book Patient
                                        </Button>
                                        <div className="flex gap-1">
                                            {slot.status === 'AVAILABLE' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="flex-1 h-8 text-[10px] text-muted-foreground"
                                                    title="Manual Reserve (Generic)"
                                                    onClick={() => handleAction(slot.id, () => onReserve(slot.id))}
                                                    disabled={loadingId === slot.id}
                                                >
                                                    R
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="flex-1 h-8 text-[10px] text-muted-foreground hover:text-foreground"
                                                onClick={() => handleAction(slot.id, () => onRelease(slot.id))}
                                                disabled={loadingId === slot.id}
                                            >
                                                Undo
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="w-full h-8 text-[10px] text-muted-foreground hover:text-foreground"
                                onClick={() => handleAction(slot.id, () => onRelease(slot.id))}
                                disabled={loadingId === slot.id}
                            >
                                {loadingId === slot.id ? "..." : "Undo/Release"}
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
