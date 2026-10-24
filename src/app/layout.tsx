import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { cookies } from "next/headers";
import Motion from "@/components/Motion";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], style: ["italic"], weight: ["300"] });

export const metadata: Metadata = {
  title: "Hookline: practise spotting scams",
  description: "Short lessons from this week's scam reports, and practice calls you can hang up on.",
};

export const viewport: Viewport = { themeColor: "#000000", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const prefs = (await cookies()).get("hl_prefs")?.value ?? "";
  return (
    <html lang="en" className={cn("antialiased", geist.variable, fraunces.variable, prefs.includes("large") && "large-text", prefs.includes("dark") && "dark")}>
      <body className="min-h-dvh"><ClerkProvider appearance={{ variables: { colorPrimary: "#0068ad", borderRadius: "0.75rem", fontFamily: "var(--font-geist)", fontSize: "1rem" } }}><Motion>{children}</Motion></ClerkProvider></body>
    </html>
  );
}
