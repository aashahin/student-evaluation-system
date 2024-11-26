import {NextRequest, NextResponse} from "next/server";
import PocketBase from "pocketbase";

export async function middleware(request: NextRequest) {
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];
    const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

    if (isPublicRoute) {
        return NextResponse.next();
    }

    const response = NextResponse.next()
    const authCookie = request.cookies.get('pb_auth');

    if (!authCookie) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
        const client = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_API_URL);
        client.authStore.loadFromCookie(`${authCookie.name}=${authCookie.value}`);
        if (client.authStore.isValid) {
            await client.collection("users").authRefresh();
            return response;
        } else {
            response.cookies.delete('pb_auth');
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    } catch (error) {
        response.cookies.delete('pb_auth');
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|assets|favicon.ico).*)',
    ],
}