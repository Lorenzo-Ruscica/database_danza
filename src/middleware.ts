import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const adminAuth = request.cookies.get('adminAuth')

    // Check if the route is under /admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!adminAuth || adminAuth.value !== 'true') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Check if trying to access login but already logged in
    if (request.nextUrl.pathname === '/login') {
        if (adminAuth && adminAuth.value === 'true') {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
}
