"use client";

import React, { useRef, useState, useEffect } from "react";
import { Move, RotateCw, X } from "lucide-react";
import { useTimelineStore, timelineActions } from "@/lib/timelineStore";
import type { TimelineClip } from "@/types/timeline";

interface TransformOverlayProps {
  compWidth: number;
  compHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function TransformOverlay({
  compWidth,
  compHeight,
  containerRef,
}: TransformOverlayProps) {
  const tracks = useTimelineStore((s) => s.tracks);
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);

  // Find currently selected clip across all tracks
  const selectedClip = React.useMemo(() => {
    if (!selectedClipId) return null;
    for (const track of tracks) {
      const found = track.clips.find((c) => c.id === selectedClipId);
      if (found) return found;
    }
    return null;
  }, [tracks, selectedClipId]);

  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          setScale(rect.width / compWidth);
        }
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [compWidth, containerRef]);

  if (!selectedClip || selectedClip.type === "audio") return null;

  const transform = selectedClip.transform ?? { x: 0, y: 0, scale: 1, rotation: 0 };
  const posX = transform.x * scale;
  const posY = transform.y * scale;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPosX = transform.x;
    const initialPosY = transform.y;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const deltaX = (moveEvt.clientX - startX) / scale;
      const deltaY = (moveEvt.clientY - startY) / scale;

      let nextX = Math.round(initialPosX + deltaX);
      let nextY = Math.round(initialPosY + deltaY);

      // Magnetic center snap within 12px
      if (Math.abs(nextX) < 12) nextX = 0;
      if (Math.abs(nextY) < 12) nextY = 0;

      timelineActions.updateClipTransform(selectedClip.id, {
        x: nextX,
        y: nextY,
      });
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const isDeadCenter = transform.x === 0 && transform.y === 0;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Center Snap Guides */}
      {isDragging && (
        <>
          {transform.x === 0 && (
            <div className="absolute inset-y-0 left-1/2 w-[1.5px] bg-[#00b4d8] shadow-[0_0_8px_#00b4d8] pointer-events-none" />
          )}
          {transform.y === 0 && (
            <div className="absolute inset-x-0 top-1/2 h-[1.5px] bg-[#00b4d8] shadow-[0_0_8px_#00b4d8] pointer-events-none" />
          )}
        </>
      )}

      {/* Selected Clip Bounding Box */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px)) rotate(${transform.rotation}deg)`,
          width: 320 * scale * transform.scale,
          height: 160 * scale * transform.scale,
        }}
        className="border-2 border-[#f1591f] rounded-lg pointer-events-auto cursor-move select-none flex items-center justify-center group"
        onPointerDown={handlePointerDown}
      >
        {/* Coordinate Tooltip */}
        {isDragging && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#f1591f] text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap">
            {isDeadCenter ? "🎯 Center (0, 0)" : `X: ${transform.x}  Y: ${transform.y}`}
          </div>
        )}

        {/* 4 Corner Resize Handles */}
        {["-top-1.5 -left-1.5", "-top-1.5 -right-1.5", "-bottom-1.5 -left-1.5", "-bottom-1.5 -right-1.5"].map(
          (pos) => (
            <div
              key={pos}
              className={`absolute ${pos} h-3 w-3 rounded-full border-2 border-[#f1591f] bg-white shadow-md cursor-pointer`}
            />
          )
        )}

        {/* Top-Right Deselect Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            timelineActions.selectClip(null);
          }}
          className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full bg-zinc-900 border border-white/20 text-white flex items-center justify-center shadow hover:bg-zinc-800 cursor-pointer"
        >
          <X size={10} />
        </button>
      </div>
    </div>
  );
}
