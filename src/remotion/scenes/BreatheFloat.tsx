import { interpolate, useCurrentFrame, AbsoluteFill } from "remotion";
import { StickerBadge } from "@/components/Video/StickerBadge";
import { SceneBackground } from "@/remotion/backgrounds/SceneBackground";
import { moulFontFamily, poppinsFontFamily } from "../fonts";
import type { SceneProps } from "./types";
import { isColorDark } from "@/lib/colorUtils";

export function BreatheFloat({
  text,
  stickers,
  background,
  backgroundColor,
  textColor,
  lineHeight = 1.3,
  fontSize = 84,
  positionX = 0,
  positionY = 0,
  textAlign = "center",
}: SceneProps) {
  const frame = useCurrentFrame();

  const scale = 1 + Math.sin(frame / 12) * 0.04;
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

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
            fontFamily: `${poppinsFontFamily}, ${moulFontFamily}, sans-serif`,
            fontSize,
            color: effectiveText,
            textAlign,
            lineHeight,
            transform: `scale(${scale})`,
            opacity,
            maxWidth: "90%",
            wordBreak: "break-word",
          }}
        >
          {text}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
