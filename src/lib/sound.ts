"use client";
// Feedback sounds made with Web Audio: no files, nothing copied. Muted via the
// hl_prefs cookie ("mute"). Soft volume by default.
let ctx: AudioContext | null = null;

function muted() {
  return typeof document !== "undefined" && /hl_prefs=[^;]*mute/.test(document.cookie);
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.12) {
  ctx ??= new AudioContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = ctx.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export function playRight() {
  if (muted()) return;
  tone(660, 0, 0.18, "triangle");
  tone(990, 0.09, 0.28, "triangle");
}

export function playWrong() {
  if (muted()) return;
  tone(220, 0, 0.22, "sine", 0.1);
  tone(185, 0.12, 0.3, "sine", 0.08);
}

export function playDone() {
  if (muted()) return;
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.35, "triangle", 0.1));
}
