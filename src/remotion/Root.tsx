import { Composition as RemotionComposition } from "remotion";
import { KineticCast, getTotalDurationInFrames, type KineticCastProps } from "./Composition";
import { buildScenes } from "@/lib/segmentation";
import { PRESETS, DEFAULT_PRESET_ID } from "@/lib/presets";

const FPS = 30;
const defaultScript = PRESETS.find((preset) => preset.id === DEFAULT_PRESET_ID)!.script;
const defaultScenes = buildScenes(defaultScript, { wpm: 145, fps: FPS });

// No zod schema is used for these compositions; this satisfies Remotion's
// `Schema extends AnyZodObject` constraint without pulling in zod directly.
type NoSchema = Record<string, unknown> & { _def: unknown; _input: unknown };

export function RemotionRoot() {
  return (
    <>
      <RemotionComposition<NoSchema, KineticCastProps>
        id="KineticCastLandscape"
        component={KineticCast}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={getTotalDurationInFrames(defaultScenes)}
        defaultProps={{ scenes: defaultScenes }}
        calculateMetadata={async ({ props }) => ({
          durationInFrames: getTotalDurationInFrames(props.scenes),
        })}
      />
      <RemotionComposition<NoSchema, KineticCastProps>
        id="KineticCastPortrait"
        component={KineticCast}
        fps={FPS}
        width={1080}
        height={1920}
        durationInFrames={getTotalDurationInFrames(defaultScenes)}
        defaultProps={{ scenes: defaultScenes }}
        calculateMetadata={async ({ props }) => ({
          durationInFrames: getTotalDurationInFrames(props.scenes),
        })}
      />
    </>
  );
}
