import Link from "next/link";

export default function AuthShell({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-4 py-10">
      <Link href="/" className="self-start text-lg font-semibold tracking-tight">Hookline</Link>
      <h1 className="mt-10 text-center text-4xl font-medium tracking-[-0.04em]">{title}</h1>
      <p className="mt-3 text-center text-lg text-ink-soft">{lead}</p>
      <div className="mt-8 w-full [&_.cl-rootBox]:w-full [&_.cl-cardBox]:w-full">{children}</div>
    </main>
  );
}
