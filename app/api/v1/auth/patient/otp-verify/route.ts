import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { otpStore } from '../otp-request/route'

export async function POST(req: Request) {
    try {
        const { mobile, otp } = await req.json()

        if (!mobile || !otp) {
            return NextResponse.json({ error: 'Mobile and OTP are required' }, { status: 400 })
        }

        const storedData = otpStore.get(mobile)

        if (!storedData) {
            return NextResponse.json({ error: 'OTP not requested or expired' }, { status: 400 })
        }

        if (storedData.expires < Date.now()) {
            otpStore.delete(mobile)
            return NextResponse.json({ error: 'OTP expired' }, { status: 400 })
        }

        if (storedData.otp !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
        }

        otpStore.delete(mobile)

        let patient = await prisma.patient.findUnique({
            where: { mobile }
        })

        if (!patient) {
            patient = await prisma.patient.create({
                data: { mobile }
            })
        }

        const token = signToken({ id: patient.id, mobile: patient.mobile, role: 'PATIENT' })

        const response = NextResponse.json({ message: 'Login successful', user: { id: patient.id, mobile: patient.mobile } })
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/'
        })

        return response
    } catch (error) {
        console.error('OTP verify error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
