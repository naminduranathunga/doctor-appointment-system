import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const query = searchParams.get('query')

        const where: any = {}

        if (query) {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { address: { contains: query, mode: 'insensitive' } }
            ]
        }

        const centers = await prisma.medicalCenter.findMany({
            where,
            select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                email: true,
                _count: {
                    select: { doctors: true }
                }
            }
        })

        return NextResponse.json(centers)
    } catch (error) {
        console.error('Public centers API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
