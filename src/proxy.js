import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = [
    '/register',
    '/login'
]

export async function proxy(req) {
    const { pathname } = req.nextUrl;

    if (
        PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
    ) {
        return NextResponse.next();
    }

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
    }

    const role = token.role;

    if( pathname.startsWith('/owner') && role !== 'OWNER' ){
        const homeUrl = new URL('/', req.url);
        return NextResponse.redirect(homeUrl);
    }

    if( pathname.startsWith('/admin') && role !== 'ADMIN' && role !== 'OWNER' ){
        const homeUrl = new URL('/', req.url);
        return NextResponse.redirect(homeUrl);
    }
    if( pathname.startsWith('/member') && role !== 'MEMBER' ){
        const homeUrl = new URL('/', req.url);
        return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/owner/:path*",
        "/admin/:path*",
        "/member/:path*",
    ],
};