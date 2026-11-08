import { interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { StickerBadge } from "@/components/Video/StickerBadge";
import { SceneBackground } from "@/remotion/backgrounds/SceneBackground";
import { kantumruyProFontFamily, poppinsFontFamily } from "../fonts";
import type { SceneProps } from "./types";
import { isColorDark } from "@/lib/colorUtils";

const STAGGER_SECONDS = 0.08;

function splitTokens(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("km", { granularity: "word" });
    return Array.from(segmenter.segment(text))
      .map(({ segment }) => segment)
      .filter((segment) => segment.trim().length > 0);
  }
  return text.split(/\s+/).filter(Boolean);
}

export function WordCascade({
  text,
  stickers,
  background,
  backgroundColor,
  textColor,
  lineHeight = 1.3,
  fontSize = 62,
  positionX = 0,
  positionY = 0,
  textAlign = "center",
}: SceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokens = splitTokens(text);

  const effectiveBg = backgroundColor === "transparent" ? "transparent" : (backgroundColor ?? "#000000");
  const effectiveText = textColor ?? (isColorDark(effectiveBg === "transparent" ? "#000000" : effectiveBg) ? "#FFFFFF" : "#000000");

  const justifyStyle =
    textAlign === "left"
      ? "flex-start"
      : textAlign === "right"
      ? "flex-end"
      : "center";

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
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: justifyStyle,
          alignContent: "center",
          padding: 140,
          gap: "0.3em",
          transform: `translate(${positionX}px, ${positionY}px)`,
        }}
      >
        {tokens.map((token, i) => {
          const delayFrames = i * STAGGER_SECONDS * fps;
          const progress = interpolate(
            frame,
            [delayFrames, delayFrames + fps * 0.4],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const translateY = interpolate(progress, [0, 1], [-40, 0]);

          return (
            <span
              key={`${token}-${i}`}
              style={{
                fontFamily: `${poppinsFontFamily}, ${kantumruyProFontFamily}, sans-serif`,
                fontWeight: 600,
                fontSize,
                lineHeight,
                color: effectiveText,
                transform: `translateY(${translateY}px)`,
                opacity: progress,
              }}
            >
              {token}
            </span>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
