"use client";
// Practice call. The engine and Gatekeeper run here in the browser: only masked
// text ever leaves the device. Caller audio: pre-made clip if present, else the
// browser's own voice. Replies: open mic (tap to turn on or off) or type.
import { CommitStrategy, RealtimeEvents, Scribe, type RealtimeConnection } from "@elevenlabs/client";
import { ChevronLeft, Mic, MicOff } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { applyIntent, coachTurn, startCall, step } from "@/lib/call/engine";
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
  const thinkingRef = useRef(false);
  thinkingRef.current = thinking;
  const [canTalk, setCanTalk] = useState(false);
  const [micHint, setMicHint] = useState("");
  const [showType, setShowType] = useState(false);
  const [push, setPush] = useState(false); // noisy room: tap to talk, tap to send
  const pushRef = useRef(false);
  pushRef.current = push;

  // Voice first: answering asks for the microphone straight away. Typing is the fallback.
  function answer() {
    // iPhones only allow sound that starts inside the tap, so the caller's first line plays
    // here, before any await; the microphone prompt follows.
    const p = player();
    p.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAABAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRBqpAAAAAAD/+xBkAA/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
    p.play().catch(() => undefined); // unlocks this player for later lines
    speak(sc.nodes[sc.start].line, sc.start);
    spoken.current = 1;
    setAnswered(true);
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => { stream.getTracks().forEach((t) => t.stop()); if (!pushRef.current) micOn(); }) // permission granted; Scribe opens its own stream
      .catch(() => {
        setMicHint("The microphone isn't available, so you can type your replies instead.");
        setShowType(true);
      }) ?? (setMicHint("The microphone isn't available, so you can type your replies instead."), setShowType(true));
  }
  const rec = useRef<SR | null>(null);
  const scribe = useRef<RealtimeConnection | null>(null);
  const micWanted = useRef(false);
  const busy = useRef(false); // caller talking or thinking: ignore what the mic hears
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
      sessionStorage.setItem("hl_last_call", JSON.stringify({ state, scenarioId: sc.id, sc: sc.generated ? sc : undefined }));
      const t = setTimeout(() => (window.location.href = `/debrief?s=${sc.id}`), state.outcome === "stopped" ? 400 : 3500);
      return () => clearTimeout(t);
    }
  }, [state.outcome]); // eslint-disable-line react-hooks/exhaustive-deps

  // One audio player for the whole call, unlocked by the Answer tap: phones (iPhone especially)
  // only let a page play sound later if that same player first played inside a tap.
  function player(): HTMLAudioElement {
    if (!audio.current) {
      const p = new Audio();
      p.addEventListener("ended", () => (busy.current = false));
      audio.current = p;
    }
    return audio.current;
  }
  const lineNo = useRef(0);

  function speak(text: string, node?: string) {
    window.speechSynthesis?.cancel();
    const p = player();
    p.pause();
    const my = ++lineNo.current;
    busy.current = true;
    const fallback = () => {
      if (lineNo.current !== my) return;
      const u = new SpeechSynthesisUtterance(text);
      u.onend = () => (busy.current = false);
      u.rate = slow ? 0.8 : 1;
      u.lang = "en-GB";
      window.speechSynthesis?.speak(u);
    };
    const play = (src: string) => {
      if (lineNo.current !== my) return;
      p.src = src;
      p.playbackRate = slow ? 0.8 : 1;
      p.play().catch(fallback);
    };
    // Recorded clip for script lines; the caller's own voice made on the fly for live replies.
    if (node && !sc.generated) return play(`/audio/${sc.id}/${node}.mp3`);
    fetch("/api/tts", { method: "POST", body: JSON.stringify({ text, voice: sc.voice }) })
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then((b) => play(URL.createObjectURL(b)))
      .catch(fallback);
  }

  // Interrupting: stop the caller mid-sentence, like a real call.
  function bargeIn() {
    lineNo.current++;
    window.speechSynthesis?.cancel();
    audio.current?.pause();
    busy.current = false;
  }

  const replyRef = useRef<(text: string, input: "voice" | "typed") => void>(() => undefined);
  replyRef.current = (t, i) => void reply(t, i); // mic callbacks always use the latest call state

  async function reply(text: string, input: "voice" | "typed") {
    if (!text.trim() || state.outcome || thinking) return;
    const r = step(state, sc, text, input);
    setState(r.state);
    if (!r.needCoach) return;
    setThinking(true);
    busy.current = true;
    try {
      const res = await fetch("/api/call/coach", { method: "POST", body: JSON.stringify({ scenarioId: sc.id, node: r.state.node, masked: r.masked, sessionId, recent: r.state.transcript.slice(-7, -1).map(({ who, text }) => ({ who, text })) }) });
      const move = await res.json();
      if (move.stop) setState((s) => ({ ...s, outcome: "stopped", checkpoints: [...s.checkpoints, "gave_secret"] }));
      else {
        setState((s) => coachTurn(s, sc, { intent: move.intent ?? "stall", say: move.say }));
      }
    } catch {
      setState((s) => coachTurn(s, sc, { intent: "stall" })); // server trouble: the caller asks again
    } finally {
      setThinking(false);
      if (!audio.current || audio.current.paused || audio.current.ended) busy.current = false;
    }
  }

  // Open mic, like a video call: tap once to turn it on, then just talk. ElevenLabs Scribe
  // notices when you stop (voice activity) and sends what you said; browser speech-to-text is
  // the fallback. While the caller is talking or thinking, what the mic hears is ignored, so the
  // caller's own voice from the speaker isn't taken as your reply.
  async function micOn(manual = pushRef.current) {
    micWanted.current = true;
    setListening(true);
    setMicHint("");
    try {
      const res = await fetch("/api/scribe-token", { method: "POST" });
      if (!res.ok) throw new Error("no scribe");
      const { token } = await res.json();
      if (!micWanted.current) return;
      const conn = Scribe.connect({
        token,
        modelId: "scribe_v2_realtime",
        // Noisy room: nothing is sent until you tap again (manual commit).
        commitStrategy: manual ? CommitStrategy.MANUAL : CommitStrategy.VAD,
        vadSilenceThresholdSecs: 1.0,
        vadThreshold: 0.6, // less sensitive: a voice right at the phone, not the room
        minSpeechDurationMs: 300,
        languageCode: "en",
        keyterms: sc.keyterms,
        microphone: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      conn.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (d: { text: string }) => {
        if (manual) { micOff(); replyRef.current(d.text, "voice"); } // you chose to send it
        else heard(d.text);
      });
      const fail = () => {
        if (scribe.current !== conn) return;
        scribe.current = null;
        if (micWanted.current) browserMic(); // fall back rather than go silent
      };
      conn.on(RealtimeEvents.ERROR, fail);
      conn.on(RealtimeEvents.AUTH_ERROR, fail);
      conn.on(RealtimeEvents.CLOSE, fail);
      scribe.current = conn;
    } catch {
      browserMic();
    }
  }

  // What the open mic heard. Noise and stray words from people nearby are dropped: a reply needs
  // a real word, and to cut in while the caller is talking it needs a few words, not a murmur.
  function heard(raw: string) {
    const text = raw.replace(/\[[^\]]*\]|\([^)]*\)/g, " ").trim(); // drop "(background noise)" tags
    const words = text.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w));
    if (!words.length || thinkingRef.current) return;
    if (busy.current) {
      if (words.length < 3) return; // a murmur while the caller talks
      bargeIn();
    }
    replyRef.current(text, "voice");
  }

  function browserMic() {
    const r = speechRecognition();
    if (!r) {
      micWanted.current = false;
      setListening(false);
      setMicHint("Talking isn't available on this browser. Type your reply instead.");
      setShowType(true);
      return;
    }
    r.lang = "en-GB";
    r.interimResults = false;
    (r as unknown as { continuous: boolean }).continuous = true;
    r.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      heard(last[0].transcript);
    };
    r.onend = () => { if (micWanted.current && rec.current === r) r.start(); }; // keep listening
    rec.current = r;
    r.start();
  }

  // Noisy-room send: tap again to send what you said.
  function sendNow() {
    if (scribe.current) {
      micWanted.current = false;
      scribe.current.commit();
    } else micOff();
  }

  function micOff() {
    micWanted.current = false;
    setListening(false);
    scribe.current?.close();
    scribe.current = null;
    const r = rec.current;
    rec.current = null;
    r?.stop();
  }

  useEffect(() => () => micOff(), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.outcome) micOff(); }, [state.outcome]); // eslint-disable-line react-hooks/exhaustive-deps

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
            <span className="relative grid size-28 place-items-center rounded-full bg-navy-2 text-4xl font-semibold tracking-tight">{sc.caller[0]}</span>
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">{sc.caller}</h1>
          <p className="mt-2 text-white/80">Incoming call</p>
        </div>
        <div className="w-full max-w-md space-y-4">
          <p className="text-center text-white/85">
            This is practice. Never say a real card number, code or password. You can hang up or ask &ldquo;is this real?&rdquo; at any time.
          </p>
          <button type="button" onClick={answer} className="btn-chunky w-full bg-safe text-lg text-white" style={{ "--btn-edge": "#0f5a37" } as React.CSSProperties}>
            Answer call
          </button>
          <Link href="/home" className="block py-2 text-center font-bold text-white/80">Not now</Link>
        </div>
      </main>
    );

  return (
    <main className="flex h-dvh flex-col bg-navy text-white">
      <nav aria-label="Call" className="mx-4 mt-3 flex items-center justify-between rounded-full bg-white/[0.06] p-1.5 ring-1 ring-white/12">
        <Link href="/home" onClick={() => { window.speechSynthesis?.cancel(); audio.current?.pause(); }} aria-label="Back to home" className="flex h-10 items-center gap-1 rounded-full pl-2 pr-3.5 font-semibold">
          <ChevronLeft className="size-5" strokeWidth={2.4} aria-hidden />
          Home
        </Link>
        <span className="pr-3 font-semibold tracking-tight">Hookline</span>
      </nav>
      <header className="flex items-center gap-3 px-5 pb-3 pt-4">
        <span className="grid size-12 place-items-center rounded-full bg-navy-2 text-xl font-semibold tracking-tight">{sc.caller[0]}</span>
        <div className="flex-1">
          <p className="font-semibold tracking-tight">{sc.caller}</p>
          <p className="text-sm text-white/70">{state.outcome ? "Call ended" : thinking ? "Caller is thinking…" : "On call"}</p>
        </div>
        <span className="rounded-full bg-mark px-3 py-1 text-sm font-bold text-navy">Practice</span>
      </header>

      <section aria-live="polite" aria-label="Call captions" className="flex-1 space-y-3 overflow-y-auto px-5 py-3">
        {state.transcript.map((t, k) => (
          <motion.p key={k} initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-[1.05rem] leading-snug ${t.who === "caller" ? "rounded-tl-sm bg-navy-2" : "ml-auto rounded-tr-sm bg-tide"}`}>
            {t.text}
          </motion.p>
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
          {micHint && <p role="status" className="text-sm text-mark">{micHint}</p>}
          {canTalk && !showType && (
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <button type="button"
                  onClick={() => (push ? (listening ? sendNow() : micOn(true)) : listening ? micOff() : micOn(false))}
                  aria-pressed={listening}
                  aria-label={push ? (listening ? "Send what you said" : "Start talking") : listening ? "Turn microphone off" : "Turn microphone on"}
                  className={`grid size-16 shrink-0 place-items-center rounded-full transition ${listening ? "bg-safe shadow-[0_0_0_8px_rgba(15,122,70,0.25)]" : "bg-white/15"}`}>
                  {listening ? <Mic className="size-7" aria-hidden /> : <MicOff className="size-7" aria-hidden />}
                </button>
                <p className="text-lg font-medium" role="status">
                  {thinking ? "Caller is thinking…" : push ? (listening ? "Talking… tap to send" : "Tap the mic, talk, tap again to send") : listening ? "Mic on. Just talk." : "Mic off. Tap to talk."}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={push} onChange={(e) => { micOff(); setPush(e.target.checked); if (!e.target.checked) micOn(false); }} className="size-4 accent-[#0f7a46]" />
                Noisy room? Tap to talk, tap to send
              </label>
            </div>
          )}
          {(showType || !canTalk) && (
          <form onSubmit={(e) => { e.preventDefault(); reply(typed, "typed"); setTyped(""); }} className="flex gap-2">
            <label className="sr-only" htmlFor="reply">Type what you would say</label>
            <input id="reply" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type what you'd say" autoComplete="off"
              className="min-h-14 min-w-0 flex-1 rounded-full bg-[#1f1f1f] px-5 text-lg text-white placeholder:text-white/50" />
            <button className="shrink-0 rounded-full bg-white px-5 font-semibold text-black">Send</button>
          </form>
          )}
          <div className="flex items-center gap-3">
            {canTalk && (
              <button type="button" onClick={() => { if (!showType) micOff(); setShowType((v) => !v); }} className="min-h-12 flex-1 rounded-full px-4 text-left font-medium text-white/80 underline-offset-4 hover:underline">
                {showType ? "Talk instead" : "Type instead"}
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
