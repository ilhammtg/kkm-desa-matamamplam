import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const isAuth = !!token;

    // 1. Logged in users trying to access Login or Register (Guest features)
    //    OR users trying to go to Landing Page ("/" only)
    if (isAuth) {
      if (path === "/login" || path === "/register") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      // User requested: "jika sudah login... tidak bisa balik ke landing page"
      if (path === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // 2. Unauthenticated protection is handled by 'authorized' callback,
    //    but we can also handle specific logical redirects here if needed.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Protected routes (Dashboard, etc.)
        if (path.startsWith("/dashboard") || path.startsWith("/api/upload")) {
           // If strict role check needed:
           if ((path.startsWith("/dashboard/users") || path.startsWith("/dashboard/settings")) && token?.role !== "SUPERADMIN") {
             return false;
           }

           // STRICT FINANCE CHECK: Only TREASURER can access /dashboard/finance
           if (path.startsWith("/dashboard/finance") && token?.role !== "TREASURER") {
             return false;
           }

           return !!token;
        }

        // Public routes are allowed by default here (return true),
        // but 'middleware' function above handles the "Logged In" redirects.
        return true;
      },
    },
  }
);

export const config = {
  // Match more paths to ensure our logic runs
  matcher: [
    "/", 
    "/login", 
    "/register", 
    "/dashboard/:path*", 
    "/api/upload/:path*"
  ],
};
