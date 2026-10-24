import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({ variable: "--font-atkinson", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hookline: practise spotting scams",
  description: "Short lessons from this week's scam reports, and practice calls you can hang up on.",
};

export const viewport: Viewport = { themeColor: "#13223b", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const prefs = (await cookies()).get("hl_prefs")?.value ?? "";
  return (
    <html lang="en" className={`${atkinson.variable} ${prefs.includes("large") ? "large-text" : ""} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
