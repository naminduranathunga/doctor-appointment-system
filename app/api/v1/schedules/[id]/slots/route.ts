import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
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

        const { id: scheduleId } = await params

        const slots = await prisma.slot.findMany({
            where: {
                scheduleId,
                schedule: {
                    doctor: {
                        medicalCenterId: decoded.id
                    }
                }
            },
            include: {
                patient: true
            },
            orderBy: {
                time: 'asc'
            }
        })

        return NextResponse.json(slots)
    } catch (error) {
        console.error('Fetch schedule slots error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
