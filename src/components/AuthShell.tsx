import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";

// Sign-in and sign-up frame (design canvas: Sign in).
export default function AuthShell({ title, em, lead, children }: { title: string; em: string; lead: string; children: React.ReactNode }) {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden px-4 pb-8 pt-4">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[32rem] -translate-x-1/2" style={{ background: "radial-gradient(closest-side, rgba(0,153,255,0.18), transparent)" }} />
      <nav className="relative flex items-center justify-between">
        <Link href="/" aria-label="Back to the start" className="flex h-11 items-center gap-1 rounded-full pl-2 pr-3.5 font-semibold">
          <ChevronLeft className="size-5" strokeWidth={2.4} aria-hidden />
          Back
        </Link>
        <Logo />
      </nav>
      <h1 className="relative mt-9 text-[2.6rem] font-medium leading-none tracking-[-0.05em]">
        {title} <span className="font-serif font-light italic tracking-[-0.02em]">{em}</span>
      </h1>
      <p className="relative mt-3 text-lg text-ink-soft">{lead}</p>
      <div className="relative mt-7 w-full [&_.cl-cardBox]:w-full [&_.cl-cardBox]:shadow-none [&_.cl-rootBox]:w-full">{children}</div>
    </main>
  );
}
