"use client";
// A fake text message. In red-flag mode, words are tappable; a tap marks the
// whole suspicious phrase with the highlighter.

export type Chunk = { text: string; flag: boolean };

export function chunks(text: string, flags: string[]): Chunk[] {
  const out: Chunk[] = [];
  let rest = text;
  while (rest) {
    const hits = flags.map((f) => ({ f, i: rest.indexOf(f) })).filter((h) => h.i >= 0).sort((a, b) => a.i - b.i);
    if (!hits.length) {
      out.push(...rest.split(/(\s+)/).filter(Boolean).map((t) => ({ text: t, flag: false })));
      break;
    }
    const { f, i } = hits[0];
    out.push(...rest.slice(0, i).split(/(\s+)/).filter(Boolean).map((t) => ({ text: t, flag: false })));
    out.push({ text: f, flag: true });
    rest = rest.slice(i + f.length);
  }
  return out;
}

export default function MessageMock({
  from,
  text,
  flags,
  tapped,
  onTap,
  revealed,
}: {
  from: string;
  text: string;
  flags?: string[];
  tapped?: Set<number>;
  onTap?: (i: number) => void;
  revealed?: boolean;
}) {
  const parts = chunks(text, flags ?? []);
  return (
    <figure className="overflow-hidden rounded-[26px] bg-card shadow-[0_24px_60px_-28px_rgba(0,40,80,0.45)] ring-1 ring-line">
      <figcaption className="flex items-center gap-3 bg-gradient-to-b from-[#eaf4fc] to-card px-4 pb-3 pt-4 dark:from-[#0b2a44]">
        <span aria-hidden className="grid size-10 place-items-center rounded-full bg-gradient-to-b from-[#1a8ff0] to-[#0068ad] font-semibold text-white">
          {from.slice(0, 1).toUpperCase()}
        </span>
        <span className="leading-tight">
          <span className="block font-semibold">{from}</span>
          <span className="block text-xs text-ink-soft">Text message · now</span>
        </span>
      </figcaption>
      <p className="mx-4 mb-4 rounded-[20px] rounded-tl-md bg-secondary p-4 text-[1.15rem] leading-[1.9]">
        {parts.map((c, i) => {
          if (/^\s+$/.test(c.text)) return c.text;
          const isTapped = tapped?.has(i);
          const marked = (revealed && c.flag) || (!revealed && isTapped);
          const wrong = revealed && isTapped && !c.flag;
          if (!onTap || revealed)
            return (
              <span key={i} className={`${marked ? "mark" : ""} ${wrong ? "underline decoration-alarm decoration-wavy" : ""}`}>
                {c.text}
              </span>
            );
          return (
            <button
              key={i}
              type="button"
              onClick={() => onTap(i)}
              aria-pressed={isTapped}
              className={`-mx-0.5 inline cursor-pointer rounded px-0.5 underline decoration-ink-soft/40 decoration-dotted decoration-2 underline-offset-[6px] transition-colors hover:bg-mark/35 hover:decoration-transparent ${marked ? "mark decoration-transparent" : ""}`}
            >
              {c.text}
            </button>
          );
        })}
      </p>
    </figure>
  );
}
