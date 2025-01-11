import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import * as jose from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function GET(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    if (!token) {
        return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    try {
        await jose.jwtVerify(token, secret)
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json()
        const hashedPassword = process.env.ADMIN_PASSWORD

        if (!hashedPassword) {
            return NextResponse.json(
                { error: 'Admin password not configured' },
                { status: 500 }
            )
        }

        const isValid = await bcrypt.compare(password, hashedPassword)
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            )
        }

        const token = await new jose.SignJWT({ role: 'admin' })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('100y')
            .sign(secret)

        const response = NextResponse.json({ success: true })
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 365 * 100,
        })

        return response
    } catch (error) {
        console.error('Error during login:', error)
        return NextResponse.json(
            { error: 'Error during login' },
            { status: 500 }
        )
    }
}
