import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const token = req.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const where: any = {}
        if (decoded.role === 'PATIENT') {
            where.patientId = decoded.id
        } else {
            where.slot = {
                schedule: {
                    doctor: {
                        medicalCenterId: decoded.id
                    }
                }
            }
        }

        const bookings = await prisma.slot.findMany({
            where: {
                status: 'BOOKED',
                ...where
            },
            include: {
                patient: true,
                schedule: {
                    include: {
                        doctor: true
                    }
                }
            }
        })

        return NextResponse.json(bookings)
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const token = req.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { slotId } = await req.json()

        const result = await prisma.$transaction(async (tx: any) => {
            const slot = await tx.slot.findUnique({
                where: { id: slotId },
                include: { schedule: true }
            })

            if (!slot || slot.status !== 'AVAILABLE') {
                throw new Error('Slot not available')
            }

            return await tx.slot.update({
                where: { id: slotId },
                data: {
                    status: 'BOOKED',
                    patientId: decoded.id
                }
            })
        })

        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
