export type BackgroundStyle = "none" | "grid" | "galaxy" | "image";

export interface BackgroundConfig {
  style: BackgroundStyle;
  // Data URL of a user-dropped image. Only used when style === "image".
  // Stored as a string (not a File) so it survives Remotion's JSON prop
  // serialization — see the note in lib/stickerMatcher.ts for why that
  // boundary matters.
  imageDataUrl: string | null;
}

export const DEFAULT_BACKGROUND: BackgroundConfig = {
  style: "none",
  imageDataUrl: null,
};
