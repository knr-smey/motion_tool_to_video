import { interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { StickerBadge } from "@/components/Video/StickerBadge";
import { SceneBackground } from "@/remotion/backgrounds/SceneBackground";
import { kantumruyProFontFamily } from "../fonts";
import type { SceneProps } from "./types";
import { isColorDark } from "@/lib/colorUtils";

const SCRAMBLE_POOL = "កខគឃងចឆជឈញដឋឌឍណតថទធនបផពភមយរលវសហអ".split("");
const SCRAMBLE_SECONDS = 0.6;
const LOCK_STAGGER_SECONDS = 0.03;

function pickGlyph(seed: number): string {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  const index = Math.floor((x - Math.floor(x)) * SCRAMBLE_POOL.length);
  return SCRAMBLE_POOL[index];
}

export function CyberScramble({
  text,
  stickers,
  background,
  backgroundColor,
  textColor,
  lineHeight = 1.3,
  fontSize = 72,
  positionX = 0,
  positionY = 0,
  textAlign = "center",
}: SceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const characters = Array.from(text);

  const effectiveBg = backgroundColor ?? "#FFFFFF";
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
            fontFamily: kantumruyProFontFamily,
            fontWeight: 700,
            fontSize,
            color: effectiveText,
            textAlign,
            lineHeight,
            maxWidth: "90%",
            wordBreak: "break-word",
          }}
        >
          {characters.map((char, i) => {
            if (char.trim() === "") return char;

            const lockFrame = i * LOCK_STAGGER_SECONDS * fps;
            const isLocked = frame >= lockFrame + SCRAMBLE_SECONDS * fps;
            // interpolate() requires a strictly increasing input range, but
            // the first character has lockFrame === 0, which would collapse
            // the range to [0, 0]. Math.max(lockFrame, 1) keeps it valid
            // while still fading in effectively instantly for that char.
            const opacity = interpolate(frame, [0, Math.max(lockFrame, 1)], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <span key={i} style={{ opacity }}>
                {isLocked ? char : pickGlyph(i * 31 + frame)}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
