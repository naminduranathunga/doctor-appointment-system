import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value

    // Paths that require authentication
    const protectedPaths = [
        '/api/v1/doctors',
        '/api/v1/schedules',
        '/admin',
    ]

    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    if (isProtectedPath) {
        if (!token) {
            if (request.nextUrl.pathname.startsWith('/api')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        const decoded = verifyToken(token)
        if (!decoded) {
            if (request.nextUrl.pathname.startsWith('/api')) {
                return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/api/v1/:path*',
        '/admin/:path*',
    ],
}
