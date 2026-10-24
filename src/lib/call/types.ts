import type { Ask } from "../gatekeeper";

export type Intent = "refuse" | "question_identity" | "comply" | "hang_up" | "is_real" | "distress" | "stall";

export type Node = {
  line: string;
  ask: Ask;
  technique: string;
  branches: Partial<Record<"refuse" | "question_identity" | "comply" | "stall", string>>;
  end?: "scammed" | "safe";
};

export type Scenario = {
  id: string;
  title: string;
  category: string;
  caller: string;
  brand: string; // fictional
  start: string;
  keyterms: string[];
  nodes: Record<string, Node>;
  voice?: string; // ElevenLabs voice id for the caller
  generated?: boolean; // written for one learner; voiced on the fly, web calls only
};

export type Turn = { who: "caller" | "you"; text: string; node?: string };

export type CallState = {
  scenarioId: string;
  node: string;
  step: number;
  transcript: Turn[];
  outcome: null | "pass" | "stopped" | "scammed";
  checkpoints: string[];
};
