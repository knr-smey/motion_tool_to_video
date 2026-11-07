export const FULL_STOP = "៕"; // ៕
export const PHRASE_PAUSE = "៊"; // ၊

export const DEFAULT_WPM = 145;
export const MIN_WPM = 120;
export const MAX_WPM = 180;

const FULL_STOP_DELAY = 0.6;
const PHRASE_PAUSE_DELAY = 0.3;
const MIN_SCENE_SECONDS = 2.4;

export interface PunctuationCounts {
  fullStops: number;
  phrasePauses: number;
}

export function countPunctuation(text: string): PunctuationCounts {
  let fullStops = 0;
  let phrasePauses = 0;
  for (const char of text) {
    if (char === FULL_STOP) fullStops += 1;
    else if (char === PHRASE_PAUSE || char === ",") phrasePauses += 1;
  }
  return { fullStops, phrasePauses };
}

export function computeSceneDurationSeconds(
  wordCount: number,
  punctuation: PunctuationCounts,
  wpm: number = DEFAULT_WPM
): number {
  const readingTime = (wordCount * 60) / wpm;
  const punctuationDelay =
    punctuation.fullStops * FULL_STOP_DELAY +
    punctuation.phrasePauses * PHRASE_PAUSE_DELAY;
  return Math.max(MIN_SCENE_SECONDS, readingTime) + punctuationDelay;
}

export function secondsToFrames(seconds: number, fps: number): number {
  return Math.round(seconds * fps);
}

export function clampWpm(wpm: number): number {
  return Math.min(MAX_WPM, Math.max(MIN_WPM, wpm));
}
