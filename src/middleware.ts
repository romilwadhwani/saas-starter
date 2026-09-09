import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/invite/(.*)",
  ],

  // Second middleware layer: org-check runs after Clerk confirms the user is authenticated.
  // We cannot query Prisma here (Edge runtime), so the DB membership check is enforced in
  // the dashboard layout (src/app/dashboard/[orgSlug]/layout.tsx — Phase 4).
  // What we CAN enforce here: unauthenticated users never reach /dashboard or /onboarding.
  afterAuth(auth, req) {
    const { pathname } = req.nextUrl;

    // Already handled by Clerk — authenticated users hitting public auth pages
    // get redirected to onboarding by Clerk's AFTER_SIGN_IN_URL env var.
    if (auth.isPublicRoute) return NextResponse.next();

    // Authenticated user accessing a protected route — let through.
    // The dashboard layout will enforce the org membership check.
    if (auth.userId) return NextResponse.next();

    // Unauthenticated user on a protected route — send to sign-in.
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signIn);
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
