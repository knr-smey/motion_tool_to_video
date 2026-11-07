import type { Scene } from "@/lib/segmentation";
import { STICKER_ICON_BY_CATEGORY } from "@/components/Video/icons";

const LAYOUT_LABELS: Record<Scene["layout"], string> = {
  "center-impact": "Center Impact",
  "highlighter-sweep": "Highlighter Sweep",
  "word-cascade": "Word Cascade",
  "cyber-scramble": "Cyber Scramble",
};

interface ScenePlaylistProps {
  scenes: Scene[];
}

export function ScenePlaylist({ scenes }: ScenePlaylistProps) {
  if (scenes.length === 0) {
    return <p className="text-sm text-neutral-500">Enter a script to generate scenes.</p>;
  }

  return (
    <ol className="flex flex-col gap-2">
      {scenes.map((scene, index) => (
        <li
          key={scene.id}
          className="flex items-start gap-3 border border-neutral-300 rounded-lg p-3"
        >
          <span className="text-sm font-semibold text-neutral-400 w-6">{index + 1}</span>
          <div className="flex-1">
            <p className="text-sm leading-relaxed">{scene.text}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
              <span>{LAYOUT_LABELS[scene.layout]}</span>
              <span>{scene.durationSeconds.toFixed(2)}s</span>
              <span>{scene.wordCount} words</span>
              {scene.stickers.map((sticker) => {
                const Icon = STICKER_ICON_BY_CATEGORY[sticker.category];
                return (
                  <span key={sticker.category} className="flex items-center gap-1">
                    <Icon size={14} />
                    {sticker.label}
                  </span>
                );
              })}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
