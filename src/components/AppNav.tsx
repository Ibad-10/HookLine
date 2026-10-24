"use client";
// Floating glass bar (Visuvate pattern) on every signed-in screen.
import { UserButton } from "@clerk/nextjs";
import { Home, Moon, Settings, Sun, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/progress", label: "Progress", Icon: TrendingUp },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function AppNav() {
  const path = usePathname();
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);

  async function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    const v = document.cookie.match(/hl_prefs=([^;]*)/)?.[1] ?? "";
    await fetch("/api/prefs", {
      method: "POST",
      body: JSON.stringify({ large: v.includes("large"), slow: v.includes("slow"), mute: v.includes("mute"), dark: next }),
    });
  }

  return (
    <nav aria-label="Main" className="glass sticky top-3 z-40 mx-auto mt-3 flex w-[calc(100%-2rem)] max-w-xl items-center gap-1 rounded-full px-2 py-1.5">
      <Link href="/" className="px-3 text-lg font-semibold tracking-tight">Hookline</Link>
      <div className="ml-auto flex items-center gap-1">
        {LINKS.map(({ href, label, Icon }) => (
          <Link key={href} href={href} aria-label={label} aria-current={path === href ? "page" : undefined}
            className={`grid size-11 place-items-center rounded-full transition-colors ${path === href ? "bg-foreground text-background" : "hover:bg-secondary"}`}>
            <Icon className="size-5" aria-hidden />
          </Link>
        ))}
        <button type="button" onClick={toggle} aria-label={dark ? "Use light theme" : "Use dark theme"} className="grid size-11 place-items-center rounded-full hover:bg-secondary">
          {dark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
        </button>
        <div className="grid size-11 place-items-center"><UserButton /></div>
      </div>
    </nav>
  );
}
