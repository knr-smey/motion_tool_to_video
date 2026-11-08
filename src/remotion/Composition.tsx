import { Sequence, AbsoluteFill, Audio } from "remotion";
import type { Scene } from "@/lib/segmentation";
import { CenterImpact } from "./scenes/CenterImpact";
import { HighlighterSweep } from "./scenes/HighlighterSweep";
import { WordCascade } from "./scenes/WordCascade";
import { CyberScramble } from "./scenes/CyberScramble";
import { NodeConnector } from "./scenes/NodeConnector";
import { FadeRise } from "./scenes/FadeRise";
import { PanSlide } from "./scenes/PanSlide";
import { BreatheFloat } from "./scenes/BreatheFloat";
import { Typewriter } from "./scenes/Typewriter";
import { StaticClean } from "./scenes/StaticClean";
import { DEFAULT_BACKGROUND, type BackgroundConfig } from "./backgrounds/types";
import { SceneBackground } from "./backgrounds/SceneBackground";
import { isColorDark } from "@/lib/colorUtils";

export interface KineticCastProps extends Record<string, unknown> {
  scenes: Scene[];
  background?: BackgroundConfig;
  backgroundColor?: string;
}

const SCENE_COMPONENTS = {
  "center-impact": CenterImpact,
  "highlighter-sweep": HighlighterSweep,
  "word-cascade": WordCascade,
  "cyber-scramble": CyberScramble,
  "node-connector": NodeConnector,
  "fade-rise": FadeRise,
  "pan-slide": PanSlide,
  "breathe-float": BreatheFloat,
  typewriter: Typewriter,
  "static-clean": StaticClean,
} as const;

export function withStartFrames(scenes: Scene[]): Array<{ scene: Scene; from: number }> {
  const result: Array<{ scene: Scene; from: number }> = [];
  for (let i = 0; i < scenes.length; i++) {
    const previous = result[i - 1];
    const from = previous ? previous.from + previous.scene.durationInFrames : 0;
    result.push({ scene: scenes[i], from });
  }
  return result;
}

export function KineticCast({
  scenes,
  background = DEFAULT_BACKGROUND,
  backgroundColor = "#000000",
}: KineticCastProps) {
  const positionedScenes = withStartFrames(scenes);
  const effectiveBgColor = backgroundColor ?? "#000000";
  const isDark = isColorDark(effectiveBgColor);

  return (
    <AbsoluteFill style={{ backgroundColor: effectiveBgColor }}>
      {/* GLOBAL BACKGROUND: Covers the full video continuously without cutting/restarting per scene */}
      <SceneBackground {...background} isDark={isDark} />

      {positionedScenes.map(({ scene, from }) => {
        const SceneComponent = scene.textAnimation ? CenterImpact : (SCENE_COMPONENTS[scene.layout] ?? CenterImpact);

        return (
          <Sequence key={scene.id} from={from} durationInFrames={scene.durationInFrames}>
            <AbsoluteFill style={{
              transform: `rotate(${scene.rotation ?? 0}deg)`,
              opacity: scene.opacity ?? 1,
              fontWeight: scene.bold ? 700 : scene.fontWeight ?? 700,
              fontStyle: scene.italic ? "italic" : "normal",
              textDecoration: scene.underline ? "underline" : "none",
              letterSpacing: `${scene.letterSpacing ?? 0}px`,
              WebkitTextStroke: scene.textStroke ?? undefined,
              textShadow: scene.textShadow ? "0 4px 12px rgba(0,0,0,.65)" : undefined,
            }}>
            <SceneComponent
              text={scene.text}
              stickers={scene.stickers}
              durationInFrames={scene.durationInFrames}
              background={{ style: "none", imageDataUrl: null }}
              backgroundColor="transparent"
              textColor={scene.textColor}
              fontFamily={scene.fontFamily}
              lineHeight={scene.lineHeight}
              fontSize={scene.fontSize}
              positionX={scene.positionX}
              positionY={scene.positionY}
              textAlign={scene.textAlign}
              nodes={scene.nodes}
              textAnimation={scene.textAnimation}
            />
            </AbsoluteFill>
            {scene.audioUrl && <Audio src={scene.audioUrl} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

export function getTotalDurationInFrames(scenes: Scene[]): number {
  return scenes.reduce((total, scene) => total + scene.durationInFrames, 0);
}
