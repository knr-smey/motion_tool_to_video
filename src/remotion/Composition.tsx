import { Sequence, AbsoluteFill } from "remotion";
import type { Scene } from "@/lib/segmentation";
import { CenterImpact } from "./scenes/CenterImpact";
import { HighlighterSweep } from "./scenes/HighlighterSweep";
import { WordCascade } from "./scenes/WordCascade";
import { CyberScramble } from "./scenes/CyberScramble";

export interface KineticCastProps extends Record<string, unknown> {
  scenes: Scene[];
}

const SCENE_COMPONENTS = {
  "center-impact": CenterImpact,
  "highlighter-sweep": HighlighterSweep,
  "word-cascade": WordCascade,
  "cyber-scramble": CyberScramble,
} as const;

function withStartFrames(scenes: Scene[]): Array<{ scene: Scene; from: number }> {
  const result: Array<{ scene: Scene; from: number }> = [];
  for (let i = 0; i < scenes.length; i++) {
    const previous = result[i - 1];
    const from = previous ? previous.from + previous.scene.durationInFrames : 0;
    result.push({ scene: scenes[i], from });
  }
  return result;
}

export function KineticCast({ scenes }: KineticCastProps) {
  const positionedScenes = withStartFrames(scenes);

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      {positionedScenes.map(({ scene, from }) => {
        const SceneComponent = SCENE_COMPONENTS[scene.layout];

        return (
          <Sequence key={scene.id} from={from} durationInFrames={scene.durationInFrames}>
            <SceneComponent
              text={scene.text}
              stickers={scene.stickers}
              durationInFrames={scene.durationInFrames}
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
