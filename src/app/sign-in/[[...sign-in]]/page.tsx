import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";

export default function Page() {
  return (
    <AuthShell title="Welcome" em="back" lead="Sign in to carry on with your path.">
      <SignIn fallbackRedirectUrl="/home" signUpFallbackRedirectUrl="/home" />
    </AuthShell>
  );
}
