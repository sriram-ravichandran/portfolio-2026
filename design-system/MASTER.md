# Design System — "Ink & Signal" (Master Source of Truth)

Generated with the ui-ux-pro-max skill (Portfolio/Personal → Motion-Driven + Minimalism,
storytelling-driven landing, neutral canvas, personality through motion & typography).

## Concept

Editorial noir. A near-black warm canvas where typography IS the interface.
One loud accent (vermilion signal). Motion is choreographed, physical, and
interruptible — never decorative noise. Every entrance is a mask reveal;
every hover has weight.

## Tokens

### Color (dual-theme via RGB-triplet CSS vars, toggled by `html.light`)
| Token      | Dark                      | Light (warm paper)       | Use |
|------------|---------------------------|--------------------------|-----|
| canvas     | `#0A0A09`                 | `#F3F0E9`                | Page background |
| surface    | `#131311`                 | `#EAE6DD`                | Cards / raised surfaces |
| ink        | `#F2EFE8`                 | `#171512`                | Primary text |
| muted      | `#98948A`                 | `#6E6A61`                | Secondary text |
| line       | `ink @ 14%`               | `ink @ 16%`              | Hairline borders |
| signal     | `#FF4D1C`                 | `#FF4D1C`                | Accent — CTAs, indices |
| ok green   | `#7BE06B`                 | `#2E8F4A`                | Availability status only |

Theme switch: `ThemeContext` toggles `html.light`, persists to localStorage
(no-flash inline script in index.html), and briefly applies `html.theme-anim`
so every surface color-morphs over ~0.55s. Toggle lives at the navbar's right end.

Per-project hues (Projects section): `#FF4D1C`, `#5AC8FA`, `#7BE06B`, `#C79BFF`.

### Typography
- **Display**: Syne 700/800 — uppercase, `letter-spacing: -0.03em`, `line-height: 0.9`
- **Serif accent**: Instrument Serif italic — lowercase counterpoint words
- **Body**: Inter 300–600
- **Micro/labels**: JetBrains Mono 400/500 — `0.65–0.75rem`, `letter-spacing: 0.2em`, uppercase
- Scale: hero `clamp(3rem, 12vw, 11rem)`, section titles `clamp(2.6rem, 8vw, 7rem)`, body 16–18px, line-height 1.6

### Motion
- `EASE_OUT = [0.16, 1, 0.3, 1]` (entrances) · `EASE_IO = [0.87, 0, 0.13, 1]` (curtains/masks)
- Durations: micro 0.3s · reveal 0.7–0.9s · curtain 1.0s. Exits ~65% of enter.
- Stagger: chars 0.028s · lines/items 0.08s
- Only `transform` + `opacity` animated. `MotionConfig reducedMotion="user"` + CSS reduced-motion kill-switch for marquees/grain.

## Signature moves (v2/v3 additions)
- Section titles shear horizontally (opposite directions per line) while scrolling past.
- Hero: kinetic letters (spring up + flash signal on hover), mouse-parallax name and ambient orbs, dot-grid texture, rotating circular scroll badge.
- Tech arsenal: scroll-driven tabbed index — the panel pins (sticky) while a 240vh runway scrolls beneath it, advancing through the five categories one by one (scroll progress → active tab); tabs stay hover/tap switchable, spring pip indicator, chips cascade per category.
- Contact: full-viewport (min-h-100svh, content vertically centered) with an interactive 3D-tilt contact card — gentle ±7° rotateX/Y springs + pointer-tracking sheen. NO translateZ layers inside an overflow-hidden tilt card: it breaks browser hit-testing and children stop receiving hover/click. Plain hover scale on the social coins (magnetic wrappers fight the tilt).
- Project cards: pointer-following hue spotlight + ghost index number with counter-scroll parallax.
- Film grain visible in BOTH themes (0.09 dark, inverted 0.05 light).
- REMOVED after user feedback: velocity marquee bands, all content marquees, floating serif flourish, giant end-of-page name.

## Signature moves
1. Preloader: mono progress counter → full-screen curtain lifts (`EASE_IO`), hero reveal overlaps.
2. Char-level mask reveals on all display type (translateY 110% → 0).
3. Scroll-scrubbed word opacity on the bio paragraph.
4. Sticky stacked project cards (scale + parallax as next card covers).
5. Infinite keyword marquee at hero foot; pause on hover; disabled on reduced motion.
6. Custom cursor: blend-difference dot, springs to 4× over interactive targets.
7. Magnetic CTAs (spring translate toward pointer, max ~12px).
8. Film grain overlay (SVG noise, steps animation, 4% opacity).
9. Navbar: mix-blend-difference, hides on scroll down, fullscreen mobile menu with staggered giant links.

## Rules (from skill QA checklist)
- Contrast: ivory on black ≥ 12:1; muted ≥ 4.5:1 for body-size text.
- Focus-visible rings kept (2px accent outline). Keyboard nav parity for all hovers.
- Touch targets ≥ 44px; marquee/cursor effects disabled on touch.
- `prefers-reduced-motion`: no marquees, no grain flicker, content visible immediately.
- No emoji icons — Lucide SVG only. One icon stroke width (1.5px).
- CLS: reserve space, animate transforms only; fonts `display=swap`.
