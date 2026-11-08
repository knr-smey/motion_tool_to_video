"use client";

import { useState } from "react";
import {
  MousePointer2,
  Hand,
  Undo2,
  Redo2,
  Share2,
  Download,
  RectangleHorizontal,
  RectangleVertical,
} from "lucide-react";
import type { AspectRatio } from "./Video/KineticStage";

interface TopbarProps {
  aspectRatio?: AspectRatio;
  onToggleAspectRatio?: (ratio: AspectRatio) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function Topbar({
  aspectRatio = "16:9",
  onToggleAspectRatio,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: TopbarProps) {
  const [projectTitle, setProjectTitle] = useState("Untitled project");
  const [activeTool, setActiveTool] = useState<"pointer" | "hand">("pointer");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportClick = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("MP4 Render command ready: run `npm run remotion:render` to export full resolution video!");
    }, 600);
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-[#111114] px-4 select-none">
      {/* Left: Logo & Project Title */}
      <div className="flex items-center gap-3">
        {/* Brand Play Logo */}
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-accent to-orange-400 text-white shadow-sm shadow-accent/30 cursor-pointer">
          <svg className="h-3.5 w-3.5 fill-current translate-x-0.5" viewBox="0 0 24 24">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
        </div>

        {/* Project Title Input */}
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          className="bg-transparent text-xs font-semibold text-foreground/90 hover:text-foreground focus:text-foreground focus:bg-surface-raised/80 px-2 py-1 rounded transition border border-transparent hover:border-border/60 focus:border-border focus:outline-none w-36 sm:w-48 truncate"
          title="Click to rename project"
        />
      </div>

      {/* Center: Canvas Tools & History */}
      <div className="flex items-center gap-1">
        {/* Pointer Select Tool */}
        <button
          type="button"
          onClick={() => setActiveTool("pointer")}
          className={`flex h-7 w-7 items-center justify-center rounded-md transition cursor-pointer ${
            activeTool === "pointer"
              ? "bg-surface-raised text-accent border border-border/80"
              : "text-muted hover:text-foreground hover:bg-surface-raised/60"
          }`}
          title="Select pointer tool"
        >
          <MousePointer2 size={14} />
        </button>

        {/* Hand Pan Tool */}
        <button
          type="button"
          onClick={() => setActiveTool("hand")}
          className={`flex h-7 w-7 items-center justify-center rounded-md transition cursor-pointer ${
            activeTool === "hand"
              ? "bg-surface-raised text-accent border border-border/80"
              : "text-muted hover:text-foreground hover:bg-surface-raised/60"
          }`}
          title="Hand pan tool"
        >
          <Hand size={14} />
        </button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* Undo */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-raised/60 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Undo"
        >
          <Undo2 size={14} />
        </button>

        {/* Redo */}
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-raised/60 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Redo"
        >
          <Redo2 size={14} />
        </button>
      </div>

      {/* Right: Aspect ratio, Avatars & Export Button */}
      <div className="flex items-center gap-2.5">
        {/* Aspect Ratio Pill */}
        <div className="flex items-center rounded-lg border border-border/80 bg-surface/80 p-0.5">
          <button
            type="button"
            onClick={() => onToggleAspectRatio?.("16:9")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition cursor-pointer ${
              aspectRatio === "16:9"
                ? "bg-accent/20 text-accent font-semibold border border-accent/40"
                : "text-muted hover:text-foreground"
            }`}
            title="16:9 Landscape"
          >
            <RectangleHorizontal size={13} />
            <span>16:9</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleAspectRatio?.("9:16")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition cursor-pointer ${
              aspectRatio === "9:16"
                ? "bg-accent/20 text-accent font-semibold border border-accent/40"
                : "text-muted hover:text-foreground"
            }`}
            title="9:16 Portrait (TikTok/Reels)"
          >
            <RectangleVertical size={13} />
            <span>9:16</span>
          </button>
        </div>

        {/* Primary Export Button */}
        <button
          type="button"
          onClick={handleExportClick}
          className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-600 px-3.5 py-1 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition cursor-pointer active:scale-95"
          title="Export Video"
        >
          <Download size={13} />
          <span>{isExporting ? "Rendering..." : "Export"}</span>
        </button>
      </div>
    </header>
  );
}
