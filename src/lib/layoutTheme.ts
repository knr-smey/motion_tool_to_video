import type { SceneLayout } from "@/lib/segmentation";

interface LayoutTheme {
  label: string;
  chipClass: string;
}

export const LAYOUT_THEME: Record<SceneLayout, LayoutTheme> = {
  "center-impact": {
    label: "Pop",
    chipClass: "bg-orange-500/20 border-orange-500/60 text-orange-300",
  },
  "fade-rise": {
    label: "Fade & Rise",
    chipClass: "bg-indigo-500/20 border-indigo-500/60 text-indigo-300",
  },
  "pan-slide": {
    label: "Pan & Slide",
    chipClass: "bg-cyan-500/20 border-cyan-500/60 text-cyan-300",
  },
  "breathe-float": {
    label: "Breathe",
    chipClass: "bg-teal-500/20 border-teal-500/60 text-teal-300",
  },
  "highlighter-sweep": {
    label: "Wipe",
    chipClass: "bg-violet-500/20 border-violet-500/60 text-violet-300",
  },
  "word-cascade": {
    label: "Cascade",
    chipClass: "bg-sky-500/20 border-sky-500/60 text-sky-300",
  },
  "cyber-scramble": {
    label: "Scramble",
    chipClass: "bg-emerald-500/20 border-emerald-500/60 text-emerald-300",
  },
  "node-connector": {
    label: "Node Flow",
    chipClass: "bg-cyan-500/20 border-cyan-500/60 text-cyan-300",
  },
  typewriter: {
    label: "Typewriter",
    chipClass: "bg-amber-500/20 border-amber-500/60 text-amber-300",
  },
  "static-clean": {
    label: "None",
    chipClass: "bg-zinc-500/20 border-zinc-500/60 text-zinc-300",
  },
};
