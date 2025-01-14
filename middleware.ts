import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value

    // Redirect authenticated users away from login page
    if (request.nextUrl.pathname === '/admin') {
        if (token) {
            try {
                await jose.jwtVerify(token, secret)
                return NextResponse.redirect(
                    new URL('/admin/edit', request.url)
                )
            } catch {
                // Invalid token, let them access login page
            }
        }
    }

    // Protect admin edit page
    if (request.nextUrl.pathname.startsWith('/admin/edit')) {
        if (!token) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }

        try {
            await jose.jwtVerify(token, secret)
        } catch {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
    }

    // Protect API routes
    if (
        request.nextUrl.pathname.startsWith('/api') &&
        ['POST', 'PUT', 'DELETE'].includes(request.method)
    ) {
        // Skip protection for login endpoint
        if (request.nextUrl.pathname === '/api/login') {
            return NextResponse.next()
        }

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
            await jose.jwtVerify(token, secret)
            return NextResponse.next()
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/api/:path*'],
}
