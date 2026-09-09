"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** Video is 3.6s (see CLAUDE.md); used only if `loadedmetadata` never fires. */
const FALLBACK_DURATION_MS = 3600;
/** Cushion added on top of the real/fallback duration before we force-close. */
const FALLBACK_PADDING_MS = 300;
const CLOSE_MS = 500;

const AUDIO_VOLUME = 0.35;
const AUDIO_RAMP_MS = 1500;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/** Ramps an already-playing element's volume from its current value to `to`. */
function rampVolume(media: HTMLMediaElement, to: number, durationMs: number) {
  const from = media.volume;
  const start = performance.now();

  function step(now: number) {
    const t = Math.min(1, (now - start) / durationMs);
    media.volume = from + (to - from) * t;
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function SpeakerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 8a5 5 0 0 1 0 8" />
      <path d="M17.7 5a9 9 0 0 1 0 14" />
      <path d="M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5a.8.8 0 0 1 1.5.5v14a.8.8 0 0 1-1.5.5L6 15Z" />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5a.8.8 0 0 1 1.5.5v14a.8.8 0 0 1-1.5.5L6 15Z" />
      <path d="M16 10l4 4m0-4l-4 4" />
    </svg>
  );
}

export default function EnvelopeGate() {
  // Subscribing (rather than reading matchMedia in an effect + setState)
  // keeps this in sync with the platform without a cascading render.
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const closedRef = useRef(false);
  const durationMsRef = useRef(FALLBACK_DURATION_MS);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // `overlayVisible` covers just the tap-to-open visuals. The gate keeps
  // rendering after that (an unmounted <audio> would stop the music), so the
  // background track and the mute toggle can outlive the opening animation.
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [opened, setOpened] = useState(false);
  const [closing, setClosing] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion || !overlayVisible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    videoRef.current?.load();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [prefersReducedMotion, overlayVisible]);

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  const close = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    setClosing(true);
    setTimeout(() => setOverlayVisible(false), CLOSE_MS);
  };

  const activate = () => {
    if (opened) return;
    setOpened(true);

    // The tap is the only guaranteed user gesture, so both the video and the
    // background track start here, synchronously, or not at all.
    const video = videoRef.current;
    video?.play().catch(() => {
      // Autoplay-with-sound restrictions don't apply (muted), but ignore
      // any rejection so a blocked play() can't throw into the handler.
    });

    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0;
      audio.play().catch(() => {
        // A blocked autoplay should never break the opening animation.
      });
      rampVolume(audio, AUDIO_VOLUME, AUDIO_RAMP_MS);
    }

    // `ended` is unreliable on mobile Safari, so back it with a timer.
    fallbackTimerRef.current = setTimeout(
      close,
      durationMsRef.current + FALLBACK_PADDING_MS,
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "Spacebar"
    ) {
      event.preventDefault();
      activate();
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) audio.muted = !audio.muted;
    setMuted((m) => !m);
  };

  if (prefersReducedMotion) return null;

  return (
    <>
      {overlayVisible && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Tap to open the invitation"
          onClick={activate}
          onKeyDown={handleKeyDown}
          className={`fixed inset-0 z-50 bg-blush transition-opacity duration-500 ${
            closing ? "opacity-0" : "opacity-100"
          }`}
        >
          <Image
            src="/initial-screen/initial-page.png"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className={`object-cover transition-opacity duration-50 ${
              opened ? "opacity-0" : "opacity-100"
            }`}
          />

          <video
            ref={videoRef}
            src="/initial-screen/envelope.mp4"
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            onLoadedMetadata={(event) => {
              const d = event.currentTarget.duration;
              if (Number.isFinite(d) && d > 0) durationMsRef.current = d * 1000;
            }}
            onEnded={close}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-50 ${
              opened ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            aria-hidden="true"
            className={`pointer-events-none absolute top-[45%] left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${
              opened ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-gold/40" />
            <span className="absolute inset-0 rounded-full border border-gold/70" />
          </div>

          <p
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 bottom-[8%] text-center text-xs uppercase tracking-[0.3em] text-ink/80 transition-opacity duration-200 ${
              opened ? "opacity-0" : "opacity-100"
            }`}
          >
            Tap to open
          </p>
        </div>
      )}

      <audio ref={audioRef} src="/audio/wedding-audio.mp3" loop />

      {opened && !overlayVisible && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute background music" : "Mute background music"}
          className="fixed top-[max(1rem,env(safe-area-inset-top))] right-4 z-40 text-navy/50 transition-colors hover:text-navy/80 focus-visible:text-navy/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/60"
        >
          {muted ? <SpeakerOffIcon /> : <SpeakerIcon />}
        </button>
      )}
    </>
  );
}
