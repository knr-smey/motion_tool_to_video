import { useCurrentFrame } from "remotion";

const CELL_SIZE = 80;
const DRIFT_PX_PER_FRAME = 0.6;

export function GridBackground() {
  const frame = useCurrentFrame();
  const offset = (frame * DRIFT_PX_PER_FRAME) % CELL_SIZE;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)",
        backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
        backgroundPosition: `0 ${offset}px, ${offset}px 0`,
      }}
    />
  );
}
