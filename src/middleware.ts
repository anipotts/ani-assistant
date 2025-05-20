import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, rateLimitMiddleware } from "./lib/rate-limit";

export async function middleware(request: NextRequest) {
  // Get the pathname from the request
  const pathname = request.nextUrl.pathname;

  // Apply rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    // Get the IP address from the request headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "anonymous";

    // Determine which rate limit to apply
    const config =
      pathname.includes("/api/v1/threads/") && pathname.endsWith("/delegate")
        ? { ...rateLimitMiddleware.aiDelegation, identity: ip }
        : { ...rateLimitMiddleware.standard, identity: ip };

    // Check rate limit
    const rateLimitResult = await rateLimit(config);

    // Set rate limit headers
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString());
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimitResult.reset.toString());

    // If rate limit exceeded, return 429 response
    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: {
            status: 429,
            message: "Rate limit exceeded",
            retryAfter: rateLimitResult.retryAfter,
          },
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": rateLimitResult.retryAfter?.toString() || "60",
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        }
      );
    }

    return response;
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all API routes
    "/api/:path*",
  ],
};
