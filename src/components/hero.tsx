import Image from "next/image";
import {
  Cormorant_Garamond,
  Playfair_Display,
  Alex_Brush,
  Mrs_Saint_Delafield,
} from "next/font/google";
import FloralDoors from "@/components/floral-doors";

// PLACEHOLDER CONTENT — replace before this ships. CLAUDE.md is explicit that
// names and dates are never placeholder-safe on a real invitation; these are
// deliberately generic so nobody mistakes them for the real thing. They're
// also both 11 characters, which sidesteps (for now) the "anchor the longer
// name at 50% height" question below — that needs re-checking once real
// names are in.
const COUPLE = {
  partnerOne: "Santiago",
  partnerTwo: "Claudia",
  date: "September 13, 2026",
};

// --- Name font comparison -------------------------------------------------
// CLAUDE.md documents that the client rejected a script/calligraphic
// register (Great Vibes, Dancing Script, etc.) in favor of Cormorant
// Garamond. Options B-D are here to actually compare against that decision,
// not to reverse it on their own — flip FONT_OPTION, look at it, then update
// CLAUDE.md once one is picked (whichever it is, including keeping A).
//
// Eyebrow/date always stay in Cormorant Garamond regardless of this choice —
// CLAUDE.md's type system is "one [name] face, one quiet serif for body,"
// and only the names are what's being compared here.
const FONT_OPTION: "A" | "B" | "C" | "D" = "C";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-cormorant",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-playfair",
});

// Genuine script options, but not the bouncy/casual register the client
// rejected — both read as formal engraved-invitation scripts rather than
// handwriting. Sized larger than the serif options: scripts render visually
// smaller/thinner at the same font-size.
const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alex-brush",
});

const mrsSaintDelafield = Mrs_Saint_Delafield({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mrs-saint-delafield",
});

const NAME_FONT_OPTIONS = {
  // Current: quiet serif, matches the documented client decision.
  A: {
    font: cormorant.className,
    classes:
      "font-light text-[clamp(1.65rem,7.7vw,2.2rem)] tracking-[0.06em] leading-[1.15]",
  },
  // Alternative non-script serif: more dramatic contrast, still not cursive.
  B: {
    font: playfair.className,
    classes:
      "font-medium text-[clamp(1.5rem,7vw,2rem)] tracking-[0.02em] leading-[1.15]",
  },
  // Genuine script #1: flowing, painterly.
  C: {
    font: alexBrush.className,
    classes: "text-[clamp(2.1rem,9.5vw,2.9rem)] tracking-normal leading-[1.2]",
  },
  // Genuine script #2: more restrained/formal than Alex Brush.
  D: {
    font: mrsSaintDelafield.className,
    classes: "text-[clamp(2.1rem,9.8vw,2.9rem)] tracking-normal leading-[1.2]",
  },
} as const;

// Measured against the oval cartouche in hero-bg.jpg: 54% usable width at
// 50% height, 50% at 42/58%, 37% at 34/66%. Each option's clamp above was
// checked against this at 360/390/430px with the placeholder names; a script
// option in particular should be re-checked once real names are in, since
// scripts vary far more in width per character than a serif does.
// break-words stays as a defensive fallback, not the sizing mechanism.
const activeNameFont = NAME_FONT_OPTIONS[FONT_OPTION];
const nameClassName = `${activeNameFont.font} ${activeNameFont.classes} max-w-full break-words text-hero-ink`;

const smallClassName = `${cormorant.className} font-light text-hero-ink`;

// Doors start moving the instant `open` flips true. The reveal begins 200ms
// after that, then each line is offset a further 700/1100/1400/1800ms —
// giving the literal delays below (200+700, 200+1100, ...). Written as full
// literal classes (not built from a template string) so Tailwind's static
// scanner actually generates them.
const REVEAL = {
  name1:
    "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out motion-safe:delay-[900ms]",
  amp: "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out motion-safe:delay-[1300ms]",
  name2:
    "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out motion-safe:delay-[1600ms]",
  date: "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out motion-safe:delay-[2000ms]",
};

const HIDDEN = "opacity-0 translate-y-1.5";
const SHOWN = "opacity-100 translate-y-0";

export default function Hero({ gateClosed }: { gateClosed: boolean }) {
  const state = gateClosed ? SHOWN : HIDDEN;

  return (
    <section className="bg-hero-paper relative h-svh w-full overflow-hidden">
      <Image
        src="/hero/hero-bg.jpg"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <FloralDoors open={gateClosed} />

      {/* Simple symmetric center for now: with the current placeholder names
          tied at 11 characters each, there's no real "longer name" to anchor
          on. Once real names are in, if one is clearly longer, nudge this
          container's translate-y so that line's center — not the block's —
          lands on 50%. */}
      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1 px-6 text-center">
        <span className={`${nameClassName} ${state} ${REVEAL.name1}`}>
          {COUPLE.partnerOne}
        </span>
        <span
          className={`${smallClassName} text-lg leading-none ${state} ${REVEAL.amp}`}
        >
          &amp;
        </span>
        <span className={`${nameClassName} ${state} ${REVEAL.name2}`}>
          {COUPLE.partnerTwo}
        </span>
        <span
          className={`${smallClassName} mt-2 text-[11px] uppercase tracking-[0.3em] ${state} ${REVEAL.date}`}
        >
          {COUPLE.date}
        </span>
      </div>
    </section>
  );
}
