import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'



export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: slotId } = await params
        const token = req.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = await verifyToken(token)
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { type, patientMobile, patientName } = await req.json()

        let updateData: any = {
            status: type === 'MANUAL' ? 'RESERVED_MANUAL' : 'BOOKED'
        }

        if (patientMobile) {
            // Find or create patient
            const patient = await prisma.patient.upsert({
                where: { mobile: patientMobile },
                update: { name: patientName || undefined },
                create: {
                    mobile: patientMobile,
                    name: patientName || 'Walk-in Patient'
                }
            })
            updateData.patientId = patient.id
            updateData.status = 'BOOKED'
        }

        const slot = await prisma.slot.update({
            where: { id: slotId },
            data: updateData,
            include: {
                patient: true,
                schedule: {
                    include: {
                        doctor: {
                            include: {
                                medicalCenter: true
                            }
                        }
                    }
                }
            }
        })

        // Mock SMS if booked
        if (slot.status === 'BOOKED' && slot.patient) {
            const message = `Booking Confirmed: You have an appointment with ${slot.schedule.doctor.name} at ${slot.schedule.doctor.medicalCenter.name} on ${new Date(slot.time).toLocaleDateString()} at ${new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Slot #${slot.slotNumber}.`
            console.log(`\n--- MOCK BOOKING SMS ---`)
            console.log(`To: ${slot.patient.mobile}`)
            console.log(`Message: ${message}`)
            console.log(`-------------------------\n`)
        }

        return NextResponse.json(slot)
    } catch (error) {
        console.error('Slot reservation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
