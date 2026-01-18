import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: medicalCenterId } = params

        const doctors = await prisma.doctor.findMany({
            where: { medicalCenterId }
        })

        return NextResponse.json(doctors)
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
