import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { signToken } from '@/lib/auth'



export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const existingCenter = await prisma.medicalCenter.findUnique({
            where: { email }
        })

        if (existingCenter) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const center = await prisma.medicalCenter.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        const token = await signToken({ id: center.id, email: center.email, role: 'ADMIN' })

        const response = NextResponse.json({
            message: 'Registration successful',
            user: { id: center.id, name: center.name }
        })

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/'
        })

        return response
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
