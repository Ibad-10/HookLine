import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import CallScreen from "@/components/CallScreen";
import { SCENARIOS } from "@/lib/call/scenarios";

export default async function CallPage({ params }: PageProps<"/call/[id]">) {
  const sc = SCENARIOS[(await params).id];
  if (!sc) notFound();
  const jar = await cookies();
  const slow = (jar.get("hl_prefs")?.value ?? "").includes("slow");
  const sessionId = `call-${jar.get("hl_id")?.value ?? "guest"}-${Date.now()}`;
  return <CallScreen sc={sc} sessionId={sessionId} slow={slow} />;
}
