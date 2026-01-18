import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { signToken } from '@/lib/auth'



export async function POST(req: Request) {
    try {
        const { mobile, otp, name } = await req.json()

        if (!mobile || !otp) {
            return NextResponse.json({ error: 'Mobile and OTP are required' }, { status: 400 })
        }

        const storedOtp = await prisma.oTP.findUnique({
            where: { mobile }
        })

        if (!storedOtp) {
            return NextResponse.json({ error: 'OTP not requested' }, { status: 400 })
        }

        if (storedOtp.expiresAt < new Date()) {
            await prisma.oTP.delete({ where: { mobile } })
            return NextResponse.json({ error: 'OTP expired' }, { status: 400 })
        }

        if (storedOtp.code !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
        }

        // Clear OTP after successful verification
        await prisma.oTP.delete({ where: { mobile } })

        let patient = await prisma.patient.findUnique({
            where: { mobile }
        })

        if (!patient) {
            patient = await prisma.patient.create({
                data: {
                    mobile,
                    name: name || 'Patient' // Use provided name or default
                }
            })
        } else if (name) {
            // Update name if provided and patient exists (optional, but good for data completeness)
            patient = await prisma.patient.update({
                where: { id: patient.id },
                data: { name }
            })
        }

        const token = await signToken({ id: patient.id, mobile: patient.mobile, role: 'PATIENT' })

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
