import { auth } from "@clerk/nextjs/server";

// Lessons, calls, progress and settings need an account.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, redirectToSignIn } = await auth();
  if (!isAuthenticated) return redirectToSignIn();
  return children;
}
