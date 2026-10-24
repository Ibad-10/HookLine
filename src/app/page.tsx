import { redirect } from "next/navigation";
import Landing from "@/components/Landing";
import { signedIn } from "@/lib/learner";

// Signed-in people go straight to their Home; everyone else sees the landing page.
export default async function Page() {
  if (await signedIn()) redirect("/home");
  return <Landing />;
}
