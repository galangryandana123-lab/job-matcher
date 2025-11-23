import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // requests per window

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : "anonymous"
  return `ratelimit:${ip}`
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 }
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count }
}

export async function middleware(req: NextRequest) {
  const response = NextResponse.next()

  // === SECURITY HEADERS ===
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  )

  // CSP Header - adjust as needed
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com;"
  )

  // === RATE LIMITING FOR API ROUTES ===
  if (req.nextUrl.pathname.startsWith("/api")) {
    const rateLimitKey = getRateLimitKey(req)
    const { allowed, remaining } = checkRateLimit(rateLimitKey)

    response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS))
    response.headers.set("X-RateLimit-Remaining", String(remaining))

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      )
    }

    // === REQUEST SIZE CHECK ===
    const contentLength = req.headers.get("content-length")
    const maxSize = req.nextUrl.pathname.includes("/cv/upload")
      ? 5 * 1024 * 1024  // 5MB for file uploads
      : 1 * 1024 * 1024  // 1MB for other requests

    if (contentLength && parseInt(contentLength) > maxSize) {
      return new NextResponse(
        JSON.stringify({ error: "Request body too large" }),
        { status: 413, headers: { "Content-Type": "application/json" } }
      )
    }
  }

  // === PROTECTED ROUTES ===
  const protectedPaths = ["/dashboard", "/jobs"]
  const isProtectedPath = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
