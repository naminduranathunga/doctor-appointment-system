import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: doctorId } = params
        const { searchParams } = new URL(req.url)
        const dateStr = searchParams.get('date')

        if (!dateStr) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 })
        }

        const date = new Date(dateStr)
        const startOfDay = new Date(date.setHours(0, 0, 0, 0))
        const endOfDay = new Date(date.setHours(23, 59, 59, 999))

        const slots = await prisma.slot.findMany({
            where: {
                schedule: {
                    doctorId,
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                status: 'AVAILABLE'
            },
            orderBy: {
                time: 'asc'
            }
        })

        return NextResponse.json(slots)
    } catch (error) {
        console.error('Fetch slots error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
