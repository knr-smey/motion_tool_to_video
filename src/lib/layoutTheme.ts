import type { SceneLayout } from "@/lib/segmentation";

interface LayoutTheme {
  label: string;
  chipClass: string;
}

export const LAYOUT_THEME: Record<SceneLayout, LayoutTheme> = {
  "center-impact": {
    label: "Center Impact",
    chipClass: "bg-orange-500/20 border-orange-500/60 text-orange-300",
  },
  "highlighter-sweep": {
    label: "Highlighter Sweep",
    chipClass: "bg-violet-500/20 border-violet-500/60 text-violet-300",
  },
  "word-cascade": {
    label: "Word Cascade",
    chipClass: "bg-sky-500/20 border-sky-500/60 text-sky-300",
  },
  "cyber-scramble": {
    label: "Cyber Scramble",
    chipClass: "bg-emerald-500/20 border-emerald-500/60 text-emerald-300",
  },
};
