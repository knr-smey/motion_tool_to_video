import { Sequence, AbsoluteFill } from "remotion";
import type { Scene } from "@/lib/segmentation";
import { CenterImpact } from "./scenes/CenterImpact";
import { HighlighterSweep } from "./scenes/HighlighterSweep";
import { WordCascade } from "./scenes/WordCascade";
import { CyberScramble } from "./scenes/CyberScramble";
import { DEFAULT_BACKGROUND, type BackgroundConfig } from "./backgrounds/types";

export interface KineticCastProps extends Record<string, unknown> {
  scenes: Scene[];
  background?: BackgroundConfig;
}

const SCENE_COMPONENTS = {
  "center-impact": CenterImpact,
  "highlighter-sweep": HighlighterSweep,
  "word-cascade": WordCascade,
  "cyber-scramble": CyberScramble,
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

export function KineticCast({ scenes, background = DEFAULT_BACKGROUND }: KineticCastProps) {
  const positionedScenes = withStartFrames(scenes);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {positionedScenes.map(({ scene, from }) => {
        const SceneComponent = SCENE_COMPONENTS[scene.layout] ?? CenterImpact;
        const effectiveBackground = scene.background ?? background;

        return (
          <Sequence key={scene.id} from={from} durationInFrames={scene.durationInFrames}>
            <SceneComponent
              text={scene.text}
              stickers={scene.stickers}
              durationInFrames={scene.durationInFrames}
              background={effectiveBackground}
              backgroundColor={scene.backgroundColor}
              textColor={scene.textColor}
              lineHeight={scene.lineHeight}
              fontSize={scene.fontSize}
              positionX={scene.positionX}
              positionY={scene.positionY}
              textAlign={scene.textAlign}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

export function getTotalDurationInFrames(scenes: Scene[]): number {
  return scenes.reduce((total, scene) => total + scene.durationInFrames, 0);
}
