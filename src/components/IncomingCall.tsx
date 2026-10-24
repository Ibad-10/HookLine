// Practice call shown as an incoming call (design canvas: Home).
import { ChevronRight, Phone, PhoneOff } from "lucide-react";
import Link from "next/link";
import type { Scenario } from "@/lib/call/types";

export default function IncomingCall({ main, other }: { main: Scenario; other?: Scenario }) {
  return (
    <section
      aria-label="Practice call"
      className="relative overflow-hidden rounded-[28px] p-5 text-white ring-1 ring-white/10"
      style={{ background: "radial-gradient(120% 80% at 50% 0%, #0b2a44 0%, #000 60%)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">Incoming practice call</span>
        <span className="rounded-full bg-mark px-2.5 py-1 text-xs font-semibold text-black">Practice</span>
      </div>
      <div className="mt-5 flex flex-col items-center text-center">
        <div aria-hidden className="relative grid size-24 place-items-center">
          <span className="call-ring absolute inset-0 rounded-full ring-2 ring-glow/60" />
          <span className="call-ring absolute inset-0 rounded-full ring-2 ring-glow/60" style={{ animationDelay: ".8s" }} />
          <span className="grid size-20 place-items-center rounded-full bg-gradient-to-b from-[#1f1f1f] to-[#0a0a0a] text-3xl font-semibold ring-1 ring-white/15">
            {main.caller[0]}
          </span>
        </div>
        <p className="mt-3.5 text-2xl font-medium tracking-[-0.03em]">{main.brand}?</p>
        <p className="mt-1 text-white/60">{main.title}. Can you spot the trick?</p>
      </div>
      <div className="mt-6 flex justify-around">
        <a href="#path" className="flex flex-col items-center gap-2 text-sm text-white/80">
          <span className="lift grid size-16 place-items-center rounded-full bg-alarm"><PhoneOff className="size-6" aria-hidden /></span>
          Later
        </a>
        <Link href={`/call/${main.id}`} className="flex flex-col items-center gap-2 text-sm font-semibold">
          <span className="wiggle grid size-16 place-items-center rounded-full bg-safe shadow-[0_0_0_8px_rgba(15,122,70,0.25)]">
            <Phone className="size-6" aria-hidden />
          </span>
          Answer
        </Link>
      </div>
      {other && (
        <Link href={`/call/${other.id}`} className="mt-5 flex items-center justify-between rounded-full bg-white/[0.06] px-4 py-3 text-white/85 ring-1 ring-white/10 hover:bg-white/10">
          Other call: {other.title.toLowerCase()}
          <ChevronRight className="size-5" aria-hidden />
        </Link>
      )}
    </section>
  );
}
