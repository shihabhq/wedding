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

Assets:

- `public/initial-screen/envelope-poster.jpg` (frame 1 of the video)
- `public/initial-screen/envelope.mp4` (3.6s, 1080 wide, ~970KB, already faded
  to cream `#FDF3EF` over the last 0.6s)

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
   that is already painted.

Also handled: body scroll lock while the gate is up, `prefers-reduced-motion`
skips the gate entirely, keyboard activation via Enter and Space.

The tap affordance ring is positioned at `top-[45%]`, which is where the wax
seal sits in the current poster. If the poster is recropped, move the ring.

**Known issue to verify on a real device:** the clip is 1440x2404 (ratio 0.60)
and a phone viewport is nearer 0.46, so `object-cover` crops roughly 23 percent
off each side. Confirm the seal and calligraphy still land correctly. Fix any
framing problem by recropping the video with ffmpeg, not with CSS.

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
- `components/envelope-gate.tsx`
- Hero section (`components/hero.tsx`), built against `public/hero/hero-plate.jpg`
  (a static plate, not a video as originally planned) — full-bleed Persian
  arch/Bengal river artwork (`object-cover object-top`). The arch opening is
  too narrow for the names (measured: ~43-55% wide at 38-52% height), so text
  does not sit in the arch. Instead the plate dissolves into flat parchment
  (`#EBD7AF`) from 60% to 78% height, and the eyebrow/names/date block sits on
  that parchment band at `top-[71%]`. Also: the cream gradient strip blending
  the envelope video's last frame into the plate top, a scroll cue at
  `bottom-[4%]`, and ambient falling petals (`components/falling-petals.tsx`,
  pure CSS, hidden under reduced motion). Type is behind a single constant
  (`FONT_OPTION` in `hero.tsx`) so the two options (Cormorant Garamond
  throughout vs. Marcellus for the names) can be compared and picked.
- Background audio (`public/audio/wedding-audio.mp3`), started from the same
  tap gesture as the envelope video in `envelope-gate.tsx`, with a volume ramp
  and a mute toggle that appears once the gate has closed.
- `FallingPetals` is a Server Component using `Math.random()`; since `/` is
  statically prerendered, the petal layout is fixed at build time, not
  per-visitor. Fine for ambient decoration; move it client-side if per-visit
  variation is ever wanted.
- **Names and date on the hero are placeholder text** (`COUPLE` constant at
  the top of `hero.tsx`) — real names, date, and venue are still needed before
  this can ship; see "When you are unsure" below.

Next:

- Illustrated section frames: countdown, when and where, schedule, dress code,
  gifts
- RSVP form wired to Supabase, with a honeypot field for bots

## When you are unsure

Ask before inventing artwork, copy, event details, names, dates or venue. None
of that is placeholder-safe on a real wedding invitation.
