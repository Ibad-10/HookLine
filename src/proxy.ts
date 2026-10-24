import { clerkMiddleware } from "@clerk/nextjs/server";

// Makes the Clerk session available everywhere. Each page and route checks access itself.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp3)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
