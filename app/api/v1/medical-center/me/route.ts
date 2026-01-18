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

        const center = await prisma.medicalCenter.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true
            }
        })

        if (!center) {
            return NextResponse.json({ error: 'Medical center not found' }, { status: 404 })
        }

        return NextResponse.json(center)
    } catch (error) {
        console.error('Me API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
