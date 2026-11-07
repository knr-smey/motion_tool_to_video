import { interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { StickerBadge } from "@/components/Video/StickerBadge";
import { kantumruyProFontFamily } from "../fonts";
import type { SceneProps } from "./types";

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

export function WordCascade({ text, stickers }: SceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokens = splitTokens(text);

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      {stickers.map((sticker, i) => (
        <StickerBadge key={sticker.category} sticker={sticker} index={i} />
      ))}
      <AbsoluteFill
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "center",
          alignContent: "center",
          padding: 140,
          gap: "0.3em",
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
                fontFamily: kantumruyProFontFamily,
                fontWeight: 600,
                fontSize: 62,
                color: "#000000",
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
