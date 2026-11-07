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
}

export type SceneLayout =
  | "center-impact"
  | "highlighter-sweep"
  | "word-cascade"
  | "cyber-scramble";

export const LAYOUT_CYCLE: SceneLayout[] = [
  "center-impact",
  "highlighter-sweep",
  "word-cascade",
  "cyber-scramble",
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
  options: { wpm?: number; fps?: number } = {}
): Scene[] {
  const wpm = clampWpm(options.wpm ?? 145);
  const fps = options.fps ?? 30;

  return splitIntoSentences(script).map((text, index) => {
    const wordCount = countWords(text);
    const punctuation = countPunctuation(text);
    const durationSeconds = computeSceneDurationSeconds(wordCount, punctuation, wpm);

    return {
      id: `scene-${index}`,
      text,
      wordCount,
      durationSeconds,
      durationInFrames: secondsToFrames(durationSeconds, fps),
      stickers: matchStickers(text),
      layout: LAYOUT_CYCLE[index % LAYOUT_CYCLE.length],
    };
  });
}
