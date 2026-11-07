import {
  FULL_STOP,
  PHRASE_PAUSE,
  clampWpm,
  computeSceneDurationSeconds,
  countPunctuation,
  secondsToFrames,
} from "./pacingEngine";
import { matchStickers, type StickerMatch } from "./stickerMatcher";
import type { BackgroundConfig } from "@/remotion/backgrounds/types";

export interface Scene {
  id: string;
  text: string;
  wordCount: number;
  durationSeconds: number;
  durationInFrames: number;
  stickers: StickerMatch[];
  layout: SceneLayout;
  backgroundColor?: string;
  textColor?: string;
  lineHeight?: number;
  fontSize?: number;
  positionX?: number;
  positionY?: number;
  textAlign?: "left" | "center" | "right";
  background?: BackgroundConfig;
  nodes?: [string, string, string];
  audioUrl?: string;
  audioDurationSeconds?: number;
}

export type SceneLayout =
  | "center-impact"
  | "highlighter-sweep"
  | "word-cascade"
  | "cyber-scramble"
  | "node-connector"
  | "fade-rise"
  | "pan-slide"
  | "breathe-float"
  | "typewriter"
  | "static-clean";

export const LAYOUT_CYCLE: SceneLayout[] = [
  "center-impact",
  "fade-rise",
  "word-cascade",
  "pan-slide",
  "breathe-float",
];

function splitIntoSentences(script: string): string[] {
  return script
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function countWords(sentence: string): number {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("km", { granularity: "word" });
    let count = 0;
    for (const { segment, isWordLike } of segmenter.segment(sentence)) {
      if (isWordLike && segment.trim()) count += 1;
    }
    return Math.max(1, count);
  }
  return Math.max(1, sentence.trim().split(/\s+/).filter(Boolean).length);
}

export function buildScenes(
  script: string,
  options: { durationSeconds?: number; wpm?: number; fps?: number; defaultLayout?: SceneLayout } = {}
): Scene[] {
  const durationParam = options.durationSeconds ?? (options.wpm ? options.wpm : 1.8);
  const fps = options.fps ?? 30;
  const layout: SceneLayout = options.defaultLayout ?? "center-impact";

  return splitIntoSentences(script).map((text, index) => {
    const wordCount = countWords(text);
    const punctuation = countPunctuation(text);
    const durationSeconds = computeSceneDurationSeconds(wordCount, punctuation, durationParam);

    return {
      id: `scene-${index}`,
      text,
      wordCount,
      durationSeconds,
      durationInFrames: secondsToFrames(durationSeconds, fps),
      stickers: matchStickers(text),
      layout,
      backgroundColor: "#000000",
      textColor: "#FFFFFF",
      lineHeight: 1.35,
      fontSize: 76,
      positionX: 0,
      positionY: 0,
      textAlign: "center",
    };
  });
}
