"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import type { BackgroundConfig, BackgroundStyle } from "@/remotion/backgrounds/types";

interface BackgroundPickerProps {
  value: BackgroundConfig;
  onChange: (background: BackgroundConfig) => void;
}

const STYLE_OPTIONS: { id: BackgroundStyle; label: string }[] = [
  { id: "none", label: "None" },
  { id: "grid", label: "Grid" },
  { id: "galaxy", label: "Galaxy" },
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function BackgroundPicker({ value, onChange }: BackgroundPickerProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyImageFile = useCallback(
    async (file: File | undefined) => {
      if (!file || !file.type.startsWith("image/")) return;
      const dataUrl = await readFileAsDataUrl(file);
      onChange({ style: "image", imageDataUrl: dataUrl });
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDraggingOver(false);
      void applyImageFile(event.dataTransfer.files[0]);
    },
    [applyImageFile]
  );

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div>
        <h2 className="text-sm font-semibold">Background</h2>
        <p className="text-xs text-muted mt-0.5">
          Applied behind text in Center Impact, Word Cascade, and Cyber Scramble scenes.
        </p>
      </div>

      <div className="flex gap-2">
        {STYLE_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange({ style: option.id, imageDataUrl: value.imageDataUrl })}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
              value.style === option.id
                ? "border-accent bg-accent/15 text-accent"
                : "border-border bg-surface-raised text-foreground hover:border-accent/60"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {value.style === "image" && value.imageDataUrl ? (
        <div className="relative overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.imageDataUrl}
            alt="Background preview"
            className="h-28 w-full object-cover grayscale"
          />
          <button
            type="button"
            onClick={() => onChange({ style: "none", imageDataUrl: null })}
            className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white hover:bg-black"
            aria-label="Remove background image"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-5 text-center transition-colors ${
            isDraggingOver ? "border-accent bg-accent/10" : "border-border hover:border-accent/60"
          }`}
        >
          <ImagePlus size={20} className="text-muted" />
          <p className="text-xs text-muted">Drop an image, or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void applyImageFile(event.target.files?.[0])}
          />
        </div>
      )}
    </div>
  );
}
