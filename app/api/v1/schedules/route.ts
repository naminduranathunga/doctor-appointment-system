import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'



export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = await verifyToken(token)
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const doctorId = searchParams.get('doctorId')
        const dateStr = searchParams.get('date')

        const where: any = {
            doctor: {
                medicalCenterId: decoded.id
            }
        }

        if (doctorId) where.doctorId = doctorId
        if (dateStr) {
            const date = new Date(dateStr)
            const startOfDay = new Date(date.setHours(0, 0, 0, 0))
            const endOfDay = new Date(date.setHours(23, 59, 59, 999))
            where.date = {
                gte: startOfDay,
                lte: endOfDay
            }
        }

        const schedules = await prisma.schedule.findMany({
            where,
            include: {
                doctor: true,
                _count: {
                    select: { slots: true }
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        })

        return NextResponse.json(schedules)
    } catch (error) {
        console.error('Fetch schedules error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = await verifyToken(token)
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

export async function PATCH(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = await verifyToken(token)
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id, status } = await req.json()

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
        }

        const schedule = await prisma.schedule.update({
            where: {
                id,
                doctor: { medicalCenterId: decoded.id }
            },
            data: { status }
        })

        return NextResponse.json(schedule)
    } catch (error) {
        console.error('Schedule patch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = await verifyToken(token)
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing schedule id' }, { status: 400 })
        }

        // Use transaction to ensure slots are also deleted
        await prisma.$transaction([
            prisma.slot.deleteMany({ where: { scheduleId: id } }),
            prisma.schedule.delete({
                where: {
                    id,
                    doctor: { medicalCenterId: decoded.id }
                }
            })
        ])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Schedule deletion error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
