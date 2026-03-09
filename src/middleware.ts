export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/app/:path*",
    "/api/me/:path*",
    "/api/projects/:path*",
    "/api/feedback/:path*",
    "/api/chat/:path*",
    "/api/testers/:path*",
    "/api/testing-requests/:path*",
    "/api/notifications/:path*",
    "/api/admin/:path*"
  ]
};
