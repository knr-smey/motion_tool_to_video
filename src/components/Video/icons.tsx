// Hand-written inline SVGs for use inside Remotion scenes.
//
// lucide-react's forwardRef icon components crash with a React error #130
// ("invalid element type") when rendered inside Remotion's headless Chromium
// render pipeline, even though they render fine in the Next.js UI chrome
// and in plain React. These plain function components sidestep that by
// avoiding forwardRef/exotic component types entirely.

import type { ReactElement } from "react";
import type { StickerCategory } from "@/lib/stickerMatcher";

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function iconProps({ size = 24, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

export function LandmarkIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M3 21h18" />
      <path d="M5 21v-9M9 21v-9M15 21v-9M19 21v-9" />
      <path d="M2 10l10-6 10 6" />
    </svg>
  );
}

export function CpuIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <rect x="10" y="10" width="4" height="4" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </svg>
  );
}

export function BanknoteIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 10h.01M18 14h.01" />
    </svg>
  );
}

export function RocketIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 2c3 2 5 6 5 10 0 3-1.5 6-5 10-3.5-4-5-7-5-10 0-4 2-8 5-10Z" />
      <path d="M8 16c-2 1-3 3-3 6 3 0 5-1 6-3" />
      <path d="M16 16c2 1 3 3 3 6-3 0-5-1-6-3" />
      <circle cx="12" cy="10" r="1.5" />
    </svg>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
      <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15Z" />
    </svg>
  );
}

// Resolved from a scene's sticker `category` at render time (see the note
// in lib/stickerMatcher.ts on why icon components can't live in scene data).
export const STICKER_ICON_BY_CATEGORY: Record<StickerCategory, (props: IconProps) => ReactElement> = {
  history: LandmarkIcon,
  technology: CpuIcon,
  finance: BanknoteIcon,
  science: RocketIcon,
  general: SparklesIcon,
};
