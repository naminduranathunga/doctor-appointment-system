import { NextResponse } from 'next/server'

// In a real app, use Redis or a DB table with expiration
const otpStore = new Map<string, { otp: string, expires: number }>()

export async function POST(req: Request) {
    try {
        const { mobile } = await req.json()

        if (!mobile) {
            return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 })
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        // Store OTP for 5 minutes
        otpStore.set(mobile, {
            otp,
            expires: Date.now() + 5 * 60 * 1000
        })

        // Mock SMS send
        console.log(`\n--- MOCK SMS GATEWAY ---`)
        console.log(`To: ${mobile}`)
        console.log(`Message: Your OTP for Doctor Appointment System is ${otp}`)
        console.log(`------------------------\n`)

        return NextResponse.json({ message: 'OTP sent successfully (Check console)' })
    } catch (error) {
        console.error('OTP request error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export { otpStore }
