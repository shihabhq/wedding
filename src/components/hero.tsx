import Image from "next/image";
import { Cormorant_Garamond, Marcellus } from "next/font/google";
import FallingPetals from "@/components/falling-petals";

// PLACEHOLDER CONTENT — replace before this ships. CLAUDE.md is explicit that
// names and dates are never placeholder-safe on a real invitation; these are
// deliberately generic so nobody mistakes them for the real thing.
const COUPLE = {
  partnerOne: "Partner One",
  partnerTwo: "Partner Two",
  date: "Month Day, Year",
};

// Flip this to "B" to compare the two type options against the plate.
const FONT_OPTION: "A" | "B" = "A";

// Option A: Cormorant Garamond for both the names (300) and the small lines
// (400). Option B: Marcellus for the names, Cormorant Garamond for the small
// lines. Both are always loaded (see next/font note below); only the unused
// option's class never ends up in the DOM, so it's never actually fetched.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-cormorant",
});

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
});

const smallLineBase = `${cormorant.className} font-normal uppercase`;

const nameFontClassName =
  FONT_OPTION === "A" ? `${cormorant.className} font-light` : marcellus.className;

// Fixed per the measured artwork — the parchment band is the only place wide
// enough to hold names of any reasonable length; see CLAUDE.md.
const nameTextClassName =
  "max-w-full break-words text-[clamp(1.8rem,8.5vw,2.4rem)] tracking-[0.06em] leading-[1.05]";

export default function Hero() {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <Image
        src="/hero/hero-plate.jpg"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />

      {/* Blends the envelope video's final cream frame into the plate. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[14%]"
        style={{
          backgroundImage: "linear-gradient(#FDF3EF, rgba(253,243,239,0))",
        }}
      />

      {/* The painting dissolves into parchment from 60% to 78%, solid below. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[60%] h-[18%]"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(235,215,175,0), #EBD7AF)",
        }}
      />
      <div
        aria-hidden="true"
        className="bg-parchment absolute inset-x-0 top-[78%] bottom-0"
      />

      <FallingPetals />

      <div className="absolute inset-x-0 top-[71%] px-10 text-center">
        <p
          className={`${smallLineBase} text-label-brown text-[10px] leading-none tracking-[0.34em]`}
        >
          Together with their families
        </p>

        <div
          aria-hidden="true"
          className="bg-rule-gold mx-auto mt-2 h-px w-10"
        />

        <div className="text-navy mt-2 flex flex-col items-center gap-0.5">
          <span className={`${nameFontClassName} ${nameTextClassName}`}>
            {COUPLE.partnerOne}
          </span>
          <span
            className={`${cormorant.className} font-normal text-xl leading-none`}
          >
            &amp;
          </span>
          <span className={`${nameFontClassName} ${nameTextClassName}`}>
            {COUPLE.partnerTwo}
          </span>
        </div>

        <p
          className={`${smallLineBase} text-navy mt-2 text-[11px] tracking-[0.3em] leading-none`}
        >
          {COUPLE.date}
        </p>
      </div>

      <div
        aria-hidden="true"
        className="text-label-brown motion-safe:animate-hero-bob absolute inset-x-0 bottom-[4%] flex flex-col items-center gap-1.5"
      >
        <span
          className={`${smallLineBase} text-[10px] leading-none tracking-[0.34em]`}
        >
          Scroll
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6l6-6" />
        </svg>
      </div>
    </section>
  );
}
