import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Custom logic if needed, but 'authorized' callback handles the check.
    // We can also double check here but `authorized` is the cleaner place for access control.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token) return false;

        const path = req.nextUrl.pathname;

        // Path protection logic
        if (
          (path.startsWith("/dashboard/users") ||
           path.startsWith("/dashboard/settings")) &&
          token.role !== "SUPERADMIN"
        ) {
          return false; // Reject access
        }

        return true; // Allow access
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/api/upload/:path*"],
};
