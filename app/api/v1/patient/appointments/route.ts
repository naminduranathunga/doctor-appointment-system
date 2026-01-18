import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = await verifyToken(token)
        if (!decoded || decoded.role !== 'PATIENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const appointments = await prisma.slot.findMany({
            where: {
                patientId: decoded.id,
                status: {
                    in: ['BOOKED', 'SERVING', 'COMPLETED']
                }
            },
            include: {
                schedule: {
                    include: {
                        doctor: {
                            include: {
                                medicalCenter: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                time: 'desc'
            }
        })

        const enhancedAppointments = await Promise.all(appointments.map(async (appt) => {
            const servingSlot = await prisma.slot.findFirst({
                where: {
                    scheduleId: appt.scheduleId,
                    status: 'SERVING'
                },
                select: { slotNumber: true }
            })
            return {
                ...appt,
                currentServingToken: servingSlot?.slotNumber || null
            }
        }))

        return NextResponse.json(enhancedAppointments)
    } catch (error) {
        console.error('Patient appointments API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
