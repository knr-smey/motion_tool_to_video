import { interpolate, useCurrentFrame, AbsoluteFill } from "remotion";
import { StickerBadge } from "@/components/Video/StickerBadge";
import { battambangFontFamily } from "../fonts";
import type { SceneProps } from "./types";

// A white bar with mix-blend-mode "difference" swept over white-on-black
// text optically inverts the text to black wherever the bar overlaps it.
export function HighlighterSweep({ text, stickers }: SceneProps) {
  const frame = useCurrentFrame();

  const sweepX = interpolate(frame, [6, 34], [-30, 130], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {stickers.map((sticker, i) => (
        <StickerBadge key={sticker.category} sticker={sticker} index={i} />
      ))}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 120 }}>
        <div
          style={{
            position: "relative",
            fontFamily: battambangFontFamily,
            fontWeight: 700,
            fontSize: 76,
            textAlign: "center",
            lineHeight: 1.35,
            color: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          {text}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${sweepX - 35}%`,
              width: "35%",
              backgroundColor: "#FFFFFF",
              mixBlendMode: "difference",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
