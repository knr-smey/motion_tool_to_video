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

export function ApiIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="2" y="5" width="8" height="6" rx="1.5" />
      <rect x="14" y="13" width="8" height="6" rx="1.5" />
      <path d="M10 8h4a2 2 0 0 1 2 2v3" />
      <polyline points="12 6 10 8 12 10" />
      <path d="M14 16h-4a2 2 0 0 1-2-2v-3" />
      <polyline points="12 18 14 16 12 14" />
    </svg>
  );
}

export function ServerIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="2" y="3" width="20" height="7" rx="2" />
      <rect x="2" y="14" width="20" height="7" rx="2" />
      <line x1="6" y1="6.5" x2="6.01" y2="6.5" />
      <line x1="10" y1="6.5" x2="10.01" y2="6.5" />
      <line x1="6" y1="17.5" x2="6.01" y2="17.5" />
      <line x1="10" y1="17.5" x2="10.01" y2="17.5" />
    </svg>
  );
}

export function DatabaseIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
    </svg>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

export function NetworkIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
      <path d="M12 12V8" />
    </svg>
  );
}

export function SecurityIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export const STICKER_ICON_BY_CATEGORY: Record<StickerCategory, (props: IconProps) => ReactElement> = {
  history: LandmarkIcon,
  technology: CpuIcon,
  finance: BanknoteIcon,
  science: RocketIcon,
  api: ApiIcon,
  server: ServerIcon,
  database: DatabaseIcon,
  code: CodeIcon,
  network: NetworkIcon,
  security: SecurityIcon,
  general: SparklesIcon,
};
