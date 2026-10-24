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
    <figure className="rounded-[22px] bg-card border border-line p-4 shadow-[0_2px_0_var(--line)]">
      <figcaption className="flex items-center gap-3 pb-3 border-b border-line mb-3">
        <span aria-hidden className="grid place-items-center size-10 rounded-full bg-navy text-white font-bold">
          {from.slice(0, 1).toUpperCase()}
        </span>
        <span className="font-bold">{from}</span>
        <span className="ml-auto text-sm text-ink-soft">Text message</span>
      </figcaption>
      <p className="text-[1.1rem] leading-relaxed bg-mist rounded-2xl rounded-tl-sm p-3">
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
              className={`inline rounded px-0.5 -mx-0.5 cursor-pointer hover:bg-mark/40 ${marked ? "mark" : ""}`}
            >
              {c.text}
            </button>
          );
        })}
      </p>
    </figure>
  );
}
