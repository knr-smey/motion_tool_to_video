import React from "react";
import {
  Sequence,
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
} from "remotion";
import type { TimelineTrack, TimelineClip } from "@/types/timeline";
import { MotionText } from "./textMotion/MotionText";
import {
  moulFontFamily,
  poppinsFontFamily,
  battambangFontFamily,
  kantumruyProFontFamily,
} from "./fonts";

export interface MultiTrackCompositionProps {
  tracks: TimelineTrack[];
  backgroundColor?: string;
}

function resolveFontFamily(family?: string): string {
  switch (family) {
    case "Battambang":
      return `${poppinsFontFamily}, ${battambangFontFamily}, sans-serif`;
    case "Kantumruy Pro":
      return `${poppinsFontFamily}, ${kantumruyProFontFamily}, sans-serif`;
    case "Poppins":
      return `${poppinsFontFamily}, sans-serif`;
    case "Moul":
    default:
      return `${poppinsFontFamily}, ${moulFontFamily}, sans-serif`;
  }
}

/**
 * Renders an individual timeline clip based on its payload type
 */
function RenderClipContent({ clip }: { clip: TimelineClip }) {
  const { payload, durationInFrames } = clip;

  // 1. TEXT / TYPOGRAPHY CLIP
  if (payload.type === "text") {
    const data = payload.data;
    const activeFont = resolveFontFamily(data.fontFamily);

    return (
      <MotionText
        text={data.text}
        config={data.textAnimation}
        fontFamily={activeFont}
        fontSize={data.fontSize}
        color={data.color}
        textAlign={data.textAlign}
        lineHeight={data.lineHeight}
        durationInFrames={durationInFrames}
        style={{
          textShadow: data.textShadow ? "0 4px 20px rgba(0,0,0,0.8)" : undefined,
          WebkitTextStroke: data.textStroke,
        }}
      />
    );
  }

  // 2. MEDIA (IMAGE OR VIDEO) CLIP
  if (payload.type === "media") {
    const data = payload.data;
    if (data.mediaType === "video") {
      return (
        <OffthreadVideo
          src={data.sourceUrl}
          volume={data.volume ?? 1}
          style={{
            width: "100%",
            height: "100%",
            objectFit: data.objectFit ?? "cover",
            borderRadius: 16,
          }}
        />
      );
    }
    return (
      <Img
        src={data.sourceUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: data.objectFit ?? "contain",
          borderRadius: 16,
        }}
      />
    );
  }

  // 3. GRAPHIC / BENTO / MOCKUP CLIP
  if (payload.type === "graphic") {
    const data = payload.data;
    if (data.type === "phone-mockup") {
      return (
        <div className="w-80 h-[580px] rounded-[48px] border-4 border-zinc-700 bg-zinc-950 p-4 shadow-2xl flex flex-col justify-between text-white relative">
          {/* Dynamic Island */}
          <div className="w-24 h-6 bg-black rounded-full mx-auto" />
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <h4 className="text-lg font-bold text-white mb-2">{data.title || "iPhone Transfer"}</h4>
            <div className="text-3xl font-extrabold text-red-500 mb-4">{data.subtitle || "$2,500"}</div>
            <button className="px-6 py-2 rounded-xl bg-[#f1591f] font-bold text-sm text-white">Send</button>
          </div>
          <div className="w-32 h-1 bg-zinc-600 rounded-full mx-auto mb-2" />
        </div>
      );
    }

    // Bento Card
    return (
      <div className="w-96 rounded-2xl border border-white/10 bg-zinc-900/90 p-5 shadow-2xl backdrop-blur-md text-white">
        {data.title && <h3 className="font-bold text-lg mb-1">{data.title}</h3>}
        {data.subtitle && <p className="text-sm text-zinc-400">{data.subtitle}</p>}
      </div>
    );
  }

  // 4. AUDIO CLIP (Rendered via Remotion <Audio>)
  if (payload.type === "audio") {
    const data = payload.data;
    return <Audio src={data.sourceUrl} volume={data.volume ?? 1} />;
  }

  return null;
}

export function MultiTrackComposition({
  tracks,
  backgroundColor = "#000000",
}: MultiTrackCompositionProps) {
  // Sort tracks by order ascending: lower order renders first (background), higher renders on top
  const sortedTracks = [...tracks].sort((a, b) => a.order - b.order);

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {sortedTracks.map((track) => {
        if (!track.isVisible) return null;

        return track.clips.map((clip) => {
          const isAudio = clip.type === "audio";
          const transform = clip.transform ?? { x: 0, y: 0, scale: 1, rotation: 0 };

          return (
            <Sequence
              key={clip.id}
              from={clip.startFrame}
              durationInFrames={clip.durationInFrames}
            >
              {isAudio ? (
                <RenderClipContent clip={clip} />
              ) : (
                <AbsoluteFill
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
                    opacity: clip.opacity ?? 1,
                    pointerEvents: "none",
                  }}
                >
                  <RenderClipContent clip={clip} />
                </AbsoluteFill>
              )}
            </Sequence>
          );
        });
      })}
    </AbsoluteFill>
  );
}
