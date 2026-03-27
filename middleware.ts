import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Main (non-agency) domains — add your own domains here
const MAIN_DOMAINS = [
  "localhost",
  "myxtravel.com.tr",
  "www.myxtravel.com.tr",
  "xturizm.com",
  "www.xturizm.com",
  "myxtravel.vercel.app",
];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const cleanHost = hostname.split(":")[0]; // remove port

  // Check if this is the main site
  const isMainSite = MAIN_DOMAINS.some((d) => cleanHost === d || cleanHost.endsWith(".vercel.app"));

  if (!isMainSite && cleanHost) {
    // This is an agency domain — pass it via header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-agency-domain", cleanHost);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and API internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
