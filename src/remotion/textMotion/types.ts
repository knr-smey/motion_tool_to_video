export type AnimationCategory =
  | "entrance"
  | "exit"
  | "kinetic"
  | "cinematic"
  | "creative"
  | "loop";

export type AnimationEasing =
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "cubic"
  | "bounce";

export type AnimationDirection = "up" | "down" | "left" | "right" | "center";

export type TextMotionPresetId =
  // A. Entrance Animations (1-10)
  | "fade-in"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "zoom-in"
  | "pop-up"
  | "bounce-in"
  | "blur-in"
  | "typewriter"
  // B. Exit Animations (11-18)
  | "fade-out"
  | "slide-up-out"
  | "slide-down-out"
  | "slide-left-out"
  | "slide-right-out"
  | "zoom-out"
  | "blur-out"
  | "flip-out"
  // C. Kinetic Typography (19-26)
  | "word-by-word"
  | "letter-by-letter"
  | "text-scramble"
  | "scale-punch"
  | "wave-text"
  | "jumping-words"
  | "rotating-words"
  | "staggered-text"
  // D. Cinematic Animations (27-34)
  | "cinematic-fade"
  | "slow-zoom-reveal"
  | "mask-reveal"
  | "light-sweep"
  | "tracking-reveal"
  | "3d-rotation"
  | "cinematic-blur"
  | "split-screen-reveal"
  // E. Creative Effects (35-42)
  | "neon-glow"
  | "glitch-effect"
  | "rgb-split"
  | "liquid-reveal"
  | "particle-reveal"
  | "smoke-reveal"
  | "fire-text"
  | "digital-flicker"
  // F. Continuous Motion (43-50)
  | "floating-text"
  | "breathing-scale"
  | "pulse"
  | "wave-motion"
  | "shake"
  | "pendulum-rotation"
  | "horizontal-marquee"
  | "vertical-marquee";

export interface TextMotionConfig {
  presetId: TextMotionPresetId;
  duration: number; // 0.1 to 5.0 seconds
  delay: number; // 0.0 to 3.0 seconds
  speed: number; // 0.2 to 3.0
  direction: AnimationDirection;
  intensity: number; // 0.1 to 3.0
  easing: AnimationEasing;
  // Loop / continuous properties
  loop: boolean;
  loopSpeed: number; // 0.2 to 5.0
  amplitude: number; // 5 to 100 px
  frequency: number; // 0.2 to 5.0
  // Exit combination
  exitPresetId?: TextMotionPresetId;
  exitDuration?: number; // 0.1 to 3.0 seconds
}

export interface TextMotionPresetDef {
  id: TextMotionPresetId;
  name: string;
  category: AnimationCategory;
  description: string;
  defaultConfig: Partial<TextMotionConfig>;
}
