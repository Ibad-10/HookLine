import Link from "next/link";

export default function InfoPage({ title, em, children }: { title: string; em: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/" className="inline-flex min-h-11 items-center gap-1 font-semibold">‹ Home</Link>
      <h1 className="mt-6 text-[2.6rem] font-medium leading-none tracking-[-0.045em]">
        {title} <span className="font-serif font-light italic">{em}</span>
      </h1>
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-soft [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-ink">{children}</div>
    </main>
  );
}
