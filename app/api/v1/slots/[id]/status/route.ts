import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
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

        const { id } = await params
        const { status } = await req.json()

        if (!['SERVING', 'COMPLETED', 'NO_SHOW'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        // Fetch the slot to get scheduleId
        const slot = await prisma.slot.findUnique({
            where: { id }
        })

        if (!slot) {
            return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
        }

        // Atomic transaction for state change
        await prisma.$transaction(async (tx) => {
            if (status === 'SERVING') {
                // If starting to serve, mark currently serving slots in this schedule as COMPLETED
                await tx.slot.updateMany({
                    where: {
                        scheduleId: slot.scheduleId,
                        status: 'SERVING',
                        id: { not: id }
                    },
                    data: { status: 'COMPLETED' }
                })
            }

            // Update target slot
            await tx.slot.update({
                where: { id },
                data: { status }
            })
        })

        const updatedSlot = await prisma.slot.findUnique({ where: { id } })
        return NextResponse.json(updatedSlot)

    } catch (error) {
        console.error('Slot status update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
