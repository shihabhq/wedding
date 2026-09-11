"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const SLIDE_MS = 1300;
const UNMOUNT_DELAY_MS = 300;

// Both leaves render the *same* full-bleed image, each clipped to its own
// half. Sliding the (still full-width) leaves apart by their own width keeps
// the two halves perfectly aligned as they separate — no gap, no seam.
const LEAF_BASE =
  "motion-safe:transition-transform motion-safe:duration-[1300ms] motion-safe:ease-[cubic-bezier(.65,0,.2,1)] absolute inset-0";

export default function FloralDoors({ open }: { open: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setMounted(false), SLIDE_MS + UNMOUNT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [open]);

  // "Jump straight to the open state": for reduced motion, the doors should
  // never be seen closed at all, so skip rendering them outright rather than
  // rely on the CSS transition being stripped.
  if (prefersReducedMotion || !mounted) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className={`${LEAF_BASE} ${open ? "-translate-x-full" : "translate-x-0"}`}
        style={{ clipPath: "inset(0 50% 0 0)" }}
      >
        <Image
          src="/hero/doors.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div
        className={`${LEAF_BASE} ${open ? "translate-x-full" : "translate-x-0"}`}
        style={{ clipPath: "inset(0 0 0 50%)" }}
      >
        <Image
          src="/hero/doors.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
