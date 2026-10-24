import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";

export default function Page() {
  return (
    <AuthShell title="Save your progress" lead="Make a free account. Your starting check comes with you.">
      <SignUp />
    </AuthShell>
  );
}
