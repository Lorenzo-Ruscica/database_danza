import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()
        const validUsername = process.env.ADMIN_USERNAME || "admin"
        const validPassword = process.env.ADMIN_PASSWORD || "admin123"

        // Verifica sia username che password
        if (username === validUsername && password === validPassword) {
            const response = NextResponse.json({ success: true })
            response.cookies.set('adminAuth', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 1 settimana
            })
            return response
        }

        return NextResponse.json({ success: false, error: "Credenziali errate" }, { status: 401 })
    } catch (e) {
        return NextResponse.json({ success: false, error: "Errore server" }, { status: 500 })
    }
}
