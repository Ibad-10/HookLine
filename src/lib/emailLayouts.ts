// Several practice-email looks, so the same red flags arrive dressed differently each time.
// Every layout escapes all text, has exactly one link (the review page) and the practice footer.
import type { Email } from "./tasks/mailer";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const PALETTES = ["#1d4ed8", "#b91c1c", "#047857", "#7c3aed", "#c2410c", "#0f766e"];

const footer = (m: Email) =>
  `<p style="margin-top:40px;border-top:1px solid #ddd;padding-top:12px;font-size:12px;color:#777">This is a Hookline practice email you opted in to. ${esc(m.brand)} is made up. Turn practice emails off in Hookline Settings at any time.</p>`;
const paras = (m: Email, style = "") => m.paragraphs.map((t) => `<p style="${style}">${esc(t)}</p>`).join("");
const button = (m: Email, link: string, c: string, radius = 6) =>
  `<a href="${link}" style="display:inline-block;background:${c};color:#fff;padding:12px 22px;border-radius:${radius}px;text-decoration:none;font-weight:bold">${esc(m.button)}</a>`;

export const LAYOUTS: ((m: Email, link: string, c: string) => string)[] = [
  // Plain letter
  (m, link, c) => `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#111">
<p style="font-size:20px;font-weight:bold;color:${c}">${esc(m.brand)}</p><p>Hello,</p>${paras(m)}<p>${button(m, link, c)}</p><p style="color:#555">${esc(m.brand)}</p>${footer(m)}</div>`,
  // Header bar, like a bank or service alert
  (m, link, c) => `<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e5e5;color:#222">
<div style="background:${c};color:#fff;padding:18px 24px;font-size:18px;font-weight:bold">${esc(m.brand)}</div>
<div style="padding:24px"><p style="font-size:18px;font-weight:bold;margin-top:0">${esc(m.subject)}</p>${paras(m, "line-height:1.5")}<p style="text-align:center;margin:28px 0">${button(m, link, c, 4)}</p></div>
<div style="padding:0 24px 16px">${footer(m)}</div></div>`,
  // Warning box, like a security notice
  (m, link, c) => `<div style="font-family:Verdana,sans-serif;max-width:540px;margin:auto;color:#222;font-size:14px">
<p style="font-weight:bold;color:${c};letter-spacing:.5px">${esc(m.brand)}</p>
<div style="border-left:5px solid #f59e0b;background:#fffbeb;padding:14px 18px;margin:12px 0"><b>Action required:</b> ${esc(m.subject)}</div>
<p>Dear customer,</p>${paras(m)}<p>${button(m, link, c, 2)}</p><p style="color:#666">Kind regards,<br>${esc(m.brand)} Team</p>${footer(m)}</div>`,
  // Receipt or notice card
  (m, link, c) => `<div style="font-family:Georgia,serif;max-width:500px;margin:auto;background:#f6f6f6;padding:24px;color:#222">
<div style="background:#fff;border-radius:10px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,.08)">
<p style="text-align:center;font-size:22px;color:${c};margin:0 0 16px">${esc(m.brand)}</p>
<p style="text-align:center;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px">Notice</p>${paras(m, "text-align:center")}
<p style="text-align:center;margin-top:24px">${button(m, link, c, 24)}</p></div>${footer(m)}</div>`,
];

export function renderEmail(m: Email, link: string, pick = Math.random()): string {
  const layout = LAYOUTS[Math.floor(pick * LAYOUTS.length) % LAYOUTS.length];
  const colour = PALETTES[Math.floor(pick * 997) % PALETTES.length];
  return layout(m, link, colour);
}
