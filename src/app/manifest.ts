import type { MetadataRoute } from "next";

// Installable app: Chrome (and Safari "Add to Home Screen") can add Hookline to a phone's home
// screen, where it opens full screen like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hookline: practise spotting scams",
    short_name: "Hookline",
    description: "Three-minute scam-spotting practice from this week's real scams, with practice calls you can talk to.",
    start_url: "/home",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0068ad",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
