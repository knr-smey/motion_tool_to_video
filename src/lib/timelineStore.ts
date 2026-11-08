"use client";

import { useSyncExternalStore } from "react";
import type {
  TimelineTrack,
  TimelineClip,
  Transform2D,
  ProjectComposition,
} from "@/types/timeline";

// -----------------------------------------------------------------
// Generic Lightweight State Store compatible with React 18 & 19
// -----------------------------------------------------------------
type Listener = () => void;

function createStore<T>(initialState: T) {
  let state = initialState;
  const listeners = new Set<Listener>();

  return {
    getState: () => state,
    setState: (updater: Partial<T> | ((prev: T) => Partial<T>)) => {
      const nextPartial = typeof updater === "function" ? updater(state) : updater;
      state = { ...state, ...nextPartial };
      listeners.forEach((l) => l());
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export interface TimelineState {
  tracks: TimelineTrack[];
  selectedClipId: string | null;
  currentFrame: number;
  isPlaying: boolean;
  timelineZoom: number; // Pixels per second (e.g. 50 = 50px/sec)
  fps: number;
  backgroundColor: string;
  undoStack: TimelineTrack[][];
  redoStack: TimelineTrack[][];
}

const initialTimelineState: TimelineState = {
  tracks: [
    {
      id: "track-text",
      name: "Typography Track",
      type: "text",
      isLocked: false,
      isVisible: true,
      order: 3,
      clips: [],
    },
    {
      id: "track-graphics",
      name: "Graphics & UI Track",
      type: "graphic",
      isLocked: false,
      isVisible: true,
      order: 2,
      clips: [],
    },
    {
      id: "track-media",
      name: "Media & Video Track",
      type: "media",
      isLocked: false,
      isVisible: true,
      order: 1,
      clips: [],
    },
    {
      id: "track-audio",
      name: "Voiceover & Audio",
      type: "audio",
      isLocked: false,
      isVisible: true,
      isMuted: false,
      order: 0,
      clips: [],
    },
  ],
  selectedClipId: null,
  currentFrame: 0,
  isPlaying: false,
  timelineZoom: 60,
  fps: 30,
  backgroundColor: "#000000",
  undoStack: [],
  redoStack: [],
};

export const store = createStore<TimelineState>(initialTimelineState);

// -----------------------------------------------------------------
// React Hook
// -----------------------------------------------------------------
export function useTimelineStore<U>(selector: (state: TimelineState) => U): U {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState())
  );
}

// -----------------------------------------------------------------
// Action Helpers
// -----------------------------------------------------------------
export const timelineActions = {
  setTracks: (tracks: TimelineTrack[]) => {
    const prev = store.getState().tracks;
    store.setState((s) => ({
      tracks,
      undoStack: [...s.undoStack.slice(-15), prev],
      redoStack: [],
    }));
  },

  selectClip: (clipId: string | null) => {
    store.setState({ selectedClipId: clipId });
  },

  setCurrentFrame: (frame: number) => {
    store.setState({ currentFrame: Math.max(0, frame) });
  },

  setIsPlaying: (isPlaying: boolean) => {
    store.setState({ isPlaying });
  },

  setZoom: (zoom: number) => {
    store.setState({ timelineZoom: Math.max(20, Math.min(200, zoom)) });
  },

  updateClipTransform: (clipId: string, patch: Partial<Transform2D>) => {
    const s = store.getState();
    const newTracks = s.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) =>
        clip.id === clipId
          ? { ...clip, transform: { ...clip.transform, ...patch } }
          : clip
      ),
    }));
    store.setState({ tracks: newTracks });
  },

  updateClipTiming: (
    clipId: string,
    startFrame: number,
    durationInFrames: number
  ) => {
    const s = store.getState();
    const newTracks = s.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) =>
        clip.id === clipId
          ? {
              ...clip,
              startFrame: Math.max(0, startFrame),
              durationInFrames: Math.max(5, durationInFrames),
            }
          : clip
      ),
    }));
    store.setState({ tracks: newTracks });
  },

  updateClipPayload: (clipId: string, newPayloadData: Record<string, unknown>) => {
    const s = store.getState();
    const newTracks = s.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) =>
        clip.id === clipId
          ? {
              ...clip,
              payload: {
                ...clip.payload,
                data: { ...(clip.payload as any).data, ...newPayloadData },
              } as any,
            }
          : clip
      ),
    }));
    store.setState({ tracks: newTracks });
  },

  splitClip: (clipId: string, splitFrame: number) => {
    const s = store.getState();
    const newTracks = s.tracks.map((track) => {
      const clipIndex = track.clips.findIndex((c) => c.id === clipId);
      if (clipIndex === -1) return track;

      const targetClip = track.clips[clipIndex];
      const relativeSplit = splitFrame - targetClip.startFrame;

      if (relativeSplit <= 5 || relativeSplit >= targetClip.durationInFrames - 5) {
        return track; // Too close to boundaries
      }

      const firstHalf: TimelineClip = {
        ...targetClip,
        durationInFrames: relativeSplit,
      };

      const secondHalf: TimelineClip = {
        ...targetClip,
        id: `${targetClip.id}-split-${Date.now()}`,
        startFrame: splitFrame,
        durationInFrames: targetClip.durationInFrames - relativeSplit,
      };

      const newClips = [...track.clips];
      newClips.splice(clipIndex, 1, firstHalf, secondHalf);
      return { ...track, clips: newClips };
    });

    store.setState({
      tracks: newTracks,
      undoStack: [...s.undoStack.slice(-15), s.tracks],
      redoStack: [],
    });
  },

  deleteClip: (clipId: string) => {
    const s = store.getState();
    const newTracks = s.tracks.map((track) => ({
      ...track,
      clips: track.clips.filter((c) => c.id !== clipId),
    }));
    store.setState({
      tracks: newTracks,
      selectedClipId: s.selectedClipId === clipId ? null : s.selectedClipId,
      undoStack: [...s.undoStack.slice(-15), s.tracks],
      redoStack: [],
    });
  },

  addClipToTrack: (trackType: TimelineTrack["type"], clip: TimelineClip) => {
    const s = store.getState();
    let found = false;
    const newTracks = s.tracks.map((track) => {
      if (track.type === trackType && !found) {
        found = true;
        return {
          ...track,
          clips: [...track.clips, clip],
        };
      }
      return track;
    });

    store.setState({
      tracks: newTracks,
      selectedClipId: clip.id,
      undoStack: [...s.undoStack.slice(-15), s.tracks],
      redoStack: [],
    });
  },

  toggleTrackLock: (trackId: string) => {
    store.setState((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId ? { ...t, isLocked: !t.isLocked } : t
      ),
    }));
  },

  toggleTrackVisibility: (trackId: string) => {
    store.setState((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId ? { ...t, isVisible: !t.isVisible } : t
      ),
    }));
  },

  toggleTrackMute: (trackId: string) => {
    store.setState((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId ? { ...t, isMuted: !t.isMuted } : t
      ),
    }));
  },

  undo: () => {
    const s = store.getState();
    if (s.undoStack.length === 0) return;
    const previous = s.undoStack[s.undoStack.length - 1];
    store.setState({
      tracks: previous,
      undoStack: s.undoStack.slice(0, -1),
      redoStack: [s.tracks, ...s.redoStack],
    });
  },

  redo: () => {
    const s = store.getState();
    if (s.redoStack.length === 0) return;
    const next = s.redoStack[0];
    store.setState({
      tracks: next,
      undoStack: [...s.undoStack, s.tracks],
      redoStack: s.redoStack.slice(1),
    });
  },
};
