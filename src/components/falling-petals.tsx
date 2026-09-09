import type { CSSProperties } from "react";

// Drawn from the plate's own flowers, not the site palette.
const PETAL_COLORS = ["#C4566B", "#E0913A", "#E8A9B4", "#F2E4C9"];
const PETAL_COUNT = 14;

type PetalStyle = CSSProperties & {
  "--sway"?: string;
  "--op"?: number;
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type Petal = {
  color: string;
  size: number;
  left: number;
  duration: number;
  delay: number;
  sway: number;
  opacity: number;
  rotateStart: number;
};

function buildPetals(): Petal[] {
  return Array.from({ length: PETAL_COUNT }, (_, i) => ({
    color: PETAL_COLORS[i % PETAL_COLORS.length],
    size: randomBetween(8, 18),
    left: randomBetween(2, 96),
    duration: randomBetween(14, 26),
    delay: randomBetween(0, 20),
    sway: randomBetween(20, 50) * (Math.random() < 0.5 ? -1 : 1),
    opacity: randomBetween(0.35, 0.6),
    rotateStart: randomBetween(0, 360),
  }));
}

/**
 * Ambient petals drifting down over the hero plate. Pure CSS (see
 * `.petal-fall` in globals.css) — hidden outright under
 * `prefers-reduced-motion: reduce` via the `motion-safe:` container, so
 * there's no JS gate needed and nothing to hydrate.
 */
export default function FallingPetals() {
  const petals = buildPetals();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden motion-safe:block"
    >
      {petals.map((petal, i) => (
        <span
          key={i}
          className="petal-fall absolute top-[-10vh]"
          style={
            {
              left: `${petal.left}%`,
              width: petal.size,
              height: petal.size,
              animationDuration: `${petal.duration}s`,
              animationDelay: `${petal.delay}s`,
              "--sway": `${petal.sway}px`,
              "--op": petal.opacity,
            } as PetalStyle
          }
        >
          <svg
            viewBox="0 0 24 24"
            width={petal.size}
            height={petal.size}
            style={{ transform: `rotate(${petal.rotateStart}deg)` }}
          >
            <path
              d="M12 2C6 8 4 14 12 22C20 14 18 8 12 2Z"
              fill={petal.color}
            />
          </svg>
        </span>
      ))}
    </div>
  );
}
