"use client";
// Sly, Hookline's mascot, floating on every screen. Her eyes follow you, she dodges when you
// get close, taps make her hop and roll, her face reacts to lessons and calls, and she speaks
// short pre-voiced lines. Minimising whirls her like a tornado into a box that flips into a
// small face button; on phones she starts as that button. Settings can switch her off.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Minus, Volume2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { hiddenOn, lineFor, SLY_LINES, type Mood, type SlyLine } from "@/lib/sly";

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
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [mood, setMood] = useState<Mood>("neutral");
  const [line, setLine] = useState<SlyLine>("home");
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [dodge, setDodge] = useState({ x: 0, y: 0 });
  const [hop, setHop] = useState(0);
  const [bubble, setBubble] = useState(true);
  const [asleep, setAsleep] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wake = () => {
    setAsleep(false);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setAsleep(true), 12000);
  };
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) setAsleep(true);
    else wake();
    return () => clearTimeout(idle.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!bubble || typeof window === "undefined" || window.innerWidth >= 768) return;
    const t = setTimeout(() => setBubble(false), 6000);
    return () => clearTimeout(t);
  }, [bubble, line, open]);
  const box = useRef<HTMLDivElement>(null);
  const avatar = useRef<HTMLButtonElement>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  // On or off (Settings), and open or closed (phones start closed to save space).
  useEffect(() => {
    const sync = () => setOn(read("hl_sly") !== "off");
    sync();
    const saved = read("hl_sly_open");
    setOpen(saved ? saved === "1" : window.innerWidth >= 768);
    setReady(true);
    window.addEventListener("sly-pref", sync);
    return () => window.removeEventListener("sly-pref", sync);
  }, []);

  useEffect(() => { setLine(lineFor(path)); setMood("neutral"); setBubble(true); }, [path]);

  // Reactions from lessons and calls.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const react = (e: Event) => {
      const d = (e as CustomEvent<{ line: SlyLine; mood?: Mood }>).detail;
      setLine(d.line);
      setBubble(true);
      setMood(d.mood ?? (d.line === "right" ? "happy" : d.line === "wrong" ? "dizzy" : d.line === "stopped" ? "serious" : "neutral"));
      if (d.line === "right") setHop((h) => h + 1);
      clearTimeout(t);
      t = setTimeout(() => setMood("neutral"), 3500);
    };
    window.addEventListener("sly", react);
    return () => { window.removeEventListener("sly", react); clearTimeout(t); };
  }, []);

  // Eyes follow the pointer; she slides away when it comes close (not on touch).
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType === "mouse") wake();
      const r = (box.current ?? avatar.current)?.getBoundingClientRect();
      if (!r) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy, dist = Math.hypot(dx, dy) || 1;
      setLook({ x: Math.max(-1, Math.min(1, dx / 160)), y: Math.max(-1, Math.min(1, dy / 160)) });
      // She sits in the bottom-right corner, so she escapes up and to the left, never off-screen.
      if (e.pointerType === "mouse" && dist < 90 && !still) setDodge({ x: -Math.max(24, Math.abs(dx / dist) * 56), y: -Math.max(18, Math.abs(dy / dist) * 44) });
      else if (dist > 170) setDodge({ x: 0, y: 0 });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [still]);

  function say(k: SlyLine) {
    audio.current?.pause();
    const a = new Audio(`/audio/sly/${k}.mp3`);
    audio.current = a;
    setMood("happy");
    a.onended = () => setMood("neutral");
    a.play().catch(() => setMood("neutral"));
  }

  function tap() {
    setBubble(true);
    setHop((h) => h + 1);
    setMood("wink");
    setLine("tap");
    setTimeout(() => setMood("neutral"), 1600);
  }

  const toggle = (v: boolean) => { setOpen(v); write("hl_sly_open", v ? "1" : "0"); };

  if (!ready || !on || hiddenOn(path)) return null;
  const tornado = still ? { opacity: 0 } : { rotateY: [0, 360, 720, 1080], scale: [1, 0.8, 0.45, 0.15], y: [0, -14, -24, 10], opacity: [1, 1, 1, 0] };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6" style={{ perspective: 600 }}>
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.div
            key="sly-open"
            className="pointer-events-auto flex flex-col items-end gap-2"
            initial={still ? { opacity: 0 } : { rotateY: -1080, scale: 0.15, y: 10, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, y: 0, opacity: 1 }}
            exit={tornado}
            transition={{ duration: 0.75, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <AnimatePresence>
            {bubble && <motion.div layout initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} className="glass max-w-[15rem] rounded-2xl rounded-br-sm px-3.5 py-2.5 text-sm leading-snug shadow-lg">
              <p>{SLY_LINES[line]}</p>
              <div className="mt-1.5 flex items-center justify-end gap-1">
                <button type="button" onClick={() => say(line)} aria-label="Hear Sly say this" className="grid size-9 place-items-center rounded-full bg-tide text-white hover:brightness-110"><Volume2 className="size-4" aria-hidden /></button>
                <button type="button" onClick={() => toggle(false)} aria-label="Minimise Sly" className="grid size-9 place-items-center rounded-full hover:bg-secondary"><Minus className="size-4" aria-hidden /></button>
              </div>
            </motion.div>}
            </AnimatePresence>
            <motion.div
              ref={box}
              animate={{ x: dodge.x, y: dodge.y }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <motion.button
                type="button"
                key={hop}
                onClick={tap}
                aria-label="Sly, Hookline's mascot. Tap to say hello"
                className="sly-bob block cursor-pointer"
                initial={false}
                animate={still || hop === 0 ? {} : { y: [0, -34, 0], rotateY: [0, 360], scaleY: [1, 1.08, 1] }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <SlyArt mood={mood} look={look} size={104} />
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.button
            key="sly-closed"
            type="button"
            onClick={() => toggle(true)}
            aria-label="Open Sly, Hookline's mascot"
            ref={avatar}
            className="pointer-events-auto relative grid size-16 place-items-center rounded-full bg-gradient-to-b from-white to-[#e8f2fc] shadow-lg ring-1 ring-line"
            initial={still ? { opacity: 0 } : { rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={still ? { opacity: 0 } : { rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <span className="grid size-[58px] place-items-center overflow-hidden rounded-full">
              <SlyArt mood={asleep ? "sleepy" : "neutral"} look={asleep ? { x: 0, y: 0 } : look} size={58} faceOnly />
            </span>
            {asleep && !still && (
              <span aria-hidden className="pointer-events-none absolute -right-1 -top-3 font-semibold text-tide">
                <span className="sly-z absolute right-3 top-3 text-[11px]">z</span>
                <span className="sly-z absolute right-1 top-0 text-[14px]" style={{ animationDelay: ".6s" }}>z</span>
                <span className="sly-z absolute -right-1 -top-3 text-[17px]" style={{ animationDelay: "1.2s" }}>Z</span>
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
