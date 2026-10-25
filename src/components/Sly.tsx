"use client";
// Sly, Hookline's mascot: a small avatar you can drag anywhere. Her eyes follow you, she naps
// with floating Z's when idle, and her face reacts to lessons and calls. Tap her to open
// "Ask Sly" for real questions (answered through Mubit); it whirls away like a tornado.
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import { Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { hiddenOn, moodFor, type Mood, type SlyLine } from "@/lib/sly";

const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };

export function SlyArt({ mood = "neutral", look = { x: 0, y: 0 }, size = 120, faceOnly = false }: { mood?: Mood; look?: { x: number; y: number }; size?: number; faceOnly?: boolean }) {
  const id = useId().replace(/:/g, "");
  const g = (n: string) => `url(#${n}${id})`;
  const ex = look.x * 3, ey = look.y * 2.5;
  const pill = (x: number) => <rect x={x + ex} y={84 + ey} width="12" height="20" rx="6" fill="#0b2a44" />;
  const glint = (x: number) => <circle cx={x + 8.5 + ex} cy={89 + ey} r="2.4" fill="#7fd0ff" />;
  const faces: Record<Mood, React.ReactNode> = {
    neutral: <>{pill(74)}{pill(114)}{glint(74)}{glint(114)}<path d="M94 126 q6 5 12 0" fill="none" stroke="#0b2a44" strokeWidth="2.6" strokeLinecap="round" /></>,
    happy: <><path d="M74 96 q6 -9 12 0 M114 96 q6 -9 12 0" fill="none" stroke="#0b2a44" strokeWidth="4.5" strokeLinecap="round" /><path d="M92 123 q8 10 16 0 z" fill="#0b2a44" /></>,
    wink: <>{pill(74)}{glint(74)}<path d="M113 95 q7 -6 14 0" fill="none" stroke="#0b2a44" strokeWidth="4.5" strokeLinecap="round" /><path d="M93 125 q7 7 14 0" fill="none" stroke="#0b2a44" strokeWidth="2.6" strokeLinecap="round" /></>,
    surprised: <><circle cx={80 + ex} cy={94 + ey} r="8" fill="#0b2a44" /><circle cx={120 + ex} cy={94 + ey} r="8" fill="#0b2a44" /><ellipse cx="100" cy="127" rx="5" ry="6" fill="#0b2a44" /></>,
    sleepy: <><path d="M74 96 q6 5 12 0 M114 96 q6 5 12 0" fill="none" stroke="#0b2a44" strokeWidth="4" strokeLinecap="round" /><ellipse cx="100" cy="127" rx="3" ry="2" fill="#0b2a44" /></>,
    dizzy: <><path d="M73 87 l14 14 M87 87 l-14 14 M113 87 l14 14 M127 87 l-14 14" stroke="#0b2a44" strokeWidth="3.6" strokeLinecap="round" /><path d="M92 128 q4 -4 8 0 q4 4 8 0" fill="none" stroke="#0b2a44" strokeWidth="2.6" strokeLinecap="round" /></>,
    worried: <>{pill(74)}{pill(114)}{glint(74)}{glint(114)}<path d="M94 129 q6 -5 12 0" fill="none" stroke="#0b2a44" strokeWidth="2.6" strokeLinecap="round" /><path d="M72 80 l14 4 M128 80 l-14 4" stroke="#0b2a44" strokeWidth="3" strokeLinecap="round" /></>,
    serious: <><rect x={74 + ex} y={88 + ey} width="12" height="14" rx="6" fill="#0b2a44" /><rect x={114 + ex} y={88 + ey} width="12" height="14" rx="6" fill="#0b2a44" /><path d="M71 84 l16 -4 M129 84 l-16 -4" stroke="#0b2a44" strokeWidth="3" strokeLinecap="round" /><path d="M95 127 h10" stroke="#0b2a44" strokeWidth="2.6" strokeLinecap="round" /></>,
  };
  return (
    <svg width={size} height={faceOnly ? size : size * 1.1} viewBox={faceOnly ? "26 8 148 148" : "0 0 200 220"} aria-hidden>
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6cc4ff" /><stop offset=".45" stopColor="#2a92dd" /><stop offset="1" stopColor="#156fb6" /></linearGradient>
        <linearGradient id={`v${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#e6edf6" /></linearGradient>
        <radialGradient id={`s${id}`} cx="30%" cy="20%" r="50%"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <linearGradient id={`c${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffd98a" /><stop offset=".5" stopColor="#e39a22" /><stop offset="1" stopColor="#fff0c4" /></linearGradient>
      </defs>
      {!faceOnly && <ellipse cx="100" cy="210" rx="44" ry="6" fill="#0b2a44" opacity=".13" />}
      <path d="M52 66 L60 22 Q62 16 68 20 L92 40 L108 40 L132 20 Q138 16 140 22 L148 66 Q160 90 160 130 Q160 200 100 200 Q40 200 40 130 Q40 90 52 66 Z" fill="#124f80" />
      <path d="M54 62 L61 24 Q63 19 68 23 L92 42 L108 42 L132 23 Q137 19 139 24 L146 62 Q158 88 158 126 Q158 194 100 194 Q42 194 42 126 Q42 88 54 62 Z" fill={g("b")} />
      <path d="M63 34 L66 50 L80 40 Z M137 34 L134 50 L120 40 Z" fill="#ff9fb4" opacity=".85" />
      <ellipse cx="78" cy="70" rx="30" ry="22" fill={g("s")} />
      <path d="M66 58 Q60 92 64 128" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="7" strokeLinecap="round" />
      <rect x="56" y="76" width="88" height="44" rx="22" fill="#cdd8e6" />
      <rect x="56" y="73" width="88" height="44" rx="22" fill={g("v")} />
      <path d="M44 96 h12 M144 96 h12" stroke="#0b2a44" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="74" cy="126" rx="7" ry="4" fill="#ffb3c1" opacity=".8" />
      <ellipse cx="126" cy="126" rx="7" ry="4" fill="#ffb3c1" opacity=".8" />
      <path d="M60 132 h-16 M60 138 l-15 4 M140 132 h16 M140 138 l15 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".7" />
      <g className="sly-blink">{faces[mood]}</g>
      {!faceOnly && <>
        <path d="M62 146 q38 16 76 0" fill="none" stroke={g("c")} strokeWidth="6" strokeLinecap="round" />
        <circle cx="100" cy="161" r="6" fill={g("c")} stroke="#c97a0c" strokeWidth="2" />
        <circle cx="44" cy="160" r="11" fill="#fff" stroke="#cdd8e6" strokeWidth="2" />
        <circle cx="156" cy="160" r="11" fill="#fff" stroke="#cdd8e6" strokeWidth="2" />
      </>}
    </svg>
  );
}

export default function Sly() {
  const path = usePathname();
  const still = useReducedMotion();
  const [on, setOn] = useState(true);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<Mood>("neutral");
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [asleep, setAsleep] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [side, setSide] = useState({ up: true, left: true });
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  type Answer = { verdict: "likely_scam" | "unsure" | "looks_ok" | "question"; answer: string; flags: string[]; do: string };
  const [reply, setReply] = useState<Answer | null>(null);
  const [askError, setAskError] = useState("");
  const avatar = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const controls = useDragControls();
  const press = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [held, setHeld] = useState(false);

  // Long-press picks her up (she lifts, grows and wiggles); then she can be dragged anywhere.
  function pressStart(e: React.PointerEvent) {
    clearTimeout(press.current);
    const ev = e.nativeEvent;
    press.current = setTimeout(() => {
      dragged.current = true;
      setHeld(true);
      setOpen(false);
      setMood("surprised");
      controls.start(ev, { snapToCursor: false });
    }, 350);
  }
  const pressEnd = () => clearTimeout(press.current);
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const wake = () => {
    setAsleep(false);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setAsleep(true), 12000);
  };

  // On or off (Settings), and where she was last dropped.
  useEffect(() => {
    const sync = () => setOn(read("hl_sly") !== "off");
    sync();
    try { const p = JSON.parse(read("hl_sly_pos") ?? "null"); if (p) setPos(p); } catch {}
    if (window.matchMedia("(hover: none)").matches) setAsleep(true);
    else wake();
    setReady(true);
    window.addEventListener("sly-pref", sync);
    return () => { window.removeEventListener("sly-pref", sync); clearTimeout(idle.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setOpen(false); setReply(null); }, [path]);

  // Her face reacts to lessons and calls, silently.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const react = (e: Event) => {
      const d = (e as CustomEvent<{ line: SlyLine; mood?: Mood }>).detail;
      setAsleep(false);
      setMood(d.mood ?? moodFor(d.line));
      clearTimeout(t);
      t = setTimeout(() => setMood("neutral"), 3000);
    };
    window.addEventListener("sly", react);
    return () => { window.removeEventListener("sly", react); clearTimeout(t); };
  }, []);

  // Eyes follow the pointer.
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType === "mouse") wake();
      const r = avatar.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      setLook({ x: Math.max(-1, Math.min(1, dx / 160)), y: Math.max(-1, Math.min(1, dy / 160)) });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Leave room at the bottom of every page so Sly never sits on a button.
  useEffect(() => {
    const show = ready && on && !hiddenOn(path);
    document.body.style.paddingBottom = show ? "84px" : "";
    return () => { document.body.style.paddingBottom = ""; };
  }, [ready, on, path]);

  function openPanel() {
    if (dragged.current) return; // that was a drag, not a tap
    const r = avatar.current?.getBoundingClientRect();
    if (r) setSide({ up: r.top > window.innerHeight / 2, left: r.left > window.innerWidth / 2 });
    setOpen(true);
    setAsleep(false);
    setMood("happy");
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || thinking) return;
    setThinking(true);
    setAskError("");
    setMood("serious");
    const r = await fetch("/api/sly", { method: "POST", body: JSON.stringify({ text: question }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setThinking(false);
    if (!r?.ok) { setAskError(j.error ?? "Sorry, try again?"); setMood("worried"); return; }
    setReply(j as Answer);
    setMood(j.verdict === "likely_scam" ? "surprised" : j.verdict === "looks_ok" ? "happy" : j.verdict === "unsure" ? "worried" : "wink");
  }

  if (!ready || !on || hiddenOn(path)) return null;
  const tornado = still ? { opacity: 0 } : { rotateY: [0, 360, 720, 1080], scale: [1, 0.8, 0.45, 0.1], opacity: [1, 1, 1, 0] };

  return (
    <motion.div
      ref={avatar}
      drag
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{ left: -window.innerWidth + 96, right: 0, top: -window.innerHeight + 96, bottom: 0 }}
      onDragEnd={(_, info) => {
        setHeld(false);
        setMood("happy");
        setTimeout(() => setMood("neutral"), 1200);
        const next = { x: pos.x + info.offset.x, y: pos.y + info.offset.y };
        setPos(next);
        write("hl_sly_pos", JSON.stringify(next));
        setTimeout(() => (dragged.current = false), 50);
      }}
      style={{ x: pos.x, y: pos.y, perspective: 600, touchAction: "none" }}
      className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6"
    >
      <AnimatePresence>
        {open && (
          <motion.section
            key="ask"
            aria-label="Ask Sly"
            className={`absolute w-[18rem] max-w-[calc(100vw-2rem)] rounded-2xl bg-card p-3.5 text-sm leading-snug shadow-2xl ring-1 ring-line ${side.up ? "bottom-full mb-3" : "top-full mt-3"} ${side.left ? "right-0" : "left-0"}`}
            initial={still ? { opacity: 0 } : { rotateY: -1080, scale: 0.1, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            exit={tornado}
            transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
            onPointerDownCapture={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">Would you like to ask me a question?</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid size-8 place-items-center rounded-full hover:bg-secondary"><X className="size-4" aria-hidden /></button>
            </div>
            {reply ? (
              <div aria-live="polite" className="mt-2">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${reply.verdict === "likely_scam" ? "bg-alarm text-white" : reply.verdict === "looks_ok" ? "bg-safe text-white" : reply.verdict === "unsure" ? "bg-mark text-black" : "bg-secondary"}`}>
                  {reply.verdict === "likely_scam" ? "Likely a scam" : reply.verdict === "looks_ok" ? "Looks OK" : reply.verdict === "unsure" ? "Not sure: be careful" : "Sly says"}
                </span>
                <p className="mt-1.5">{reply.answer}</p>
                {reply.flags.length > 0 && <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-ink-soft">{reply.flags.map((f) => <li key={f}>{f}</li>)}</ul>}
                {reply.do && <p className="mt-1.5 font-medium">{reply.do}</p>}
                <button type="button" onClick={() => { setReply(null); setQuestion(""); }} className="mt-2 text-xs font-semibold text-tide">Ask something else</button>
              </div>
            ) : (
              <form onSubmit={ask} className="mt-2 space-y-2">
                <label htmlFor="ask-sly" className="block text-ink-soft">Paste a message you got, or ask me about scams and staying safe.</label>
                <textarea id="ask-sly" value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} maxLength={2000} autoFocus
                  placeholder="e.g. Is this text from my bank real?" className="w-full resize-none rounded-xl bg-background px-2.5 py-2 text-sm ring-1 ring-line" />
                <p className="text-xs text-ink-soft">Numbers are hidden before I read it. Never share codes or passwords.</p>
                {askError && <p role="status" className="text-xs text-alarm">{askError}</p>}
                <button type="submit" disabled={thinking || !question.trim()} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-tide font-semibold text-white disabled:opacity-50">
                  <Send className="size-4" aria-hidden />{thinking ? "Sly is looking…" : "Ask Sly"}
                </button>
              </form>
            )}
          </motion.section>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        onClick={openPanel}
        onPointerDown={pressStart}
        onPointerUp={pressEnd}
        onPointerLeave={pressEnd}
        onContextMenu={(e) => e.preventDefault()}
        animate={held && !still ? { scale: 1.18, y: -10, rotate: [0, -6, 6, -4, 0], boxShadow: "0 18px 30px rgba(11,42,68,0.28)" } : { scale: 1, y: 0, rotate: 0, boxShadow: "0 6px 14px rgba(11,42,68,0.14)" }}
        transition={held ? { rotate: { duration: 0.5, repeat: Infinity }, default: { type: "spring", stiffness: 400, damping: 18 } } : { type: "spring", stiffness: 400, damping: 22 }}
        aria-label="Sly, Hookline's mascot. Tap to ask her about a scam; press and hold to move her"
        aria-expanded={open}
        className={`relative grid size-14 select-none sm:size-16 place-items-center rounded-full bg-gradient-to-b from-white to-[#e8f2fc] ring-1 ring-line ${held ? "cursor-grabbing" : "cursor-pointer"}`}
      >
        <span className="grid size-[50px] place-items-center overflow-hidden rounded-full sm:size-[58px]">
          <SlyArt mood={asleep && mood === "neutral" ? "sleepy" : mood} look={asleep ? { x: 0, y: 0 } : look} size={58} faceOnly />
        </span>
        {asleep && mood === "neutral" && !still && (
          <span aria-hidden className="pointer-events-none absolute -right-1 -top-3 font-semibold text-tide">
            <span className="sly-z absolute right-3 top-3 text-[11px]">z</span>
            <span className="sly-z absolute right-1 top-0 text-[14px]" style={{ animationDelay: ".6s" }}>z</span>
            <span className="sly-z absolute -right-1 -top-3 text-[17px]" style={{ animationDelay: "1.2s" }}>Z</span>
          </span>
        )}
      </motion.button>
    </motion.div>
  );
}
