# CLAUDE.md

Context for this repository. Read this before making changes.

## What this is

A single-page mobile wedding invitation website for a client. One page, no
routing, no CMS. The guest opens a link on their phone, sees a closed envelope,
taps it, watches it open, and lands on the invitation.

The reference the client approved is the "Odette" demo at
`thedigitalyes.com/demo/odette`. We are building the same interaction pattern
with her own artwork and palette.

## Non-negotiable constraints

**Mobile only.** Design and test at 390px wide. Desktop just needs to not look
broken. Do not spend effort on desktop layouts, and do not add `md:` or `lg:`
breakpoints unless something genuinely breaks.

**Texture comes from image assets, never from CSS.** This is the single most
important rule in this project. The embossed paper, the botanical deboss, the
wax seal, the illustrated section frames are all pre-rendered PNG and MP4 files
produced outside the codebase. Do not attempt to approximate them with
gradients, box-shadows, SVG filters or CSS `filter`. If a visual needs texture
and the asset does not exist yet, say so and stop rather than faking it.

**Text stays in HTML.** Never bake copy into an image. Names, dates, times and
the schedule will all change. Illustrated frames are art only, with empty space
reserved where text will sit.

## Stack

- Next.js (App Router) with TypeScript
- Tailwind CSS
- Supabase for the RSVP submissions (not built yet)
- Deploys to Vercel

## Design tokens

Palette, taken from the client's approved swatches:

| token    | hex       | use                              |
| -------- | --------- | -------------------------------- |
| `blush`  | `#F5D9CE` | envelope paper, page background  |
| `rose`   | `#D9A99C` | deeper paper tone, shadows       |
| `sage`   | `#A8B49F` | secondary accent                 |
| `sand`   | `#EDE3D4` | cream card, revealed interior    |
| `gold`   | `#C9A87C` | wax seal, small accents, buttons |
| `powder` | `#B9C7D2` | cool accent                      |
| `ink`    | `#7A5348` | body and heading text            |

Type: one script face for headings, one quiet serif or sans for body. Load with
`next/font`. Size headings with `clamp()` against `vw` so they scale with the
artwork behind them, not with a fixed breakpoint.

## Section layout pattern

Every illustrated section follows the same shape. A full-width image, with text
positioned on top by percentage:

```tsx
<section className="relative w-full">
  <img src="/frames/venue.png" alt="" className="w-full h-auto" />
  <div className="absolute inset-x-0 top-[16%] px-6 text-center">
    <h2 className="text-[clamp(2.4rem,10vw,5rem)] font-script">When & Where</h2>
  </div>
</section>
```

Percentages plus `vw`-based `clamp()` keep the text locked to the same spot on
the artwork across every phone width. Do not use fixed pixel offsets here.

## The envelope gate

`components/envelope-gate.tsx` renders above the page and is the first thing a
guest sees.

Assets (currently `envelope.jpg` / `envelope.mp4`; the intended final names
are `envelope-final-poster.jpg` / `envelope-final.mp4` — swap the two `src`
values in `envelope-gate.tsx` once those files are dropped into
`public/initial-screen/`):

- `public/initial-screen/envelope.jpg` (frame 1 of the video)
- `public/initial-screen/envelope.mp4` (3.6s, 1080 wide, already faded to
  cream `#FDF3EF` over the last 0.6s)

Mechanic, in order:

1. The poster image sits at full opacity over the video, which sits at zero.
   This avoids a black or blank video box while the clip buffers.
2. The video has `muted`, `playsInline` and `preload="auto"`, and `load()` is
   called on mount so iOS starts buffering behind the poster.
3. On tap, the two opacities swap over 50ms and the video plays.
4. On `ended`, the whole overlay fades to zero over 500ms and unmounts. A
   duration-based `setTimeout` backs this up, because `ended` misfires on some
   mobile browsers.
5. The hero is mounted underneath the whole time, so the fade reveals a page
   that is already painted. `EnvelopeGate` takes an `onClosed` callback,
   fired once the fade finishes — `app/page.tsx` lifts that into a
   `gateClosed` boolean and passes it to `Hero`, which uses it to trigger the
   door reveal (see "The hero" below).

Also handled: body scroll lock while the gate is up, keyboard activation via
Enter and Space. `prefers-reduced-motion` skips the gate's visuals entirely,
but still fires `onClosed` immediately (via a dedicated effect) — otherwise a
reduced-motion guest would never see anything gated on it.

**Known issue to verify on a real device:** the clip is 1440x2404 (ratio 0.60)
and a phone viewport is nearer 0.46, so `object-cover` crops roughly 23 percent
off each side. Confirm the seal and calligraphy still land correctly. Fix any
framing problem by recropping the video with ffmpeg, not with CSS.

## The hero (door reveal)

`components/hero.tsx` + `components/floral-doors.tsx`. Replaces an earlier
Persian-arch/parchment-band concept entirely — nothing from that version
carried over (including `components/falling-petals.tsx`, which was deleted;
`public/hero/hero-plate.jpg` is now an unused leftover file).

Assets:

- `public/hero/hero-bg.jpg` — pale blush paper with an empty oval cartouche
  (1080x2340)
- `public/hero/doors.jpg` — dense floral curtain (1080x2340)

Layers, back to front: `hero-bg.jpg` full-bleed, `<FloralDoors>`, then the
names.

`FloralDoors` renders the *same* `doors.jpg` twice, each copy clipped to one
half via `clip-path: inset()` (not cropped as separate assets), so the two
halves stay pixel-aligned while closed. Opening animates `transform:
translateX()` only (never `left`/`width`) on each half, 1300ms,
`cubic-bezier(.65,0,.2,1)`. It unmounts 300ms after the slide finishes.
Critical invariant: it must be mounted and already closed from first paint,
sitting behind the envelope gate the whole time, so there's never a frame
where the hero shows through before the gate has closed.

Names sit centred over the oval cartouche, sized to the artwork's own
geometry (measured: the oval's usable width is 54% of the viewport at 50%
height, 50% at 42/58%, 37% at 34/66%) — `clamp(1.5rem, 7vw, 2rem)`, tracking
0.06em, line-height 1.15. The text block is currently just centred
symmetrically; the spec calls for anchoring whichever name is longer at the
50% mark specifically, which hasn't been finalized because the placeholder
names are the same length (see below) — revisit once real names are in.

Reveal is staggered off `gateClosed`: 200ms after the doors start moving,
then each line is offset a further 700/1100/1400/1800ms (first name,
ampersand, second name, date), each its own 500ms fade + 6px rise. All of it
is wrapped in `motion-safe:`; a reduced-motion guest sees the finished hero
immediately, doors and animation skipped entirely.

Colors are hero-specific, sampled from this art (not the client's swatch
sheet): `hero-ink` `#6B5545` (names, date), `hero-gold` `#B79762` (the
oval's hairline, not drawn by us), `hero-paper` `#F5EAE5` (fallback behind
`hero-bg.jpg` while it loads). No panel, card or scrim behind the text — it
would flatten the oval's gold ring.

**Names and date are still placeholder text** (`COUPLE` constant at the top
of `hero.tsx`) — real names and date are needed before this can ship, and
before the "anchor the longer name" and margin-to-hairline checks above can
actually be verified.

## Performance rules

- Videos and images are the entire page weight. Keep each video under 1.5MB.
- Encode H.264, `yuv420p`, `-movflags +faststart`.
- Run every PNG through compression. Use WebP where transparency allows.
- Guests will open this on mobile data at a wedding in Bangladesh. Test
  throttled, not on localhost.

## Copy

Plain, warm, human. No marketing language. Do not use em dashes anywhere in
user-facing copy.

## Current state

Done:

- Envelope opening video and poster produced and encoded
- `components/envelope-gate.tsx`, now with an `onClosed` callback lifted into
  `app/page.tsx` as a `gateClosed` boolean
- Hero door reveal (`components/hero.tsx`, `components/floral-doors.tsx`) —
  see "The hero (door reveal)" above. This replaced an earlier Persian-arch
  hero concept entirely.
- Background audio (`public/audio/wedding-audio.mp3`), started from the same
  tap gesture as the envelope video in `envelope-gate.tsx`, with a volume ramp
  and a mute toggle that appears once the gate has closed. (Fixed a bug where
  the ramp's `requestAnimationFrame` timestamp could land fractionally before
  its start time, throwing on a negative volume and silently killing the ramp
  on frame one — clamp both ends of `t`, not just the upper one.)
- **Names and date on the hero are placeholder text** — see "The hero (door
  reveal)" above.

Next:

- Illustrated section frames: countdown, when and where, schedule, dress code,
  gifts
- RSVP form wired to Supabase, with a honeypot field for bots

## When you are unsure

Ask before inventing artwork, copy, event details, names, dates or venue. None
of that is placeholder-safe on a real wedding invitation.
