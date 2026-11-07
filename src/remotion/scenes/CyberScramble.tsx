import { interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { StickerBadge } from "@/components/Video/StickerBadge";
import { SceneBackground } from "@/remotion/backgrounds/SceneBackground";
import { kantumruyProFontFamily } from "../fonts";
import type { SceneProps } from "./types";

const SCRAMBLE_POOL = "កខគឃងចឆជឈញដឋឌឍណតថទធនបផពភមយរលវសហអ".split("");
const SCRAMBLE_SECONDS = 0.6;
const LOCK_STAGGER_SECONDS = 0.03;

// Deterministic pseudo-random glyph pick so server-side renders stay
// frame-stable (no Math.random, which would flicker between renders).
function pickGlyph(seed: number): string {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  const index = Math.floor((x - Math.floor(x)) * SCRAMBLE_POOL.length);
  return SCRAMBLE_POOL[index];
}

export function CyberScramble({ text, stickers, background }: SceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const characters = Array.from(text);

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      <SceneBackground {...background} />
      {stickers.map((sticker, i) => (
        <StickerBadge key={sticker.category} sticker={sticker} index={i} />
      ))}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 120 }}>
        <div
          style={{
            fontFamily: kantumruyProFontFamily,
            fontWeight: 700,
            fontSize: 72,
            color: "#000000",
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {characters.map((char, i) => {
            if (char.trim() === "") return char;

            const lockFrame = i * LOCK_STAGGER_SECONDS * fps;
            const isLocked = frame >= lockFrame + SCRAMBLE_SECONDS * fps;
            const opacity = interpolate(frame, [0, lockFrame], [0, 1], {
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
