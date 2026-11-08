import React from "react";
import type { TextMotionConfig, AnimationEasing } from "./types";

// ==========================================
// EASING FUNCTIONS
// ==========================================
export function bounceEaseOut(x: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) {
    const t = x - 1.5 / d1;
    return n1 * t * t + 0.75;
  }
  if (x < 2.5 / d1) {
    const t = x - 2.25 / d1;
    return n1 * t * t + 0.9375;
  }
  const t = x - 2.625 / d1;
  return n1 * t * t + 0.984375;
}

export function applyEasing(t: number, easing: AnimationEasing): number {
  const clamped = Math.max(0, Math.min(1, t));
  switch (easing) {
    case "linear":
      return clamped;
    case "ease-in":
      return clamped * clamped * clamped;
    case "ease-out":
      return 1 - Math.pow(1 - clamped, 3);
    case "ease-in-out":
      return clamped < 0.5
        ? 4 * clamped * clamped * clamped
        : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
    case "cubic":
      return clamped * clamped * (3 - 2 * clamped);
    case "bounce":
      return bounceEaseOut(clamped);
    default:
      return 1 - Math.pow(1 - clamped, 3);
  }
}

// Pseudo-random deterministic scramble glyphs
const SCRAMBLE_CHARS = "01#_$%&<>*!@/[]{}~+=?";

export interface MotionEngineResult {
  style: React.CSSProperties;
  renderedContent?: React.ReactNode;
}

/**
 * Computes exact CSS transformations and React node rendering for any of the 50 presets.
 * Frame-based, deterministic for scrub-accurate playback and video export.
 */
export function computeTextMotion(
  presetId: string,
  frame: number,
  fps: number,
  durationInFrames: number,
  config: TextMotionConfig,
  text: string
): MotionEngineResult {
  const speed = Math.max(0.2, config.speed || 1.0);
  const intensity = Math.max(0.1, config.intensity || 1.0);
  const inDurationFrames = Math.max(1, Math.round((config.duration / speed) * fps));
  const inDelayFrames = Math.max(0, Math.round((config.delay / speed) * fps));

  // Entrance Progress (0 -> 1)
  const inRaw = (frame - inDelayFrames) / inDurationFrames;
  const inProgress = frame < inDelayFrames ? 0 : applyEasing(inRaw, config.easing);

  // Exit Progress (0 -> 1) if an exit animation is configured
  let exitProgress = 0;
  if (config.exitPresetId) {
    const outDurationFrames = Math.max(1, Math.round(((config.exitDuration ?? 0.5) / speed) * fps));
    const exitStart = Math.max(0, durationInFrames - outDurationFrames);
    if (frame >= exitStart) {
      exitProgress = applyEasing((frame - exitStart) / outDurationFrames, "ease-in");
    }
  }

  // Base style defaults
  const style: React.CSSProperties = {
    display: "inline-block",
    transformOrigin: "center center",
    willChange: "transform, opacity, filter",
  };

  const timeSec = frame / fps;
  const loopSpeed = config.loopSpeed || 1.0;
  const amplitude = config.amplitude || 20;
  const frequency = config.frequency || 1.0;

  // ========================================================
  // 1. ENTRANCE PRESETS (1-10)
  // ========================================================
  if (presetId === "fade-in") {
    style.opacity = inProgress;
  } else if (presetId === "slide-up") {
    const dist = 100 * intensity * (1 - inProgress);
    style.transform = `translateY(${dist}px)`;
    style.opacity = inProgress;
  } else if (presetId === "slide-down") {
    const dist = -100 * intensity * (1 - inProgress);
    style.transform = `translateY(${dist}px)`;
    style.opacity = inProgress;
  } else if (presetId === "slide-left") {
    const dist = 140 * intensity * (1 - inProgress);
    style.transform = `translateX(${dist}px)`;
    style.opacity = inProgress;
  } else if (presetId === "slide-right") {
    const dist = -140 * intensity * (1 - inProgress);
    style.transform = `translateX(${dist}px)`;
    style.opacity = inProgress;
  } else if (presetId === "zoom-in") {
    const scale = 0.05 + inProgress * 0.95;
    style.transform = `scale(${scale})`;
    style.opacity = inProgress;
  } else if (presetId === "pop-up") {
    // Pop up with dynamic overshoot
    const scale = inProgress < 0.7
      ? (inProgress / 0.7) * (1.15 * intensity)
      : (1.15 * intensity) - ((inProgress - 0.7) / 0.3) * (0.15 * intensity);
    style.transform = `scale(${Math.max(0, scale)})`;
    style.opacity = Math.min(1, inProgress * 1.5);
  } else if (presetId === "bounce-in") {
    const scale = inProgress;
    const yOffset = (1 - inProgress) * -120 * intensity;
    style.transform = `translateY(${yOffset}px) scale(${scale})`;
    style.opacity = Math.min(1, inProgress * 2);
  } else if (presetId === "blur-in") {
    const blur = (1 - inProgress) * 25 * intensity;
    const scale = 0.9 + inProgress * 0.1;
    style.filter = `blur(${blur}px)`;
    style.transform = `scale(${scale})`;
    style.opacity = inProgress;
  } else if (presetId === "typewriter") {
    const charsToShow = Math.floor(inProgress * text.length);
    const cursorVisible = frame % 16 < 8;
    return {
      style,
      renderedContent: (
        <span>
          {text.slice(0, charsToShow)}
          {charsToShow < text.length && (
            <span
              style={{
                opacity: cursorVisible ? 1 : 0,
                color: "#00b4d8",
                marginLeft: 2,
              }}
            >
              |
            </span>
          )}
        </span>
      ),
    };
  }

  // ========================================================
  // 2. EXIT PRESETS (11-18)
  // ========================================================
  else if (presetId === "fade-out") {
    // When used as main preset or exit
    const p = Math.max(0, Math.min(1, inProgress));
    style.opacity = 1 - p;
  } else if (presetId === "slide-up-out") {
    const p = Math.max(0, Math.min(1, inProgress));
    style.transform = `translateY(${-120 * intensity * p}px)`;
    style.opacity = 1 - p;
  } else if (presetId === "slide-down-out") {
    const p = Math.max(0, Math.min(1, inProgress));
    style.transform = `translateY(${120 * intensity * p}px)`;
    style.opacity = 1 - p;
  } else if (presetId === "slide-left-out") {
    const p = Math.max(0, Math.min(1, inProgress));
    style.transform = `translateX(${-150 * intensity * p}px)`;
    style.opacity = 1 - p;
  } else if (presetId === "slide-right-out") {
    const p = Math.max(0, Math.min(1, inProgress));
    style.transform = `translateX(${150 * intensity * p}px)`;
    style.opacity = 1 - p;
  } else if (presetId === "zoom-out") {
    const p = Math.max(0, Math.min(1, inProgress));
    style.transform = `scale(${Math.max(0, 1 - p * 0.95)})`;
    style.opacity = 1 - p;
  } else if (presetId === "blur-out") {
    const p = Math.max(0, Math.min(1, inProgress));
    style.filter = `blur(${p * 25 * intensity}px)`;
    style.transform = `scale(${1 + p * 0.15})`;
    style.opacity = 1 - p;
  } else if (presetId === "flip-out") {
    const p = Math.max(0, Math.min(1, inProgress));
    style.transform = `perspective(800px) rotateX(${p * 90}deg)`;
    style.opacity = 1 - p;
  }

  // ========================================================
  // 3. KINETIC TYPOGRAPHY (19-26)
  // ========================================================
  else if (presetId === "word-by-word") {
    const words = text.split(" ");
    return {
      style,
      renderedContent: (
        <span>
          {words.map((word, idx) => {
            const staggerDelay = (idx / Math.max(1, words.length)) * 0.7;
            const wordProgress = applyEasing(
              Math.max(0, Math.min(1, (inRaw - staggerDelay) / 0.3)),
              "ease-out"
            );
            const scale = 0.5 + wordProgress * 0.5;
            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  marginRight: "0.28em",
                  opacity: wordProgress,
                  transform: `scale(${scale}) translateY(${(1 - wordProgress) * 20}px)`,
                }}
              >
                {word}
              </span>
            );
          })}
        </span>
      ),
    };
  } else if (presetId === "letter-by-letter") {
    const letters = text.split("");
    return {
      style,
      renderedContent: (
        <span>
          {letters.map((char, idx) => {
            const staggerDelay = (idx / Math.max(1, letters.length)) * 0.8;
            const charProgress = applyEasing(
              Math.max(0, Math.min(1, (inRaw - staggerDelay) / 0.2)),
              "bounce"
            );
            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  opacity: charProgress,
                  transform: `scale(${charProgress}) translateY(${(1 - charProgress) * 15}px)`,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </span>
      ),
    };
  } else if (presetId === "text-scramble") {
    const scrambleLength = Math.floor(inProgress * text.length);
    const chars = text.split("").map((actualChar, idx) => {
      if (idx < scrambleLength) return actualChar;
      if (actualChar === " ") return " ";
      const randIdx = Math.floor(Math.abs(Math.sin(frame * 13 + idx * 7) * SCRAMBLE_CHARS.length));
      return SCRAMBLE_CHARS[randIdx % SCRAMBLE_CHARS.length];
    });
    return {
      style,
      renderedContent: <span>{chars.join("")}</span>,
    };
  } else if (presetId === "scale-punch") {
    // Explosive punch in: scale strikes large (1.4) and snaps back to 1.0 with chromatic flash
    const p = inProgress;
    const punchScale = p < 0.4 ? 1 + (1 - p / 0.4) * 0.45 * intensity : 1;
    style.transform = `scale(${punchScale})`;
    style.opacity = Math.min(1, p * 2);
    if (p < 0.4) {
      style.textShadow = `0 0 30px rgba(241, 89, 31, ${(1 - p / 0.4) * 0.9})`;
    }
  } else if (presetId === "wave-text") {
    const letters = text.split("");
    return {
      style,
      renderedContent: (
        <span>
          {letters.map((char, idx) => {
            const waveY = Math.sin(timeSec * 4 * frequency + idx * 0.4) * amplitude * 0.4;
            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  transform: `translateY(${waveY}px)`,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </span>
      ),
    };
  } else if (presetId === "jumping-words") {
    const words = text.split(" ");
    return {
      style,
      renderedContent: (
        <span>
          {words.map((word, idx) => {
            const jumpY = -Math.abs(Math.sin(timeSec * 3.5 * frequency + idx * 0.8)) * amplitude * 0.6;
            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  marginRight: "0.28em",
                  transform: `translateY(${jumpY}px)`,
                }}
              >
                {word}
              </span>
            );
          })}
        </span>
      ),
    };
  } else if (presetId === "rotating-words") {
    const words = text.split(" ");
    return {
      style,
      renderedContent: (
        <span>
          {words.map((word, idx) => {
            const stagger = (idx / Math.max(1, words.length)) * 0.7;
            const p = applyEasing(Math.max(0, Math.min(1, (inRaw - stagger) / 0.3)), "cubic");
            const rot = (1 - p) * 90;
            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  marginRight: "0.28em",
                  opacity: p,
                  transform: `perspective(600px) rotateX(${rot}deg)`,
                }}
              >
                {word}
              </span>
            );
          })}
        </span>
      ),
    };
  } else if (presetId === "staggered-text") {
    const lines = text.split("\n");
    return {
      style,
      renderedContent: (
        <span>
          {lines.map((line, idx) => {
            const stagger = (idx / Math.max(1, lines.length)) * 0.6;
            const p = applyEasing(Math.max(0, Math.min(1, (inRaw - stagger) / 0.4)), "cubic");
            return (
              <span
                key={idx}
                style={{
                  display: "block",
                  opacity: p,
                  transform: `translateY(${(1 - p) * 40 * intensity}px)`,
                }}
              >
                {line}
              </span>
            );
          })}
        </span>
      ),
    };
  }

  // ========================================================
  // 4. CINEMATIC ANIMATIONS (27-34)
  // ========================================================
  else if (presetId === "cinematic-fade") {
    const p = inProgress;
    const tracking = (1 - p) * 16 * intensity;
    style.opacity = p;
    style.letterSpacing = `${tracking}px`;
    style.transform = `scale(${0.96 + p * 0.04})`;
  } else if (presetId === "slow-zoom-reveal") {
    const p = Math.min(1, timeSec / Math.max(1, durationInFrames / fps));
    const scale = 0.9 + p * 0.18 * intensity;
    style.transform = `scale(${scale})`;
    style.opacity = inProgress;
  } else if (presetId === "mask-reveal") {
    const p = inProgress;
    style.clipPath = `inset(0 0 ${(1 - p) * 100}% 0)`;
    style.transform = `translateY(${(1 - p) * 30}px)`;
    style.opacity = Math.min(1, p * 1.5);
  } else if (presetId === "light-sweep") {
    const sweepX = (timeSec * 60 * frequency) % 200 - 50;
    style.opacity = inProgress;
    style.backgroundImage = `linear-gradient(110deg, currentColor 0%, #ffffff 45%, #ffedd5 50%, #ffffff 55%, currentColor 100%)`;
    style.backgroundSize = "200% 100%";
    style.backgroundPosition = `${sweepX}% 0`;
    style.WebkitBackgroundClip = "text";
    style.WebkitTextFillColor = "transparent";
  } else if (presetId === "tracking-reveal") {
    const p = inProgress;
    const tracking = (1 - p) * 28 * intensity;
    style.letterSpacing = `${tracking}px`;
    style.opacity = p;
  } else if (presetId === "3d-rotation") {
    const p = inProgress;
    const rotY = (1 - p) * 60 * intensity;
    const rotX = (1 - p) * 35 * intensity;
    style.transform = `perspective(800px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${0.8 + p * 0.2})`;
    style.opacity = p;
  } else if (presetId === "cinematic-blur") {
    const p = inProgress;
    const blurAmount = (1 - p) * 35 * intensity;
    style.filter = `blur(${blurAmount}px)`;
    style.transform = `scale(${1.08 - p * 0.08})`;
    style.opacity = p;
  } else if (presetId === "split-screen-reveal") {
    const p = inProgress;
    style.clipPath = `inset(${(1 - p) * 50}% 0 ${(1 - p) * 50}% 0)`;
    style.opacity = Math.min(1, p * 1.5);
  }

  // ========================================================
  // 5. CREATIVE EFFECTS (35-42)
  // ========================================================
  else if (presetId === "neon-glow") {
    const pulse = 0.5 + 0.5 * Math.sin(timeSec * 5 * frequency);
    const glowRadius = (15 + pulse * 25) * intensity;
    style.opacity = inProgress;
    style.textShadow = `0 0 ${glowRadius * 0.3}px #fff, 0 0 ${glowRadius * 0.6}px #00b4d8, 0 0 ${glowRadius}px #f1591f, 0 0 ${glowRadius * 1.5}px #7c3aed`;
  } else if (presetId === "glitch-effect") {
    const isGlitch = frame % 18 < 3;
    const jitterX = isGlitch ? (Math.sin(frame * 40) * 12 * intensity) : 0;
    const jitterY = isGlitch ? (Math.cos(frame * 30) * 6 * intensity) : 0;
    style.opacity = inProgress;
    style.transform = `translate(${jitterX}px, ${jitterY}px)`;
    if (isGlitch) {
      style.textShadow = `-3px 0 #00ffff, 3px 0 #ff0055`;
      style.clipPath = `inset(${Math.abs(Math.sin(frame)) * 40}% 0 ${Math.abs(Math.cos(frame)) * 30}% 0)`;
    }
  } else if (presetId === "rgb-split") {
    const shift = Math.sin(timeSec * 4 * frequency) * 6 * intensity;
    style.opacity = inProgress;
    style.textShadow = `${shift}px 0 rgba(255, 0, 77, 0.85), ${-shift}px 0 rgba(0, 229, 255, 0.85)`;
  } else if (presetId === "liquid-reveal") {
    const p = inProgress;
    const wave = Math.sin(timeSec * 4) * 5;
    style.opacity = p;
    style.transform = `scale(${0.8 + p * 0.2}) skew(${wave * (1 - p)}deg)`;
    style.filter = `blur(${(1 - p) * 12}px) contrast(${1 + (1 - p) * 3})`;
  } else if (presetId === "particle-reveal") {
    const p = inProgress;
    const scatter = (1 - p) * 18 * intensity;
    style.opacity = p;
    style.filter = `blur(${(1 - p) * 16}px)`;
    style.textShadow = `${scatter}px 0 10px currentColor, -${scatter}px 0 10px currentColor`;
  } else if (presetId === "smoke-reveal") {
    const p = inProgress;
    const driftY = (1 - p) * 20 * intensity;
    style.opacity = p;
    style.filter = `blur(${(1 - p) * 30 * intensity}px)`;
    style.transform = `scale(${1.15 - p * 0.15}) translateY(${driftY}px)`;
  } else if (presetId === "fire-text") {
    const flicker = 0.7 + 0.3 * Math.sin(timeSec * 15 * frequency + Math.cos(timeSec * 25));
    style.opacity = inProgress;
    style.textShadow = `0 -4px ${8 * flicker}px #ffedd5, 0 -8px ${16 * flicker}px #f97316, 0 -16px ${28 * flicker}px #dc2626`;
    style.transform = `scale(${1 + flicker * 0.02})`;
  } else if (presetId === "digital-flicker") {
    // CRT / Fluorescent tube flicker cadence
    const flickerCycle = [1, 0.2, 0.9, 0, 0.8, 0.3, 1, 0.1, 1, 1, 0.8, 1];
    const flickerVal = inProgress < 0.6
      ? (flickerCycle[frame % flickerCycle.length] ?? 1)
      : 1;
    style.opacity = flickerVal * inProgress;
    style.filter = `brightness(${1 + (1 - flickerVal) * 0.5})`;
  }

  // ========================================================
  // 6. CONTINUOUS MOTION / LOOP (43-50)
  // ========================================================
  else if (presetId === "floating-text") {
    const floatY = Math.sin(timeSec * 2.5 * loopSpeed * frequency) * amplitude * 0.5;
    style.transform = `translateY(${floatY}px)`;
  } else if (presetId === "breathing-scale") {
    const breath = 1 + Math.sin(timeSec * 2 * loopSpeed * frequency) * (amplitude / 200) * intensity;
    style.transform = `scale(${breath})`;
  } else if (presetId === "pulse") {
    const pulseCycle = Math.pow(Math.abs(Math.sin(timeSec * 3 * loopSpeed * frequency)), 4);
    const scale = 1 + pulseCycle * 0.12 * intensity;
    style.transform = `scale(${scale})`;
    style.filter = `brightness(${1 + pulseCycle * 0.25})`;
  } else if (presetId === "wave-motion") {
    const waveY = Math.sin(timeSec * 3 * loopSpeed * frequency) * amplitude * 0.6;
    const waveRot = Math.cos(timeSec * 3 * loopSpeed * frequency) * 2 * intensity;
    style.transform = `translateY(${waveY}px) rotate(${waveRot}deg)`;
  } else if (presetId === "shake") {
    const shakeX = Math.sin(frame * 1.8 * frequency) * amplitude * 0.3 * intensity;
    const shakeY = Math.cos(frame * 2.2 * frequency) * amplitude * 0.3 * intensity;
    style.transform = `translate(${shakeX}px, ${shakeY}px)`;
  } else if (presetId === "pendulum-rotation") {
    const angle = Math.sin(timeSec * 2.5 * loopSpeed * frequency) * (amplitude * 0.4) * intensity;
    style.transformOrigin = "top center";
    style.transform = `rotate(${angle}deg)`;
  } else if (presetId === "horizontal-marquee") {
    const offset = (timeSec * 120 * loopSpeed) % 800;
    style.transform = `translateX(${200 - offset}px)`;
    style.whiteSpace = "nowrap";
  } else if (presetId === "vertical-marquee") {
    const offset = (timeSec * 60 * loopSpeed) % 400;
    style.transform = `translateY(${100 - offset}px)`;
  }

  // ========================================================
  // Exit Animation Integration (if exitProgress > 0)
  // ========================================================
  if (exitProgress > 0) {
    const exitPreset = config.exitPresetId ?? "fade-out";
    if (exitPreset === "fade-out") {
      style.opacity = (typeof style.opacity === "number" ? style.opacity : 1) * (1 - exitProgress);
    } else if (exitPreset === "slide-up-out") {
      style.transform = `${style.transform || ""} translateY(${-100 * intensity * exitProgress}px)`;
      style.opacity = (typeof style.opacity === "number" ? style.opacity : 1) * (1 - exitProgress);
    } else if (exitPreset === "slide-down-out") {
      style.transform = `${style.transform || ""} translateY(${100 * intensity * exitProgress}px)`;
      style.opacity = (typeof style.opacity === "number" ? style.opacity : 1) * (1 - exitProgress);
    } else if (exitPreset === "slide-left-out") {
      style.transform = `${style.transform || ""} translateX(${-120 * intensity * exitProgress}px)`;
      style.opacity = (typeof style.opacity === "number" ? style.opacity : 1) * (1 - exitProgress);
    } else if (exitPreset === "slide-right-out") {
      style.transform = `${style.transform || ""} translateX(${120 * intensity * exitProgress}px)`;
      style.opacity = (typeof style.opacity === "number" ? style.opacity : 1) * (1 - exitProgress);
    } else if (exitPreset === "zoom-out") {
      style.transform = `${style.transform || ""} scale(${Math.max(0, 1 - exitProgress)})`;
      style.opacity = (typeof style.opacity === "number" ? style.opacity : 1) * (1 - exitProgress);
    } else if (exitPreset === "blur-out") {
      style.filter = `${style.filter || ""} blur(${exitProgress * 20 * intensity}px)`;
      style.opacity = (typeof style.opacity === "number" ? style.opacity : 1) * (1 - exitProgress);
    } else if (exitPreset === "flip-out") {
      style.transform = `${style.transform || ""} perspective(800px) rotateX(${exitProgress * 90}deg)`;
      style.opacity = (typeof style.opacity === "number" ? style.opacity : 1) * (1 - exitProgress);
    }
  }

  return { style };
}
