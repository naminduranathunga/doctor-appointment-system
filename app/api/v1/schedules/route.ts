import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const token = req.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token)
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { doctorId, date, startTime, endTime, slotDuration, bufferTime } = await req.json()

        if (!doctorId || !date || !startTime || !endTime || !slotDuration) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const start = new Date(startTime)
        const end = new Date(endTime)
        const totalDurationMs = end.getTime() - start.getTime()
        const perSlotMs = (slotDuration + (bufferTime || 0)) * 60 * 1000
        const totalSlots = Math.floor(totalDurationMs / perSlotMs)

        if (totalSlots <= 0) {
            return NextResponse.json({ error: 'Invalid time range for given duration' }, { status: 400 })
        }

        const schedule = await prisma.schedule.create({
            data: {
                doctorId,
                date: new Date(date),
                startTime: start,
                endTime: end,
                slotDuration,
                bufferTime: bufferTime || 0,
                totalSlots,
            }
        })

        const slotsData = []
        for (let i = 0; i < totalSlots; i++) {
            const slotTime = new Date(start.getTime() + i * perSlotMs)
            slotsData.push({
                scheduleId: schedule.id,
                slotNumber: i + 1,
                time: slotTime,
                status: 'AVAILABLE' as const
            })
        }

        await prisma.slot.createMany({
            data: slotsData
        })

        return NextResponse.json({ ...schedule, slotsGenerated: slotsData.length })
    } catch (error) {
        console.error('Schedule creation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
