import { useMemo } from "react";
import { useCurrentFrame } from "remotion";

const PARTICLE_COUNT = 70;

// Deterministic pseudo-random in [0, 1), keyed by seed — avoids Math.random,
// which would flicker between server and client / repeated renders.
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

interface Particle {
  x: number;
  y: number;
  size: number;
  phase: number;
}

export function GalaxyBackground() {
  const frame = useCurrentFrame();

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        x: seededRandom(i * 2 + 1) * 100,
        y: seededRandom(i * 2 + 2) * 100,
        size: 1.5 + seededRandom(i * 3 + 7) * 3,
        phase: seededRandom(i * 5 + 11) * Math.PI * 2,
      })),
    []
  );

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {particles.map((particle, i) => {
        const twinkle = (Math.sin(frame / 20 + particle.phase) + 1) / 2;
        const drift = Math.sin(frame / 90 + particle.phase) * 10;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              borderRadius: "50%",
              backgroundColor: "#000000",
              opacity: 0.08 + twinkle * 0.18,
              transform: `translateY(${drift}px)`,
            }}
          />
        );
      })}
    </div>
  );
}
