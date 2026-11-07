import type { StickerMatch } from "@/lib/stickerMatcher";

export interface SceneProps {
  text: string;
  stickers: StickerMatch[];
  durationInFrames: number;
}
