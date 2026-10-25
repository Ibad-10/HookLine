// Sly, Hookline's mascot. She sits as a small avatar; her face reacts to lessons and calls, and
// tapping her opens "Ask Sly" for real questions ("is this a scam?").
export type Mood = "neutral" | "happy" | "wink" | "surprised" | "sleepy" | "dizzy" | "worried" | "serious";
export type SlyLine = "right" | "wrong" | "stopped";

// Pages without Sly: the live call and sign-in.
export const hiddenOn = (path: string) => path.startsWith("/call/") || path.startsWith("/sign-");

// Other parts of the app make Sly react: window.dispatchEvent(slyEvent("right")).
export const slyEvent = (line: SlyLine, mood?: Mood) => new CustomEvent("sly", { detail: { line, mood } });
export const moodFor = (line: SlyLine): Mood => (line === "right" ? "happy" : line === "wrong" ? "dizzy" : "serious");
