import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { StickerMatch } from "@/lib/stickerMatcher";
import { STICKER_ICON_BY_CATEGORY } from "@/components/Video/icons";

interface StickerBadgeProps {
  sticker: StickerMatch;
  index: number;
}

export function StickerBadge({ sticker, index }: StickerBadgeProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Icon = STICKER_ICON_BY_CATEGORY[sticker.category];

  const entrance = spring({
    frame: frame - index * 4,
    fps,
    config: { damping: 12, mass: 0.6 },
  });

  const float = interpolate(
    Math.sin((frame + index * 15) / 12),
    [-1, 1],
    [-6, 6]
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 48 + index * 110,
        right: 56,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        borderRadius: 999,
        border: "2px solid #000000",
        backgroundColor: "#FFFFFF",
        transform: `translateY(${float}px) scale(${entrance})`,
        opacity: entrance,
      }}
    >
      <Icon color="#000000" size={28} strokeWidth={2.25} />
      <span
        style={{
          fontFamily: "sans-serif",
          fontWeight: 600,
          fontSize: 20,
          color: "#000000",
          whiteSpace: "nowrap",
        }}
      >
        {sticker.label}
      </span>
    </div>
  );
}
