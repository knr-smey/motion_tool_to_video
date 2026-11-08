"use client";

import {
  Plus,
  Upload,
  Layout,
  Type,
  Film,
  Music,
  Subtitles,
} from "lucide-react";

export type NavTab = "text" | "script" | "canvas" | "audio" | "uploads" | "subtitles";

interface LeftActivityDockProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAiGenerator: () => void;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
}

export function LeftActivityDock({
  activeTab,
  onSelectTab,
  onOpenAiGenerator,
  isDrawerOpen,
  onToggleDrawer,
}: LeftActivityDockProps) {
  const items: { id: NavTab; label: string; icon: typeof Type }[] = [
    { id: "text", label: "Text", icon: Type },
    { id: "script", label: "Script", icon: Film },
    { id: "canvas", label: "Canvas", icon: Layout },
    { id: "audio", label: "Audios", icon: Music },
    { id: "uploads", label: "Uploads", icon: Upload },
    { id: "subtitles", label: "Subtitles", icon: Subtitles },
  ];

  const handleTabClick = (tab: NavTab) => {
    if (activeTab === tab && isDrawerOpen) {
      // Toggle drawer closed if clicking same active tab
      onToggleDrawer();
    } else {
      onSelectTab(tab);
      if (!isDrawerOpen) onToggleDrawer();
    }
  };

  return (
    <aside className="w-16 shrink-0 border-r border-border/80 bg-[#101013] flex flex-col items-center py-2.5 gap-1 select-none z-20">
      {/* Top Plus / AI Action Button */}
      <button
        type="button"
        onClick={onOpenAiGenerator}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised border border-border/80 text-foreground/80 hover:text-white hover:border-accent hover:bg-accent/15 transition-colors duration-150 shadow-sm cursor-pointer mb-2"
        title="AI Explainer Video Generator"
      >
        <Plus size={18} className="text-accent" />
      </button>

      {/* Nav items */}
      <div className="flex flex-col gap-1 w-full px-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && isDrawerOpen;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              className={`w-full h-12 flex flex-col items-center justify-center rounded-xl border transition-colors duration-150 cursor-pointer ${
                isActive
                  ? "bg-accent/15 text-accent border-accent/40 shadow-sm"
                  : "border-transparent text-muted hover:text-foreground hover:bg-white/5"
              }`}
              title={item.label}
            >
              <Icon
                size={17}
                className={`mb-1 transition-colors duration-150 ${
                  isActive ? "text-accent" : "text-muted"
                }`}
              />
              <span className="text-[10px] leading-tight font-medium tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
