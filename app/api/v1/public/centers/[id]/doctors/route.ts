import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'



export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: medicalCenterId } = await params

        const doctors = await prisma.doctor.findMany({
            where: { medicalCenterId }
        })

        return NextResponse.json(doctors)
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
