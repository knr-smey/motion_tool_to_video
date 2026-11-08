import type { TextMotionConfig } from "@/remotion/textMotion/types";
import type { BackgroundConfig } from "@/remotion/backgrounds/types";
import type { Scene } from "@/lib/segmentation";

export type TrackType = "text" | "media" | "graphic" | "background" | "audio";
export type MediaType = "image" | "video" | "audio";

export interface Transform2D {
  x: number;          // Pixels offset from canvas center
  y: number;          // Pixels offset from canvas center
  scale: number;      // 1.0 = 100%
  rotation: number;   // Degrees (-180 to 180)
  width?: number;     // Base pixel width
  height?: number;    // Base pixel height
}

export interface Transition {
  id: string;
  type: "fade" | "slide-left" | "slide-right" | "wipe" | "zoom" | "dissolve";
  durationInFrames: number;
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

// -------------------------------------------------------------
// Clip Payloads
// -------------------------------------------------------------
export interface TextClipPayload {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
  textAnimation?: TextMotionConfig;
  textStroke?: string;
  textBackgroundColor?: string;
  textShadow?: boolean;
}

export interface MediaClipPayload {
  mediaType: "image" | "video";
  sourceUrl: string;
  name: string;
  originalDurationInFrames?: number;
  trimStartFrames?: number; // In-point offset inside raw media
  volume?: number;          // 0.0 to 1.0 (for video audio)
  playbackRate?: number;    // 0.5x to 2.0x
  objectFit?: "cover" | "contain" | "fill";
}

export interface GraphicClipPayload {
  type: "bento-card" | "phone-mockup" | "badge" | "callout" | "sticker";
  title?: string;
  subtitle?: string;
  icon?: string;
  accentColor?: string;
  customData?: Record<string, unknown>;
}

export interface AudioClipPayload {
  sourceUrl: string;
  name: string;
  volume: number;          // 0.0 to 1.0
  trimStartFrames: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  isVoiceover: boolean;
  waveformData?: number[];  // Pre-computed normalized audio peaks (0.0 to 1.0)
}

// -------------------------------------------------------------
// Timeline Clip
// -------------------------------------------------------------
export type ClipPayload =
  | { type: "text"; data: TextClipPayload }
  | { type: "media"; data: MediaClipPayload }
  | { type: "graphic"; data: GraphicClipPayload }
  | { type: "audio"; data: AudioClipPayload }
  | { type: "background"; data: BackgroundConfig };

export interface TimelineClip {
  id: string;
  trackId: string;
  name: string;
  type: TrackType;

  // Global Timeline Timing (in Frames)
  startFrame: number;
  durationInFrames: number;

  // Spatial transformations
  transform: Transform2D;
  opacity: number;

  // Transitions
  transitionIn?: Transition;
  transitionOut?: Transition;

  // Polymorphic Payload
  payload: ClipPayload;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: TrackType;
  isLocked: boolean;
  isVisible: boolean;
  isMuted?: boolean;       // Audio-only
  order: number;           // Visual z-index & vertical track ordering (higher = on top)
  clips: TimelineClip[];
}

export interface ProjectComposition {
  id: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  tracks: TimelineTrack[];
  backgroundColor: string;
}

// -------------------------------------------------------------
// Bridge Helper: Convert existing Scene[] into Tracks & Clips
// -------------------------------------------------------------
export function scenesToTracks(scenes: Scene[], fps = 30): TimelineTrack[] {
  let currentFrame = 0;
  const textClips: TimelineClip[] = [];
  const audioClips: TimelineClip[] = [];

  scenes.forEach((scene, index) => {
    const start = currentFrame;
    const duration = scene.durationInFrames;

    // Text clip
    textClips.push({
      id: `text-clip-${scene.id || index}`,
      trackId: "track-text",
      name: `Scene #${index + 1}: ${scene.text.slice(0, 16)}...`,
      type: "text",
      startFrame: start,
      durationInFrames: duration,
      transform: {
        x: scene.positionX ?? 0,
        y: scene.positionY ?? 0,
        scale: 1.0,
        rotation: scene.rotation ?? 0,
      },
      opacity: scene.opacity ?? 1.0,
      payload: {
        type: "text",
        data: {
          text: scene.text,
          fontFamily: scene.fontFamily ?? "Moul",
          fontSize: scene.fontSize ?? 88,
          fontWeight: scene.fontWeight ?? 700,
          color: scene.textColor ?? "#FFFFFF",
          textAlign: scene.textAlign ?? "center",
          lineHeight: scene.lineHeight ?? 1.3,
          letterSpacing: scene.letterSpacing ?? 0,
          textAnimation: scene.textAnimation,
          textStroke: scene.textStroke,
          textBackgroundColor: scene.textBackgroundColor,
          textShadow: scene.textShadow,
        },
      },
    });

    // Audio clip if scene has voiceover
    if (scene.audioUrl) {
      audioClips.push({
        id: `audio-clip-${scene.id || index}`,
        trackId: "track-audio",
        name: `Voiceover #${index + 1}`,
        type: "audio",
        startFrame: start,
        durationInFrames: duration,
        transform: { x: 0, y: 0, scale: 1, rotation: 0 },
        opacity: 1.0,
        payload: {
          type: "audio",
          data: {
            sourceUrl: scene.audioUrl,
            name: `Voiceover #${index + 1}`,
            volume: 1.0,
            trimStartFrames: 0,
            isVoiceover: true,
          },
        },
      });
    }

    currentFrame += duration;
  });

  return [
    {
      id: "track-text",
      name: "Typography Track",
      type: "text",
      isLocked: false,
      isVisible: true,
      order: 3,
      clips: textClips,
    },
    {
      id: "track-graphics",
      name: "Graphics & UI Track",
      type: "graphic",
      isLocked: false,
      isVisible: true,
      order: 2,
      clips: [],
    },
    {
      id: "track-media",
      name: "Media & Video Track",
      type: "media",
      isLocked: false,
      isVisible: true,
      order: 1,
      clips: [],
    },
    {
      id: "track-audio",
      name: "Voiceover & Audio",
      type: "audio",
      isLocked: false,
      isVisible: true,
      isMuted: false,
      order: 0,
      clips: audioClips,
    },
  ];
}
