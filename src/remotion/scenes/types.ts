import type { StickerMatch } from "@/lib/stickerMatcher";
import type { BackgroundConfig } from "@/remotion/backgrounds/types";

export interface SceneProps {
  text: string;
  stickers: StickerMatch[];
  durationInFrames: number;
  background: BackgroundConfig;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  lineHeight?: number;
  fontSize?: number;
  positionX?: number;
  positionY?: number;
  textAlign?: "left" | "center" | "right";
  nodes?: [string, string, string];
  textAnimation?: import("@/remotion/textMotion/types").TextMotionConfig;
}
