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

        const doctors = await prisma.doctor.findMany({
            where: { medicalCenterId: decoded.id }
        })

        return NextResponse.json(doctors)
    } catch (error) {
        console.error('Doctor fetch error:', error)
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

        const { name } = await req.json()

        if (!name) {
            return NextResponse.json({ error: 'Missing name' }, { status: 400 })
        }

        const doctor = await prisma.doctor.create({
            data: {
                name,
                medicalCenterId: decoded.id,
                specialty: ""
            }
        })

        return NextResponse.json(doctor)
    } catch (error) {
        console.error('Doctor creation error:', error)
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
            return NextResponse.json({ error: 'Missing doctor id' }, { status: 400 })
        }

        // Ensure doctor exists & belongs to this medical center
        const doctor = await prisma.doctor.findUnique({ where: { id } })
        if (!doctor || doctor.medicalCenterId !== decoded.id) {
            return NextResponse.json({ error: 'Doctor not found or unauthorized' }, { status: 404 })
        }

        // Check if there are any booked slots first to prevent accidental deletions
        const bookedSlots = await prisma.slot.count({
            where: {
                schedule: { doctorId: id },
                status: 'BOOKED'
            }
        })

        if (bookedSlots > 0) {
            return NextResponse.json({ error: 'Cannot delete doctor with active bookings' }, { status: 400 })
        }

        await prisma.doctor.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Doctor deletion error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
