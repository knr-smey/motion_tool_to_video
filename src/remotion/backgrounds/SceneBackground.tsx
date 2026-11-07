import type { BackgroundConfig } from "./types";
import { GridBackground } from "./GridBackground";
import { GalaxyBackground } from "./GalaxyBackground";
import { ImageBackground } from "./ImageBackground";

export function SceneBackground({ style, imageDataUrl }: BackgroundConfig) {
  if (style === "grid") return <GridBackground />;
  if (style === "galaxy") return <GalaxyBackground />;
  if (style === "image" && imageDataUrl) return <ImageBackground src={imageDataUrl} />;
  return null;
}
