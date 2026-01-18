"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function PatientAuthPage() {
    const [mobile, setMobile] = useState("")
    const [otp, setOtp] = useState("")
    const [step, setStep] = useState(1) // 1: Mobile, 2: OTP
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/v1/auth/patient/otp-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setStep(2)
            alert("OTP sent! Please check the server console/terminal.")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/v1/auth/patient/otp-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile, otp }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            router.push("/")
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">
                        {step === 1 ? "Patient Login" : "Verify OTP"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {step === 1 ? (
                        <form onSubmit={handleRequestOtp} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mobile Number</label>
                                <Input
                                    required
                                    placeholder="07xxxxxxxx"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Sending..." : "Send OTP"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Enter 6-digit OTP</label>
                                <Input
                                    required
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Verifying..." : "Verify & Login"}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setStep(1)}
                                disabled={loading}
                            >
                                Back
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
