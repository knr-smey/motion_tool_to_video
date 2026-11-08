import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { StickerBadge } from "@/components/Video/StickerBadge";
import { SceneBackground } from "@/remotion/backgrounds/SceneBackground";
import { moulFontFamily, poppinsFontFamily, battambangFontFamily, kantumruyProFontFamily } from "../fonts";
import type { SceneProps } from "./types";
import { isColorDark } from "@/lib/colorUtils";
import { MotionText } from "../textMotion/MotionText";

export function CenterImpact({
  text,
  stickers,
  durationInFrames,
  background,
  backgroundColor,
  textColor,
  fontFamily,
  lineHeight = 1.3,
  fontSize = 88,
  positionX = 0,
  positionY = 0,
  textAlign = "center",
  textAnimation,
}: SceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.5 },
  });

  const overshoot = interpolate(scale, [0, 0.7, 1], [0.7, 1.05, 1]);
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  const effectiveBg = backgroundColor === "transparent" ? "transparent" : (backgroundColor ?? "#000000");
  const effectiveText = textColor ?? (isColorDark(effectiveBg === "transparent" ? "#000000" : effectiveBg) ? "#FFFFFF" : "#000000");

  const activeFontFamily = fontFamily === "Battambang"
    ? `${poppinsFontFamily}, ${battambangFontFamily}, sans-serif`
    : fontFamily === "Kantumruy Pro"
    ? `${poppinsFontFamily}, ${kantumruyProFontFamily}, sans-serif`
    : fontFamily === "Poppins"
    ? `${poppinsFontFamily}, sans-serif`
    : `${poppinsFontFamily}, ${moulFontFamily}, sans-serif`;

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
          transform: `translate(${positionX}px, ${positionY}px)`,
        }}
      >
        {textAnimation ? (
          <MotionText
            text={text}
            config={textAnimation}
            fontFamily={activeFontFamily}
            fontSize={fontSize}
            color={effectiveText}
            textAlign={textAlign}
            lineHeight={lineHeight}
            durationInFrames={durationInFrames}
          />
        ) : (
          <div
            style={{
              fontFamily: activeFontFamily,
              fontSize,
              color: effectiveText,
              textAlign,
              lineHeight,
              transform: `scale(${overshoot})`,
              opacity,
              maxWidth: "90%",
              wordBreak: "break-word",
            }}
          >
            {text}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
