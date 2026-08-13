import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  const hostname = req.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "almenu.pro";

  // Extract subdomain
  const subdomain = hostname
    .replace(`.${rootDomain}`, "")
    .replace(`:${req.nextUrl.port}`, "")
    .split(":")[0];

  const pathname = req.nextUrl.pathname;

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If it's the root domain or www or localhost → serve main site
  if (
    subdomain === "www" ||
    subdomain === rootDomain ||
    subdomain === "localhost" ||
    hostname === rootDomain ||
    hostname === "almenu.pro" ||
    hostname.startsWith("localhost") ||
    hostname.endsWith(".vercel.app") ||
    hostname.endsWith(".hostingersite.com")
  ) {
    // Protect dashboard routes
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
      // Auth check will be handled by the layout/page level
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  // It's a subdomain → rewrite to /store/[subdomain] path
  const url = req.nextUrl.clone();
  url.pathname = `/store/${subdomain}${pathname}`;

  const response = NextResponse.rewrite(url);
  response.headers.set("x-subdomain", subdomain);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
