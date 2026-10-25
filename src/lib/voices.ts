// ElevenLabs voices: each caller gets a fitting human voice; Hookline's own announcements use one
// calm narrator. Generated calls pick from these by the caller's gender.
export const VOICES = {
  // British voices from the ElevenLabs library, chosen for natural phone conversation.
  male: ["Fahco4VZzobUeiPqni1S", "2UMI2FME0FFUFMlUoRER", "jRAAK67SEFE9m7ci5DhD", "nXIYu9FT5meibkBbZFT7"], // Archer, Hugh, Ollie, James
  female: ["MzqUf1HbJ8UmQ0wUsx2p", "lcMyyd2HUfFzxdCaC4Ta", "L4so9SudEsIYzE9j4qlR", "pFZP5JQG7iQjIQuC4Bku"], // Katie, Lucy, Jo, Lily
};
export const NARRATOR = "Xb7hH8MSUJpSbSDYk0k2"; // Alice
// Earlier voices stay allowed so calls written before the switch still play.
const EARLIER = ["onwK4e9ZLuTAKqWW03F9", "JBFqnCBsd6RMkjVDRZzb", "iP95p4xoKVk53GoZ742B", "cjVigY5qzO86Huf0OWal", "zH7TN9vEZAsEway9xWev", "aj0fZfXTBc7E3By4X8L2", "Xb7hH8MSUJpSbSDYk0k2"];
export const ALL_VOICES: string[] = [...VOICES.male, ...VOICES.female, ...EARLIER];

export const pickVoice = (gender: "male" | "female", seed: string) => {
  const list = VOICES[gender];
  return list[[...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % list.length];
};

// What Hookline itself says on a real call. Pre-recorded in the narrator voice.
export const NARRATION = {
  notice: "Hi, this is Hookline. This is your practice call. Nothing you say is kept, and you can hang up at any time. Here it comes.",
  stopped: "This is Hookline. We stopped the call there, because it sounded like real details. On a real call, that's the moment to hang up. Open the app for your review.",
  hung_up: "This is Hookline. Well done. Hanging up is always the right move. Open the app for your review.",
  pass: "This is Hookline. Well done, you kept your money safe. Open the app for your review.",
  scammed: "This is Hookline. This one caught you, and that's why we practise. Open the app to see the tricks it used.",
  quiet: "This is Hookline. We didn't hear anything, so we've ended the practice call. You can try again from the app.",
} as const;
