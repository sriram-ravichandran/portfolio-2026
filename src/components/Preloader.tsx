import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_IO } from '@/lib/anim';

/**
 * Full-screen preloader.
 * The ✦ mark completes exactly one smooth turn over the load (driven by the
 * raw time fraction with an ease-in-out, not the rounded counter), then blows
 * up to flood the screen with vermilion; the wash fades out to reveal the
 * site. `onComplete` fires as the fade starts so the hero reveal plays just
 * as the vermilion clears.
 */
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* Exact-geometry star (same path as the favicon). A ✦ text glyph sits
   off-center in its em box on some platforms (iPadOS), which turns into a
   visible drift when scaled ~110×; SVG keeps the scale origin dead center. */
const Star = () => (
  <svg viewBox="0 0 64 64" width="1em" height="1em" fill="currentColor" className="block" aria-hidden="true">
    <path d="M32 7 C34.6 24.4 39.6 29.4 57 32 C39.6 34.6 34.6 39.6 32 57 C29.4 39.6 24.4 34.6 7 32 C24.4 29.4 29.4 24.4 32 7 Z" />
  </svg>
);

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [prog, setProg] = useState(0); // raw 0..1, unrounded
  const [stage, setStage] = useState<'loading' | 'zoom' | 'gone'>('loading');

  useEffect(() => {
    let raf: number;
    const t0 = performance.now();
    const DURATION = 1700;

    const tick = (now: number) => {
      // rAF timestamps mark the frame start and can precede the t0 captured
      // mid-frame above, so clamp at 0 or the progress dips negative
      const t = Math.max(0, Math.min(1, (now - t0) / DURATION));
      setProg(t);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setStage('zoom'), 200);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Counter keeps its eager ease-out cadence; the glyph turns on ease-in-out.
  const count = Math.round((1 - Math.pow(1 - prog, 3)) * 100);
  const turn = easeInOut(prog);

  return (
    <AnimatePresence>
      {stage !== 'gone' && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col justify-between px-6 py-8 md:px-12 md:py-10 overflow-hidden"
          style={{ background: 'var(--bg)' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          aria-hidden="true"
        >
          {/* top row */}
          <div className="flex items-center justify-between">
            <span className="label-mono">Sriram Ravichandran</span>
            <span className="label-mono">Portfolio — 2026</span>
          </div>

          {/* center: the ✦ mark — one smooth turn, then it swallows the screen */}
          <div className="self-center leading-none select-none" style={{ fontSize: 'clamp(3.2rem, 8vw, 6rem)' }}>
            {stage === 'loading' ? (
              <span
                className="block text-signal will-change-transform"
                style={{
                  transform: `rotate(${turn * 360}deg) scale(${0.55 + turn * 0.45})`,
                  opacity: 0.35 + turn * 0.65,
                }}
              >
                <Star />
              </span>
            ) : (
              <motion.span
                className="block text-signal will-change-transform"
                initial={{ rotate: 360, scale: 1 }}
                animate={{ rotate: 450, scale: 110 }}
                transition={{ duration: 0.9, ease: EASE_IO }}
                onAnimationComplete={() => {
                  onComplete();
                  setStage('gone');
                }}
              >
                <Star />
              </motion.span>
            )}
          </div>

          {/* bottom row: counter + progress hairline */}
          <div>
            <div className="flex items-end justify-between mb-4">
              <span className="label-mono">Loading experience</span>
              <span
                className="display text-ink tabular-nums leading-none"
                style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}
              >
                {count}
              </span>
            </div>
            <div className="h-px w-full" style={{ background: 'var(--line)' }}>
              <div
                className="h-full"
                style={{ width: `${count}%`, background: 'var(--accent)', transition: 'width 0.1s linear' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
