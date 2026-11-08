"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  Film,
  Music,
  Plus,
  Trash2,
  Play,
  Check,
  Sparkles,
} from "lucide-react";
import { timelineActions } from "@/lib/timelineStore";
import type { TimelineClip } from "@/types/timeline";

interface UploadedItem {
  id: string;
  name: string;
  type: "image" | "video" | "audio";
  url: string;
  sizeMb: string;
  durationSeconds?: number;
}

const SAMPLE_MEDIA: UploadedItem[] = [
  {
    id: "sample-phone",
    name: "3D iPhone Mockup UI",
    type: "image",
    url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80",
    sizeMb: "1.2 MB",
  },
  {
    id: "sample-bgm",
    name: "Cyber Chill Lo-Fi Beat",
    type: "audio",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    sizeMb: "2.8 MB",
    durationSeconds: 15,
  },
];

export function UploadsPanel() {
  const [items, setItems] = useState<UploadedItem[]>(SAMPLE_MEDIA);
  const [activeFilter, setActiveFilter] = useState<"all" | "image" | "video" | "audio">("all");
  const [addedId, setAddedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith("video/");
      const isAudio = file.type.startsWith("audio/");
      const isImg = file.type.startsWith("image/");

      const itemType = isVideo ? "video" : isAudio ? "audio" : "image";
      const newItem: UploadedItem = {
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        type: itemType,
        url,
        sizeMb: (file.size / (1024 * 1024)).toFixed(1) + " MB",
      };

      setItems((prev) => [newItem, ...prev]);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddToTimeline = (item: UploadedItem) => {
    const clipDuration = item.durationSeconds ? Math.round(item.durationSeconds * 30) : 90; // default 3 sec

    if (item.type === "audio") {
      const audioClip: TimelineClip = {
        id: `clip-audio-${Date.now()}`,
        trackId: "track-audio",
        name: item.name,
        type: "audio",
        startFrame: 0,
        durationInFrames: clipDuration,
        transform: { x: 0, y: 0, scale: 1, rotation: 0 },
        opacity: 1,
        payload: {
          type: "audio",
          data: {
            sourceUrl: item.url,
            name: item.name,
            volume: 1,
            trimStartFrames: 0,
            isVoiceover: false,
          },
        },
      };
      timelineActions.addClipToTrack("audio", audioClip);
    } else {
      const mediaClip: TimelineClip = {
        id: `clip-media-${Date.now()}`,
        trackId: "track-media",
        name: item.name,
        type: "media",
        startFrame: 0,
        durationInFrames: clipDuration,
        transform: { x: 0, y: 0, scale: 0.8, rotation: 0 },
        opacity: 1,
        payload: {
          type: "media",
          data: {
            mediaType: item.type as "image" | "video",
            sourceUrl: item.url,
            name: item.name,
            objectFit: "contain",
          },
        },
      };
      timelineActions.addClipToTrack("media", mediaClip);
    }

    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const filteredItems = items.filter(
    (i) => activeFilter === "all" || i.type === activeFilter
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Upload Dropzone */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-white/[0.12] bg-[#16171b] hover:border-[#f1591f]/50 hover:bg-[#1c1d22] transition-colors cursor-pointer group text-center"
      >
        <div className="h-10 w-10 rounded-xl bg-orange-600/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <Upload size={18} />
        </div>
        <span className="text-xs font-bold text-white mb-0.5">Click to upload media</span>
        <span className="text-[10px] text-[#94a3b8]">Images (PNG, JPG), Videos (MP4), Audios (MP3)</span>
      </div>

      {/* Media Type Filter Pills */}
      <div className="flex items-center gap-1 bg-[#16171b] p-1 rounded-xl border border-white/[0.08]">
        {(["all", "image", "video", "audio"] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`flex-1 py-1 rounded-lg text-[10px] font-semibold capitalize transition cursor-pointer ${
              activeFilter === filter
                ? "bg-[#f1591f] text-white shadow-sm"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Uploaded Media Items List */}
      <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredItems.map((item) => {
          const isAdded = addedId === item.id;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.08] bg-[#16171b] hover:border-white/20 transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Thumbnail Icon */}
                <div className="h-10 w-10 rounded-lg bg-[#1c1d22] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {item.type === "image" ? (
                    <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                  ) : item.type === "video" ? (
                    <Film size={16} className="text-orange-400" />
                  ) : (
                    <Music size={16} className="text-amber-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate max-w-[140px]">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-[#94a3b8] flex items-center gap-1.5 font-mono">
                    <span className="uppercase">{item.type}</span>
                    <span>•</span>
                    <span>{item.sizeMb}</span>
                  </div>
                </div>
              </div>

              {/* Action: Add to timeline */}
              <button
                type="button"
                onClick={() => handleAddToTimeline(item)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  isAdded
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-[#f1591f] hover:bg-orange-600 text-white shadow-sm hover:scale-105 active:scale-95"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check size={11} />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus size={11} />
                    <span>Insert</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
