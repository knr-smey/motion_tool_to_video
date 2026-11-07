export const FULL_STOP = "៕"; // ៕
export const PHRASE_PAUSE = "៊"; // ၊

export const DEFAULT_WPM = 145;
export const MIN_WPM = 120;
export const MAX_WPM = 180;

const FULL_STOP_DELAY = 0.4;
const PHRASE_PAUSE_DELAY = 0.2;
export const MIN_SCENE_SECONDS = 0.6;
export const DEFAULT_SCENE_SECONDS = 1.8;

export interface PunctuationCounts {
  fullStops: number;
  phrasePauses: number;
}

export function countPunctuation(text: string): PunctuationCounts {
  let fullStops = 0;
  let phrasePauses = 0;
  for (const char of text) {
    if (char === FULL_STOP || char === "។") fullStops += 1;
    else if (char === PHRASE_PAUSE || char === ",") phrasePauses += 1;
  }
  return { fullStops, phrasePauses };
}

export function computeSceneDurationSeconds(
  wordCount: number,
  punctuation: PunctuationCounts,
  durationOrWpm: number = DEFAULT_SCENE_SECONDS
): number {
  // If value is under 30, it is a direct duration in seconds (e.g. 1.2s, 1.8s, 2.5s)
  if (durationOrWpm < 30) {
    const baseDuration = durationOrWpm;
    // For longer lines (more than 4 words), add a gentle scaling so words stay readable
    const wordFactor = wordCount > 4 ? 1 + (wordCount - 4) * 0.08 : 1;
    const finalSeconds = baseDuration * wordFactor;
    return Math.max(MIN_SCENE_SECONDS, Math.round(finalSeconds * 10) / 10);
  }

  // Otherwise fallback to WPM calculation
  const readingTime = (wordCount * 60) / durationOrWpm;
  const punctuationDelay =
    punctuation.fullStops * FULL_STOP_DELAY +
    punctuation.phrasePauses * PHRASE_PAUSE_DELAY;
  return Math.max(MIN_SCENE_SECONDS, Math.round((readingTime + punctuationDelay) * 10) / 10);
}

export function secondsToFrames(seconds: number, fps: number): number {
  return Math.round(seconds * fps);
}

export function clampWpm(wpm: number): number {
  return Math.min(MAX_WPM, Math.max(MIN_WPM, wpm));
}
