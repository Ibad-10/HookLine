import { cookies } from "next/headers";
import { z } from "zod";

const Body = z.object({ large: z.boolean(), slow: z.boolean(), mute: z.boolean().default(false) });

export async function POST(req: Request) {
  const b = Body.safeParse(await req.json().catch(() => null));
  if (!b.success) return Response.json({ error: "bad request" }, { status: 400 });
  const v = [b.data.large && "large", b.data.slow && "slow", b.data.mute && "mute"].filter(Boolean).join(",");
  (await cookies()).set("hl_prefs", v, { sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return Response.json({ ok: true });
}
