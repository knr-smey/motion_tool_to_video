import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { StickerBadge } from "@/components/Video/StickerBadge";
import { SceneBackground } from "@/remotion/backgrounds/SceneBackground";
import { moulFontFamily } from "../fonts";
import type { SceneProps } from "./types";

export function CenterImpact({ text, stickers, background }: SceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.5 },
  });

  const overshoot = interpolate(scale, [0, 0.7, 1], [0.7, 1.05, 1]);
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      <SceneBackground {...background} />
      {stickers.map((sticker, i) => (
        <StickerBadge key={sticker.category} sticker={sticker} index={i} />
      ))}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 120 }}>
        <div
          style={{
            fontFamily: moulFontFamily,
            fontSize: 88,
            color: "#000000",
            textAlign: "center",
            lineHeight: 1.3,
            transform: `scale(${overshoot})`,
            opacity,
          }}
        >
          {text}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
