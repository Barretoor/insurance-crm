import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register");

  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
});

export const config = {
  // All /api/* routes are excluded: they handle their own auth (session checks
  // or Twilio signature verification) and must return real HTTP status codes
  // instead of an HTML redirect to /login — Twilio's webhooks in particular
  // never carry a session cookie and would otherwise never reach our handlers.
  // PWA assets (manifest, service worker, icons) are excluded too: browsers
  // fetch these without a session - e.g. from the login screen - and must
  // get the real file, not an HTML redirect.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/).*)",
  ],
};
