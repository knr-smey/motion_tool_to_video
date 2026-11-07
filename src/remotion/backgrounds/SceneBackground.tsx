import type { BackgroundConfig } from "./types";
import { GridBackground } from "./GridBackground";
import { GalaxyBackground } from "./GalaxyBackground";
import { ImageBackground } from "./ImageBackground";

interface SceneBackgroundProps extends BackgroundConfig {
  isDark?: boolean;
}

export function SceneBackground({ style, imageDataUrl, isDark }: SceneBackgroundProps) {
  if (style === "grid") return <GridBackground isDark={isDark} />;
  if (style === "galaxy") return <GalaxyBackground isDark={isDark} />;
  if (style === "image" && imageDataUrl) return <ImageBackground src={imageDataUrl} />;
  return null;
}
