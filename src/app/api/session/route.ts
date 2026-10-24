import { cookies } from "next/headers";
import { z } from "zod";
import { COOKIE, createLearner } from "@/lib/learner";

const Body = z.object({
  nickname: z.string().trim().min(1).max(40),
  age_band: z.enum(["under-35", "35-64", "65+", "skip"]),
  services: z.array(z.enum(["online_banking", "parcels", "marketplace", "dating", "crypto", "job_hunting"])).max(6),
});

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return Response.json({ error: "Please add a name to continue." }, { status: 400 });
  const id = await createLearner(body.data);
  (await cookies()).set(COOKIE, id, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return Response.json({ ok: true });
}
