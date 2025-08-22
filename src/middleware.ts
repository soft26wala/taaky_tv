import { NextResponse, NextRequest } from 'next/server'

// Middleware runs on every request matching the config.matcher
export function middleware(request: NextRequest) {
  // const sessionCookie = request.cookies.get("next-auth.session-token")?.value
  const sessionCookie = request.cookies.get("__Secure-next-auth.session-token")?.value

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/loginpage", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/"], // ✅ protect /call
}