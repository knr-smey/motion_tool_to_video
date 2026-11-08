import type { TextMotionPresetDef } from "./types";

export const TEXT_MOTION_PRESETS: TextMotionPresetDef[] = [
  // ==========================================
  // A. ENTRANCE ANIMATIONS (1-10)
  // ==========================================
  {
    id: "fade-in",
    name: "Fade In",
    category: "entrance",
    description: "Smooth opacity entrance from transparent to solid",
    defaultConfig: { duration: 0.8, easing: "ease-out", intensity: 1.0 },
  },
  {
    id: "slide-up",
    name: "Slide Up",
    category: "entrance",
    description: "Rises upwards into position with smooth easing",
    defaultConfig: { duration: 0.8, direction: "up", easing: "ease-out", intensity: 1.0 },
  },
  {
    id: "slide-down",
    name: "Slide Down",
    category: "entrance",
    description: "Drops smoothly downward from above",
    defaultConfig: { duration: 0.8, direction: "down", easing: "ease-out", intensity: 1.0 },
  },
  {
    id: "slide-left",
    name: "Slide Left",
    category: "entrance",
    description: "Slides in horizontally from the right",
    defaultConfig: { duration: 0.8, direction: "left", easing: "ease-out", intensity: 1.0 },
  },
  {
    id: "slide-right",
    name: "Slide Right",
    category: "entrance",
    description: "Slides in horizontally from the left",
    defaultConfig: { duration: 0.8, direction: "right", easing: "ease-out", intensity: 1.0 },
  },
  {
    id: "zoom-in",
    name: "Zoom In",
    category: "entrance",
    description: "Scales up smoothly from zero to full size",
    defaultConfig: { duration: 0.7, easing: "ease-out", intensity: 1.0 },
  },
  {
    id: "pop-up",
    name: "Pop Up",
    category: "entrance",
    description: "Brisk scale pop with dynamic overshoot",
    defaultConfig: { duration: 0.6, easing: "bounce", intensity: 1.2 },
  },
  {
    id: "bounce-in",
    name: "Bounce In",
    category: "entrance",
    description: "Playful bounce entrance with elastic physics",
    defaultConfig: { duration: 1.0, easing: "bounce", intensity: 1.3 },
  },
  {
    id: "blur-in",
    name: "Blur In",
    category: "entrance",
    description: "Focuses in from a deep optical blur",
    defaultConfig: { duration: 0.8, easing: "ease-out", intensity: 1.2 },
  },
  {
    id: "typewriter",
    name: "Typewriter",
    category: "entrance",
    description: "Reveals text character-by-character with flashing cursor",
    defaultConfig: { duration: 1.4, easing: "linear", intensity: 1.0 },
  },

  // ==========================================
  // B. EXIT ANIMATIONS (11-18)
  // ==========================================
  {
    id: "fade-out",
    name: "Fade Out",
    category: "exit",
    description: "Smooth fade to transparent before scene exit",
    defaultConfig: { duration: 0.6, easing: "ease-in", intensity: 1.0 },
  },
  {
    id: "slide-up-out",
    name: "Slide Up Out",
    category: "exit",
    description: "Slides smoothly upwards out of frame",
    defaultConfig: { duration: 0.6, direction: "up", easing: "ease-in", intensity: 1.0 },
  },
  {
    id: "slide-down-out",
    name: "Slide Down Out",
    category: "exit",
    description: "Drops smoothly downwards out of view",
    defaultConfig: { duration: 0.6, direction: "down", easing: "ease-in", intensity: 1.0 },
  },
  {
    id: "slide-left-out",
    name: "Slide Left Out",
    category: "exit",
    description: "Sweeps horizontally to the left",
    defaultConfig: { duration: 0.6, direction: "left", easing: "ease-in", intensity: 1.0 },
  },
  {
    id: "slide-right-out",
    name: "Slide Right Out",
    category: "exit",
    description: "Sweeps horizontally to the right",
    defaultConfig: { duration: 0.6, direction: "right", easing: "ease-in", intensity: 1.0 },
  },
  {
    id: "zoom-out",
    name: "Zoom Out",
    category: "exit",
    description: "Shrinks away into the distance",
    defaultConfig: { duration: 0.6, easing: "ease-in", intensity: 1.0 },
  },
  {
    id: "blur-out",
    name: "Blur Out",
    category: "exit",
    description: "Dissolves outward into a heavy cinematic blur",
    defaultConfig: { duration: 0.6, easing: "ease-in", intensity: 1.2 },
  },
  {
    id: "flip-out",
    name: "Flip Out",
    category: "exit",
    description: "Rotates 90 degrees around 3D axis and vanishes",
    defaultConfig: { duration: 0.6, easing: "ease-in", intensity: 1.0 },
  },

  // ==========================================
  // C. KINETIC TYPOGRAPHY (19-26)
  // ==========================================
  {
    id: "word-by-word",
    name: "Word by Word",
    category: "kinetic",
    description: "Staggered sequential pop for each individual word",
    defaultConfig: { duration: 1.5, easing: "ease-out", intensity: 1.0 },
  },
  {
    id: "letter-by-letter",
    name: "Letter by Letter",
    category: "kinetic",
    description: "Cascading wave of individual letter reveals",
    defaultConfig: { duration: 1.2, easing: "ease-out", intensity: 1.0 },
  },
  {
    id: "text-scramble",
    name: "Text Scramble",
    category: "kinetic",
    description: "Cyberpunk random matrix symbol decoding reveal",
    defaultConfig: { duration: 1.2, easing: "linear", intensity: 1.0 },
  },
  {
    id: "scale-punch",
    name: "Scale Punch",
    category: "kinetic",
    description: "High impact scale strike with chromatic kick",
    defaultConfig: { duration: 0.5, easing: "bounce", intensity: 1.4 },
  },
  {
    id: "wave-text",
    name: "Wave Text",
    category: "kinetic",
    description: "Undulating sinusoidal wave ripple across letters",
    defaultConfig: { duration: 1.8, frequency: 1.5, amplitude: 25, intensity: 1.0 },
  },
  {
    id: "jumping-words",
    name: "Jumping Words",
    category: "kinetic",
    description: "Words leap rhythmically in lively stagger",
    defaultConfig: { duration: 1.6, frequency: 1.8, amplitude: 30, intensity: 1.0 },
  },
  {
    id: "rotating-words",
    name: "Rotating Words",
    category: "kinetic",
    description: "3D tumble rotation for each word sequence",
    defaultConfig: { duration: 1.5, easing: "ease-out", intensity: 1.0 },
  },
  {
    id: "staggered-text",
    name: "Staggered Text",
    category: "kinetic",
    description: "Multi-line cascade with overlapping entrance delays",
    defaultConfig: { duration: 1.4, easing: "cubic", intensity: 1.0 },
  },

  // ==========================================
  // D. CINEMATIC ANIMATIONS (27-34)
  // ==========================================
  {
    id: "cinematic-fade",
    name: "Cinematic Fade",
    category: "cinematic",
    description: "Dramatic filmic contrast reveal with letter spacing",
    defaultConfig: { duration: 1.5, easing: "cubic", intensity: 1.0 },
  },
  {
    id: "slow-zoom-reveal",
    name: "Slow Zoom Reveal",
    category: "cinematic",
    description: "Majestic slow dolly zoom push-in",
    defaultConfig: { duration: 2.0, easing: "ease-out", intensity: 1.0 },
  },
  {
    id: "mask-reveal",
    name: "Mask Reveal",
    category: "cinematic",
    description: "Sharp rectangular wipe mask sliding upward",
    defaultConfig: { duration: 1.0, easing: "cubic", intensity: 1.0 },
  },
  {
    id: "light-sweep",
    name: "Light Sweep",
    category: "cinematic",
    description: "Gleaming diagonal specular flare sweeping across text",
    defaultConfig: { duration: 1.6, easing: "ease-in-out", intensity: 1.2 },
  },
  {
    id: "tracking-reveal",
    name: "Tracking Reveal",
    category: "cinematic",
    description: "Letter tracking expands outwards from condensed core",
    defaultConfig: { duration: 1.4, easing: "ease-out", intensity: 1.3 },
  },
  {
    id: "3d-rotation",
    name: "3D Rotation",
    category: "cinematic",
    description: "Deep perspective 3D rotation along Y and X axes",
    defaultConfig: { duration: 1.2, easing: "cubic", intensity: 1.1 },
  },
  {
    id: "cinematic-blur",
    name: "Cinematic Blur",
    category: "cinematic",
    description: "Hollywood rack-focus pull into razor-sharp typography",
    defaultConfig: { duration: 1.2, easing: "ease-out", intensity: 1.5 },
  },
  {
    id: "split-screen-reveal",
    name: "Split Screen Reveal",
    category: "cinematic",
    description: "Top and bottom halves converge from opposing directions",
    defaultConfig: { duration: 1.0, easing: "cubic", intensity: 1.0 },
  },

  // ==========================================
  // E. CREATIVE EFFECTS (35-42)
  // ==========================================
  {
    id: "neon-glow",
    name: "Neon Glow",
    category: "creative",
    description: "Vibrant pulsating multi-stop neon tube illumination",
    defaultConfig: { duration: 1.5, frequency: 1.2, intensity: 1.3 },
  },
  {
    id: "glitch-effect",
    name: "Glitch Effect",
    category: "creative",
    description: "Cyber broadcast glitch with digital scan-slice offset",
    defaultConfig: { duration: 1.0, frequency: 2.0, intensity: 1.4 },
  },
  {
    id: "rgb-split",
    name: "RGB Split",
    category: "creative",
    description: "Chromatic aberration with red/cyan color displacement",
    defaultConfig: { duration: 1.2, frequency: 1.5, amplitude: 15, intensity: 1.2 },
  },
  {
    id: "liquid-reveal",
    name: "Liquid Reveal",
    category: "creative",
    description: "Fluid wave emergence with viscous organic expansion",
    defaultConfig: { duration: 1.3, easing: "cubic", intensity: 1.0 },
  },
  {
    id: "particle-reveal",
    name: "Particle Reveal",
    category: "creative",
    description: "Shimmering particle mist coalescing into letterforms",
    defaultConfig: { duration: 1.4, easing: "ease-out", intensity: 1.2 },
  },
  {
    id: "smoke-reveal",
    name: "Smoke Reveal",
    category: "creative",
    description: "Soft atmospheric cloud dispersion focusing into text",
    defaultConfig: { duration: 1.6, easing: "ease-out", intensity: 1.3 },
  },
  {
    id: "fire-text",
    name: "Fire Text",
    category: "creative",
    description: "Blazing ember glow with heat distortion flicker",
    defaultConfig: { duration: 1.5, frequency: 2.5, intensity: 1.4 },
  },
  {
    id: "digital-flicker",
    name: "Digital Flicker",
    category: "creative",
    description: "Fluorescent tube ignition and CRT power surge",
    defaultConfig: { duration: 1.1, frequency: 3.0, intensity: 1.2 },
  },

  // ==========================================
  // F. CONTINUOUS MOTION (43-50)
  // ==========================================
  {
    id: "floating-text",
    name: "Floating Text",
    category: "loop",
    description: "Weightless atmospheric hovering oscillation",
    defaultConfig: { loop: true, loopSpeed: 1.0, amplitude: 18, frequency: 1.0 },
  },
  {
    id: "breathing-scale",
    name: "Breathing Scale",
    category: "loop",
    description: "Hypnotic, organic respiration scale cycle",
    defaultConfig: { loop: true, loopSpeed: 1.0, amplitude: 12, frequency: 0.8 },
  },
  {
    id: "pulse",
    name: "Pulse",
    category: "loop",
    description: "Steady rhythmic heartbeat scale and brightness surge",
    defaultConfig: { loop: true, loopSpeed: 1.2, amplitude: 15, frequency: 1.4 },
  },
  {
    id: "wave-motion",
    name: "Wave Motion",
    category: "loop",
    description: "Continuous ocean swell oscillation throughout scene",
    defaultConfig: { loop: true, loopSpeed: 1.0, amplitude: 20, frequency: 1.2 },
  },
  {
    id: "shake",
    name: "Shake",
    category: "loop",
    description: "Energetic handheld camera tremor / rumble vibration",
    defaultConfig: { loop: true, loopSpeed: 1.5, amplitude: 10, frequency: 3.0 },
  },
  {
    id: "pendulum-rotation",
    name: "Pendulum Rotation",
    category: "loop",
    description: "Gentle kinetic pendulum swing around top pivot point",
    defaultConfig: { loop: true, loopSpeed: 1.0, amplitude: 8, frequency: 0.9 },
  },
  {
    id: "horizontal-marquee",
    name: "Horizontal Marquee",
    category: "loop",
    description: "Smooth infinite linear marquee crawl from right to left",
    defaultConfig: { loop: true, loopSpeed: 1.0, amplitude: 50, frequency: 1.0 },
  },
  {
    id: "vertical-marquee",
    name: "Vertical Marquee",
    category: "loop",
    description: "Continuous vertical news ticker / rolling credits ascent",
    defaultConfig: { loop: true, loopSpeed: 1.0, amplitude: 50, frequency: 1.0 },
  },
];

export const PRESETS_BY_ID = new Map<string, TextMotionPresetDef>(
  TEXT_MOTION_PRESETS.map((p) => [p.id, p])
);

export function getPresetDef(id: string): TextMotionPresetDef {
  return PRESETS_BY_ID.get(id) ?? TEXT_MOTION_PRESETS[0];
}

export function getDefaultMotionConfig(presetId: string): import("./types").TextMotionConfig {
  const preset = getPresetDef(presetId);
  return {
    presetId: preset.id,
    duration: preset.defaultConfig.duration ?? 0.8,
    delay: preset.defaultConfig.delay ?? 0.0,
    speed: preset.defaultConfig.speed ?? 1.0,
    direction: preset.defaultConfig.direction ?? "up",
    intensity: preset.defaultConfig.intensity ?? 1.0,
    easing: preset.defaultConfig.easing ?? "ease-out",
    loop: preset.defaultConfig.loop ?? (preset.category === "loop"),
    loopSpeed: preset.defaultConfig.loopSpeed ?? 1.0,
    amplitude: preset.defaultConfig.amplitude ?? 20,
    frequency: preset.defaultConfig.frequency ?? 1.0,
    exitPresetId: preset.defaultConfig.exitPresetId,
    exitDuration: preset.defaultConfig.exitDuration ?? 0.5,
  };
}
