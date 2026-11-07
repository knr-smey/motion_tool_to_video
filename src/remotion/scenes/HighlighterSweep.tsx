import { interpolate, useCurrentFrame, AbsoluteFill } from "remotion";
import { StickerBadge } from "@/components/Video/StickerBadge";
import { SceneBackground } from "@/remotion/backgrounds/SceneBackground";
import { battambangFontFamily, poppinsFontFamily } from "../fonts";
import type { SceneProps } from "./types";
import { isColorDark } from "@/lib/colorUtils";

export function HighlighterSweep({
  text,
  stickers,
  background,
  backgroundColor,
  textColor,
  lineHeight = 1.35,
  fontSize = 76,
  positionX = 0,
  positionY = 0,
  textAlign = "center",
}: SceneProps) {
  const frame = useCurrentFrame();

  const sweepX = interpolate(frame, [6, 34], [-30, 130], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const effectiveBg = backgroundColor ?? "#000000";
  const effectiveText = textColor ?? (isColorDark(effectiveBg) ? "#FFFFFF" : "#000000");

  return (
    <AbsoluteFill style={{ backgroundColor: effectiveBg }}>
      <SceneBackground {...background} isDark={isColorDark(effectiveBg)} />
      {stickers.map((sticker, i) => (
        <StickerBadge key={sticker.category} sticker={sticker} index={i} />
      ))}
      <AbsoluteFill
        style={{
          alignItems: textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center",
          justifyContent: "center",
          padding: 120,
          transform: `translate(${positionX}px, ${positionY}px)`,
        }}
      >
        <div
          style={{
            position: "relative",
            fontFamily: `${poppinsFontFamily}, ${battambangFontFamily}, sans-serif`,
            fontWeight: 700,
            fontSize,
            textAlign,
            lineHeight,
            color: effectiveText,
            overflow: "hidden",
            maxWidth: "90%",
            wordBreak: "break-word",
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
              backgroundColor: effectiveText,
              mixBlendMode: "difference",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
