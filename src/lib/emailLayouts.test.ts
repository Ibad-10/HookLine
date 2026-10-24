import { expect, test } from "vitest";
import { LAYOUTS, renderEmail } from "./emailLayouts";

const m = { brand: "Brightwell <Energy>", subject: "Refund", paragraphs: ["You are owed £86.", "Claim today."], button: "Claim", flags: [] };

test("every layout escapes text, has one link to the review page and the practice footer", () => {
  LAYOUTS.forEach((_, i) => {
    const html = renderEmail(m, "https://hookline.test/practice/abc", (i + 0.01) / LAYOUTS.length);
    expect(html).not.toContain("<Energy>");
    expect(html.match(/href="/g)?.length).toBe(1);
    expect(html).toContain('href="https://hookline.test/practice/abc"');
    expect(html).toContain("Hookline practice email");
  });
});
