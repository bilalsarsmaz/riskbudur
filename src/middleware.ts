import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Korumalı rotalar
const protectedRoutes = ['/home', '/explore', '/settings', '/bookmarks', '/notifications', '/messages'];
// Public rotalar
const publicRoutes = ['/', '/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Eğer korumalı bir rotaya erişim varsa
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Token yoksa ana sayfaya yönlendir
    if (!token) {
      const url = new URL('/', request.url);
      return NextResponse.redirect(url);
    }
  }

  // Eğer kullanıcı giriş yapmışsa ve public sayfalarına erişmeye çalışıyorsa
  if (publicRoutes.includes(pathname)) {
    // Token varsa home sayfasına yönlendir
    if (token) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    '/explore/:path*',
    '/settings/:path*',
    '/bookmarks/:path*',
    '/notifications/:path*',
    '/messages/:path*',
    '/',
    '/login',
    '/register',
  ],
};
