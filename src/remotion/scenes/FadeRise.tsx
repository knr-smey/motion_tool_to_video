import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { StickerBadge } from "@/components/Video/StickerBadge";
import { SceneBackground } from "@/remotion/backgrounds/SceneBackground";
import { moulFontFamily, poppinsFontFamily } from "../fonts";
import type { SceneProps } from "./types";
import { isColorDark } from "@/lib/colorUtils";

export function FadeRise({
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
  const { fps } = useVideoConfig();

  const translateY = interpolate(
    spring({ frame, fps, config: { damping: 14, stiffness: 90, mass: 0.6 } }),
    [0, 1],
    [50, 0]
  );
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const effectiveBg = backgroundColor === "transparent" ? "transparent" : (backgroundColor ?? "#000000");
  const effectiveText = textColor ?? (isColorDark(effectiveBg === "transparent" ? "#000000" : effectiveBg) ? "#FFFFFF" : "#000000");

  return (
    <AbsoluteFill style={{ backgroundColor: effectiveBg }}>
      {background?.style && background.style !== "none" && (
        <SceneBackground {...background} isDark={isColorDark(effectiveBg)} />
      )}
      {stickers.map((sticker, i) => (
        <StickerBadge key={sticker.category} sticker={sticker} index={i} />
      ))}
      <AbsoluteFill
        style={{
          alignItems: textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center",
          justifyContent: "center",
          padding: 120,
          transform: `translate(${positionX}px, ${positionY + translateY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: `${poppinsFontFamily}, ${moulFontFamily}, sans-serif`,
            fontSize,
            color: effectiveText,
            textAlign,
            lineHeight,
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
