import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Help Subdomain Logic (help.riskbudur.net -> /help)
  // Localhost check for development: help.localhost:3000
  if (hostname.startsWith("help.") && !url.pathname.startsWith('/api')) {
    // Rewrite to the /help/ folder logic
    // e.g. help.riskbudur.net/about -> internal /help/about
    // We need to clone the URL and set pathname
    url.pathname = `/help${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // API route'ları için CORS header'ları ekle
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://riskbudur.net',
      'https://www.riskbudur.net'
    ];

    // Origin kontrolü
    const responseOrigin = origin && allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0];

    const response = NextResponse.next();

    // CORS header'larını ekle
    response.headers.set('Access-Control-Allow-Origin', responseOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');

    // OPTIONS isteği için hemen cevap ver
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    return response;
  }

  // Pass pathname to headers for Server Components (RootLayout)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-current-path', request.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) -> handled by second block strictly? No, let's keep it broad
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
