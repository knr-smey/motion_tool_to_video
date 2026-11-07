import type { StickerMatch } from "@/lib/stickerMatcher";
import type { BackgroundConfig } from "@/remotion/backgrounds/types";

export interface SceneProps {
  text: string;
  stickers: StickerMatch[];
  durationInFrames: number;
  background: BackgroundConfig;
}
