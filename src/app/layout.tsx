import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import { cookies } from "next/headers";
import Motion from "@/components/Motion";
import "./globals.css";
import { cn } from "@/lib/utils";

const atkinson = Atkinson_Hyperlegible_Next({ variable: "--font-atkinson", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hookline: practise spotting scams",
  description: "Short lessons from this week's scam reports, and practice calls you can hang up on.",
};

export const viewport: Viewport = { themeColor: "#13223b", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const prefs = (await cookies()).get("hl_prefs")?.value ?? "";
  return (
    <html lang="en" className={cn("antialiased", atkinson.variable, prefs.includes("large") ? "large-text" : "")}>
      <body className="min-h-dvh"><Motion>{children}</Motion></body>
    </html>
  );
}
