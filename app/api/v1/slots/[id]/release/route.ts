import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = req.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = await verifyToken(token)
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: slotId } = await params

        const slot = await prisma.slot.findUnique({
            where: { id: slotId },
            include: { schedule: { include: { doctor: true } } }
        })

        if (!slot) {
            return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
        }

        // Verify that the slot belongs to this admin's medical center
        if (slot.schedule.doctor.medicalCenterId !== decoded.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const updatedSlot = await prisma.slot.update({
            where: { id: slotId },
            data: {
                status: 'AVAILABLE',
                patientId: null
            }
        })

        return NextResponse.json(updatedSlot)
    } catch (error) {
        console.error('Slot release error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
