"use client";
// Sly, Hookline's mascot. Asleep she's a small round avatar with floating Z's; tap her and she
// wakes as full-body Sly with a chat beside her (a real conversation, answered through Mubit,
// scam topics only, numbers masked). Close the chat and she stays awake, then naps after 10 s
// without a touch. Press and hold to pick her up and drag her anywhere; her face reacts to lessons.
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import { Minus, Send } from "lucide-react";
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
    <svg width="100%" height={faceOnly ? "100%" : undefined} data-size={size} viewBox={faceOnly ? "30 16 140 140" : "0 0 200 220"} preserveAspectRatio="xMidYMid meet" aria-hidden className={faceOnly ? "block" : undefined}>
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
  const [awake, setAwake] = useState(false); // full-body Sly beside you
  const [chatOpen, setChatOpen] = useState(false);
  const [mood, setMood] = useState<Mood>("neutral");
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [side, setSide] = useState({ up: true, left: true });
  const [held, setHeld] = useState(false);
  type Answer = { verdict: "likely_scam" | "unsure" | "looks_ok" | "question"; answer: string; flags: string[]; do: string };
  type Msg = { who: "you"; text: string } | { who: "sly"; text: string; a?: Answer };
  const [chat, setChat] = useState<Msg[]>([{ who: "sly", text: "Hi, I'm Sly! Paste a message you got, or ask me anything about scams." }]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const controls = useDragControls();
  const press = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const nap = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Sly naps 10 s after the last touch or keypress, but never while the chat is open.
  const poke = () => {
    clearTimeout(nap.current);
    nap.current = setTimeout(() => setAwake((a) => (a ? false : a)), 10000);
  };
  useEffect(() => {
    if (!awake || chatOpen) clearTimeout(nap.current);
    else poke();
    return () => clearTimeout(nap.current);
  }, [awake, chatOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const sync = () => setOn(read("hl_sly") !== "off");
    sync();
    try { const p = JSON.parse(read("hl_sly_pos") ?? "null"); if (p) setPos(p); } catch {}
    setReady(true);
    window.addEventListener("sly-pref", sync);
    return () => window.removeEventListener("sly-pref", sync);
  }, []);

  useEffect(() => { setChatOpen(false); }, [path]);
  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" }); }, [chat, thinking]);

  // Her face reacts to lessons and calls, silently; she wakes for a moment to do it.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const react = (e: Event) => {
      const d = (e as CustomEvent<{ line: SlyLine; mood?: Mood }>).detail;
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
      const r = box.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      setLook({ x: Math.max(-1, Math.min(1, dx / 160)), y: Math.max(-1, Math.min(1, dy / 160)) });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  // Leave room at the bottom of every page so Sly never sits on a button.
  useEffect(() => {
    const show = ready && on && !hiddenOn(path);
    document.body.style.paddingBottom = show ? "84px" : "";
    return () => { document.body.style.paddingBottom = ""; };
  }, [ready, on, path]);

  // Long-press picks her up (she lifts, grows and wiggles); then she can be dragged anywhere.
  function pressStart(e: React.PointerEvent) {
    clearTimeout(press.current);
    const ev = e.nativeEvent;
    press.current = setTimeout(() => {
      dragged.current = true;
      setHeld(true);
      setMood("surprised");
      controls.start(ev, { snapToCursor: false });
    }, 350);
  }
  const pressEnd = () => clearTimeout(press.current);

  // Letting go always drops her, even if she was picked up but never moved (no drag-end fires then).
  useEffect(() => {
    if (!held) return;
    const drop = () => {
      setHeld(false);
      setMood("neutral");
      setTimeout(() => (dragged.current = false), 50);
      poke();
    };
    window.addEventListener("pointerup", drop);
    window.addEventListener("pointercancel", drop);
    return () => { window.removeEventListener("pointerup", drop); window.removeEventListener("pointercancel", drop); };
  }, [held]); // eslint-disable-line react-hooks/exhaustive-deps

  function tap() {
    if (dragged.current) return; // that was a drag, not a tap
    const r = box.current?.getBoundingClientRect();
    if (r) setSide({ up: r.top > window.innerHeight / 2, left: r.left > window.innerWidth / 2 });
    setAwake(true);
    setChatOpen(true);
    setMood("happy");
    setTimeout(() => setMood("neutral"), 1200);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || thinking) return;
    const earlier = chat.map((m) => ({ who: m.who, text: m.who === "sly" && m.a ? `${m.a.answer} ${m.a.do}` : m.text }));
    setChat((c) => [...c, { who: "you", text }]);
    setDraft("");
    setThinking(true);
    setMood("serious");
    const r = await fetch("/api/sly", { method: "POST", body: JSON.stringify({ text, earlier }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setThinking(false);
    if (!r?.ok) {
      setChat((c) => [...c, { who: "sly", text: j.error ?? "Sorry, I lost my train of thought. Try again?" }]);
      setMood("worried");
      return;
    }
    const a = j as Answer;
    setChat((c) => [...c, { who: "sly", text: a.answer, a }]);
    setMood(a.verdict === "likely_scam" ? "surprised" : a.verdict === "looks_ok" ? "happy" : a.verdict === "unsure" ? "worried" : "wink");
    setTimeout(() => setMood("neutral"), 2500);
  }

  if (!ready || !on || hiddenOn(path)) return null;
  const tornado = still ? { opacity: 0 } : { rotateY: [0, 360, 720], scale: [1, 0.6, 0.1], opacity: [1, 1, 0] };
  const chip = (v: Answer["verdict"]) =>
    v === "likely_scam" ? ["Likely a scam", "bg-alarm text-white"] : v === "looks_ok" ? ["Looks OK", "bg-safe text-white"] : v === "unsure" ? ["Not sure: be careful", "bg-mark text-black"] : null;

  return (
    <motion.div
      ref={box}
      drag
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{ left: -window.innerWidth + 110, right: 0, top: -window.innerHeight + 140, bottom: 0 }}
      onDragEnd={(_, info) => {
        setHeld(false);
        setMood("happy");
        setTimeout(() => setMood("neutral"), 1200);
        const next = { x: pos.x + info.offset.x, y: pos.y + info.offset.y };
        setPos(next);
        write("hl_sly_pos", JSON.stringify(next));
        setTimeout(() => (dragged.current = false), 50);
        poke();
      }}
      style={{ x: pos.x, y: pos.y, perspective: 700, touchAction: "none" }}
      className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6"
      onPointerDown={poke}
      onKeyDown={poke}
    >
      <AnimatePresence>
        {chatOpen && (
          <motion.section
            key="chat"
            aria-label="Chat with Sly"
            onPointerDownCapture={(e) => e.stopPropagation()}
            className={`absolute flex max-h-[min(22rem,55dvh)] w-[min(18rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl bg-card text-[13px] leading-snug shadow-2xl ring-1 ring-line ${side.up ? "bottom-full mb-3" : "top-full mt-3"} ${side.left ? "right-0" : "left-0"}`}
            initial={still ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={tornado}
            transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <header className="flex items-center gap-2 border-b border-line bg-secondary/60 px-2.5 py-1.5">
              <span className="block size-8 overflow-hidden rounded-full bg-background"><SlyArt mood={mood} size={32} faceOnly /></span>
              <div className="flex-1 leading-tight">
                <p className="font-semibold">Sly</p>
                <p className="text-xs text-ink-soft">{thinking ? "Looking…" : "Scam questions only"}</p>
              </div>
              <button type="button" onClick={() => setChatOpen(false)} aria-label="Minimise chat" className="grid size-9 place-items-center rounded-full hover:bg-background"><Minus className="size-4" aria-hidden /></button>
            </header>
            <div ref={list} aria-live="polite" className="flex-1 space-y-1.5 overflow-y-auto px-2.5 py-2">
              {chat.map((m, i) =>
                m.who === "you" ? (
                  <p key={i} className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-tide px-2.5 py-1.5 text-white">{m.text}</p>
                ) : (
                  <div key={i} className="w-fit max-w-[92%] rounded-2xl rounded-bl-md bg-secondary px-2.5 py-1.5">
                    {m.a && chip(m.a.verdict) && <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${chip(m.a.verdict)![1]}`}>{chip(m.a.verdict)![0]}</span>}
                    <p>{m.text}</p>
                    {m.a && m.a.flags.length > 0 && <ul className="mt-1 list-disc space-y-0.5 pl-4 text-ink-soft">{m.a.flags.map((f) => <li key={f}>{f}</li>)}</ul>}
                    {m.a?.do && <p className="mt-1 font-medium">{m.a.do}</p>}
                  </div>
                ),
              )}
              {thinking && <p className="w-fit rounded-2xl rounded-bl-md bg-secondary px-3 py-2 text-ink-soft">Sly is typing…</p>}
            </div>
            <form onSubmit={send} className="flex items-end gap-1.5 border-t border-line p-2">
              <label htmlFor="sly-chat" className="sr-only">Message Sly</label>
              <textarea id="sly-chat" value={draft} onChange={(e) => { setDraft(e.target.value); poke(); }} rows={1} maxLength={2000} autoFocus
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }}
                placeholder="Paste a message or ask…" className="max-h-24 min-h-10 flex-1 resize-none rounded-xl bg-secondary px-2.5 py-2 text-[13px]" />
              <button type="submit" disabled={thinking || !draft.trim()} aria-label="Send" className="grid size-10 shrink-0 place-items-center rounded-full bg-tide text-white disabled:opacity-50"><Send className="size-4" aria-hidden /></button>
            </form>
            <p className="px-2.5 pb-1.5 text-[10.5px] text-ink-soft">Numbers are hidden before Sly reads them.</p>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={tap}
        onPointerDown={pressStart}
        onPointerUp={pressEnd}
        onPointerLeave={pressEnd}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={awake ? "Sly, Hookline's mascot. Tap to chat; press and hold to move her" : "Sly is asleep. Tap to wake her and chat; press and hold to move her"}
        aria-expanded={chatOpen}
        animate={held && !still ? { scale: 1.15, y: -10, rotate: [0, -6, 6, -4, 0] } : { scale: 1, y: 0, rotate: 0 }}
        transition={held ? { rotate: { duration: 0.5, repeat: Infinity }, default: { type: "spring", stiffness: 400, damping: 18 } } : { type: "spring", stiffness: 400, damping: 22 }}
        className={`relative block select-none ${held ? "cursor-grabbing" : "cursor-pointer"}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {awake ? (
            <motion.span
              key="awake"
              className="sly-bob block drop-shadow-[0_10px_14px_rgba(11,42,68,0.25)]"
              initial={still ? { opacity: 0 } : { scale: 0.4, y: 30, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, y: 0, opacity: 1, rotateY: 0 }}
              exit={still ? { opacity: 0 } : { scale: 0.4, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <span className="block w-[72px] sm:w-[88px]"><SlyArt mood={mood} look={look} size={88} /></span>
            </motion.span>
          ) : (
            <motion.span
              key="asleep"
              className="relative grid size-14 place-items-center rounded-full bg-gradient-to-b from-white to-[#e8f2fc] shadow-lg ring-1 ring-line sm:size-16"
              initial={still ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={still ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <span className="block size-[48px] overflow-hidden rounded-full sm:size-[56px]">
                <SlyArt mood={mood === "neutral" ? "sleepy" : mood} size={58} faceOnly />
              </span>
              {mood === "neutral" && !still && (
                <span aria-hidden className="pointer-events-none absolute -right-1 -top-3 font-semibold text-tide">
                  <span className="sly-z absolute right-3 top-3 text-[11px]">z</span>
                  <span className="sly-z absolute right-1 top-0 text-[14px]" style={{ animationDelay: ".6s" }}>z</span>
                  <span className="sly-z absolute -right-1 -top-3 text-[17px]" style={{ animationDelay: "1.2s" }}>Z</span>
                </span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
