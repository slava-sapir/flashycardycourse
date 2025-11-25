import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/decks(.*)",
  "/cards(.*)",
  "/study(.*)",
  "/api/decks(.*)",
  "/api/cards(.*)",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Redirect auth routes to homepage since we use modals
  if (isAuthRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect routes and redirect to homepage if not authenticated
  if (isProtectedRoute(req)) {
    const homeUrl = new URL("/", req.url);
    await auth.protect({
      unauthenticatedUrl: homeUrl.toString(),
      unauthorizedUrl: homeUrl.toString(),
    });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

