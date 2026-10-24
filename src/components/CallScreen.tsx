"use client";
// Practice call. The engine and Gatekeeper run here in the browser: only masked
// text ever leaves the device. Caller audio: pre-made clip if present, else the
// browser's own voice. Replies: hold to talk (browser speech-to-text) or type.
import { CommitStrategy, RealtimeEvents, Scribe, type RealtimeConnection } from "@elevenlabs/client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { applyIntent, startCall, step } from "@/lib/call/engine";
import type { CallState, Scenario } from "@/lib/call/types";

type SR = { start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; lang: string; interimResults: boolean };

function speechRecognition(): SR | null {
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return C ? new C() : null;
}

export default function CallScreen({ sc, sessionId, slow }: { sc: Scenario; sessionId: string; slow: boolean }) {
  const [state, setState] = useState<CallState>(() => startCall(sc));
  const [answered, setAnswered] = useState(false);
  const [listening, setListening] = useState(false);
  const [typed, setTyped] = useState("");
  const [thinking, setThinking] = useState(false);
  const [canTalk, setCanTalk] = useState(false);
  const rec = useRef<SR | null>(null);
  const scribe = useRef<RealtimeConnection | null>(null);
  const pressed = useRef(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const spoken = useRef(0);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => setCanTalk(!!navigator.mediaDevices?.getUserMedia || !!speechRecognition()), []);

  // Speak each new caller line once.
  useEffect(() => {
    if (!answered) return;
    const lines = state.transcript.filter((t) => t.who === "caller");
    if (lines.length <= spoken.current) return;
    const last = lines[lines.length - 1];
    spoken.current = lines.length;
    speak(last.text, last.node);
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [state.transcript, answered]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state.outcome) {
      sessionStorage.setItem("hl_last_call", JSON.stringify({ state, scenarioId: sc.id }));
      const t = setTimeout(() => (window.location.href = `/debrief?s=${sc.id}`), state.outcome === "stopped" ? 400 : 3500);
      return () => clearTimeout(t);
    }
  }, [state.outcome]); // eslint-disable-line react-hooks/exhaustive-deps

  function speak(text: string, node?: string) {
    window.speechSynthesis?.cancel();
    audio.current?.pause();
    const clip = new Audio(`/audio/${sc.id}/${node}.mp3`);
    clip.playbackRate = slow ? 0.8 : 1;
    clip.onerror = () => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = slow ? 0.8 : 1;
      u.lang = "en-GB";
      window.speechSynthesis?.speak(u);
    };
    audio.current = clip;
    clip.play().catch(() => clip.onerror?.(new Event("error")));
  }

  async function reply(text: string, input: "voice" | "typed") {
    if (!text.trim() || state.outcome || thinking) return;
    const r = step(state, sc, text, input);
    setState(r.state);
    if (!r.needCoach) return;
    setThinking(true);
    try {
      const res = await fetch("/api/call/coach", { method: "POST", body: JSON.stringify({ scenarioId: sc.id, node: r.state.node, masked: r.masked, sessionId }) });
      const move = await res.json();
      if (move.stop) setState((s) => ({ ...s, outcome: "stopped", checkpoints: [...s.checkpoints, "gave_secret"] }));
      else {
        setState((s) => {
          const said = move.say ? { ...s, transcript: [...s.transcript, { who: "caller" as const, text: move.say }] } : s;
          return applyIntent(said, sc, move.intent ?? "stall");
        });
      }
    } finally {
      setThinking(false);
    }
  }

  // Hold to talk: ElevenLabs Scribe first (works on every browser), browser speech-to-text as fallback.
  async function hold() {
    pressed.current = true;
    setListening(true);
    try {
      const res = await fetch("/api/scribe-token", { method: "POST" });
      if (!res.ok) throw new Error("no scribe");
      const { token } = await res.json();
      const conn = Scribe.connect({
        token,
        modelId: "scribe_v2_realtime",
        commitStrategy: CommitStrategy.MANUAL,
        languageCode: "en",
        keyterms: sc.keyterms,
        microphone: { echoCancellation: true, noiseSuppression: true },
      });
      conn.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (d: { text: string }) => {
        conn.close();
        setListening(false);
        reply(d.text, "voice");
      });
      scribe.current = conn;
      if (!pressed.current) release(); // let go before the connection opened
    } catch {
      const r = speechRecognition();
      if (!r) return setListening(false);
      r.lang = "en-GB";
      r.interimResults = false;
      r.onresult = (e) => reply(e.results[0][0].transcript, "voice");
      r.onend = () => setListening(false);
      rec.current = r;
      r.start();
    }
  }

  function release() {
    pressed.current = false;
    if (scribe.current) {
      scribe.current.commit();
      scribe.current = null;
    } else rec.current?.stop();
  }

  function hangUp() {
    window.speechSynthesis?.cancel();
    audio.current?.pause();
    setState((s) => (s.outcome ? s : applyIntent(s, sc, "hang_up")));
  }

  if (!answered)
    return (
      <main className="flex min-h-dvh flex-col items-center justify-between bg-navy px-5 py-10 text-white">
        <p className="rounded-full bg-mark px-4 py-1 font-bold text-navy">Practice call</p>
        <div className="text-center">
          <div className="relative mx-auto grid size-28 place-items-center">
            <span aria-hidden className="ring absolute inset-0 rounded-full bg-safe/50" />
            <span className="relative grid size-28 place-items-center rounded-full bg-navy-2 text-4xl font-extrabold">{sc.caller[0]}</span>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold">{sc.caller}</h1>
          <p className="mt-2 text-white/80">Incoming call</p>
        </div>
        <div className="w-full max-w-md space-y-4">
          <p className="text-center text-white/85">
            This is practice. Never say a real card number, code or password. You can hang up or ask &ldquo;is this real?&rdquo; at any time.
          </p>
          <button type="button" onClick={() => setAnswered(true)} className="btn-chunky w-full bg-safe text-lg text-white" style={{ "--btn-edge": "#0f5a37" } as React.CSSProperties}>
            Answer call
          </button>
          <Link href="/" className="block py-2 text-center font-bold text-white/80">Not now</Link>
        </div>
      </main>
    );

  return (
    <main className="flex h-dvh flex-col bg-navy text-white">
      <header className="flex items-center gap-3 px-5 pb-3 pt-5">
        <span className="grid size-12 place-items-center rounded-full bg-navy-2 text-xl font-extrabold">{sc.caller[0]}</span>
        <div className="flex-1">
          <p className="font-extrabold">{sc.caller}</p>
          <p className="text-sm text-white/70">{state.outcome ? "Call ended" : thinking ? "Caller is thinking…" : "On call"}</p>
        </div>
        <span className="rounded-full bg-mark px-3 py-1 text-sm font-bold text-navy">Practice</span>
      </header>

      <section aria-live="polite" aria-label="Call captions" className="flex-1 space-y-3 overflow-y-auto px-5 py-3">
        {state.transcript.map((t, k) => (
          <p key={k} className={`max-w-[85%] rounded-2xl px-4 py-3 text-[1.05rem] leading-snug ${t.who === "caller" ? "bg-navy-2" : "ml-auto bg-tide"}`}>
            {t.text}
          </p>
        ))}
        {state.outcome === "stopped" && (
          <p role="alert" className="rounded-2xl bg-mark px-4 py-3 font-bold text-navy">
            We stopped the call there: it sounded like real details. Nothing was saved.
          </p>
        )}
        <div ref={end} />
      </section>

      {!state.outcome && (
        <footer className="space-y-3 bg-navy-2 px-5 pb-6 pt-4">
          <form onSubmit={(e) => { e.preventDefault(); reply(typed, "typed"); setTyped(""); }} className="flex gap-2">
            <label className="sr-only" htmlFor="reply">Type what you would say</label>
            <input id="reply" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type what you'd say" autoComplete="off"
              className="min-h-14 flex-1 rounded-2xl bg-white px-4 text-lg text-ink" />
            <button className="rounded-2xl bg-tide px-4 font-bold">Send</button>
          </form>
          <div className="flex gap-3">
            {canTalk && (
              <button type="button" onPointerDown={hold} onPointerUp={release} onPointerLeave={() => listening && release()}
                className={`btn-chunky flex-1 text-white ${listening ? "bg-safe" : "bg-tide"}`}>
                {listening ? "Listening… let go to send" : "Hold to talk"}
              </button>
            )}
            <button type="button" onClick={hangUp} className="btn-chunky flex-1 bg-alarm text-white" style={{ "--btn-edge": "#8e2219" } as React.CSSProperties}>
              Hang up
            </button>
          </div>
        </footer>
      )}
    </main>
  );
}
