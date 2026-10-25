// Sly, Hookline's mascot: what she says on each screen and how she reacts. Lines are short
// and pre-voiced (scripts/gen-sly.mts), so playing one costs nothing.
export const SLY_VOICE = "zH7TN9vEZAsEway9xWev"; // Beth: young, bright, British

export const SLY_LINES = {
  landing: "Hi, I'm Sly. Spot the hook before it catches you.",
  home: "Hello again! One short lesson a day keeps the scammers guessing.",
  lesson: "Look for the hook: a rush, a secret, or a strange way to pay.",
  debrief: "Nicely done. Every call makes the next one easier to spot.",
  progress: "These are your weak spots. I'll bring them back until they're easy.",
  settings: "You can switch me off here. I won't take it personally!",
  right: "Caught it! You spotted the hook.",
  wrong: "Ooh, that one was sneaky. Let's look at why.",
  stopped: "I stopped the call. Real details never belong on a practice call.",
  tap: "Hey! That tickles.",
} as const;
export type SlyLine = keyof typeof SLY_LINES;

export type Mood = "neutral" | "happy" | "wink" | "surprised" | "sleepy" | "dizzy" | "worried" | "serious";

// Which line Sly offers on a page.
export function lineFor(path: string): SlyLine {
  if (path === "/" || path.startsWith("/start")) return "landing";
  if (path.startsWith("/lesson")) return "lesson";
  if (path.startsWith("/debrief")) return "debrief";
  if (path.startsWith("/progress")) return "progress";
  if (path.startsWith("/settings")) return "settings";
  return "home";
}

// Pages without Sly: the live call (her voice would clash with the caller) and sign-in.
export const hiddenOn = (path: string) => path.startsWith("/call/") || path.startsWith("/sign-");

// Other parts of the app make Sly react: window.dispatchEvent(slyEvent("right")).
export const slyEvent = (line: SlyLine, mood?: Mood) => new CustomEvent("sly", { detail: { line, mood } });
