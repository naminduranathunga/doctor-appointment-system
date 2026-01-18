import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'



export async function POST(req: NextRequest) {
    try {
        const now = new Date()
        const intervals = [
            { label: '15 minutes', mins: 15 },
            { label: '1 hour', mins: 60 },
            { label: '5 hours', mins: 300 },
            { label: '1 day', mins: 1440 },
        ]

        const remindersSent = []

        for (const interval of intervals) {
            const targetTimeStart = new Date(now.getTime() + (interval.mins - 5) * 60 * 1000)
            const targetTimeEnd = new Date(now.getTime() + (interval.mins + 5) * 60 * 1000)

            const slots = await prisma.slot.findMany({
                where: {
                    status: 'BOOKED',
                    time: {
                        gte: targetTimeStart,
                        lte: targetTimeEnd
                    }
                },
                include: {
                    patient: true,
                    schedule: {
                        include: {
                            doctor: {
                                include: {
                                    medicalCenter: true
                                }
                            }
                        }
                    }
                }
            })

            for (const slot of slots) {
                if (slot.patient?.mobile) {
                    const message = `Reminder: You have an appointment with ${slot.schedule.doctor.name} at ${slot.schedule.doctor.medicalCenter.name} in ${interval.label}.`
                    console.log(`\n--- MOCK REMINDER SMS ---`)
                    console.log(`To: ${slot.patient.mobile}`)
                    console.log(`Message: ${message}`)
                    console.log(`-------------------------\n`)
                    remindersSent.push({ mobile: slot.patient.mobile, interval: interval.label })
                }
            }
        }

        return NextResponse.json({ message: 'Reminders processed', count: remindersSent.length })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
