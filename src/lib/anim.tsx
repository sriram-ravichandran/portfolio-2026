import { useRef, type CSSProperties, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

/* ── Motion tokens (design-system/MASTER.md) ──────────────────────────────── */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IO  = [0.87, 0, 0.13, 1] as const;

export const STAGGER_CHARS = 0.028;
export const STAGGER_ITEMS = 0.08;

/* ── Char-level mask reveal ───────────────────────────────────────────────
   Splits text into characters, each rising out of an overflow mask.
   Triggers when scrolled into view (or immediately via `play`).           */
export const Chars = ({
  text,
  className = '',
  delay = 0,
  duration = 0.9,
  stagger = STAGGER_CHARS,
  play,
  once = true,
  style,
  interactive = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  /** When provided, overrides in-view detection (true = animate now). */
  play?: boolean;
  once?: boolean;
  style?: CSSProperties;
  /** Letters spring upward and flash signal on hover. */
  interactive?: boolean;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, margin: '-8% 0px' });
  const active = play !== undefined ? play : inView;

  return (
    <span ref={ref} className={className} style={style} aria-label={text} role="text">
      {text.split('').map((char, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block overflow-hidden align-bottom"
        >
          <motion.span
            className={`inline-block will-change-transform ${
              interactive ? 'transition-colors duration-300 hover:text-signal' : ''
            }`}
            initial={{ y: '115%' }}
            animate={active ? { y: '0%' } : { y: '115%' }}
            whileHover={
              interactive
                ? { y: '-10%', transition: { type: 'spring', stiffness: 420, damping: 16 } }
                : undefined
            }
            transition={{ duration, ease: EASE_OUT, delay: delay + i * stagger }}
          >
            {char === ' ' ? ' ' : char}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

/* ── Line mask reveal — each child rises out of its own mask ─────────────── */
export const MaskLine = ({
  children,
  className = '',
  innerClassName = '',
  delay = 0,
  duration = 1,
  play,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  delay?: number;
  duration?: number;
  play?: boolean;
  once?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: '-8% 0px' });
  const active = play !== undefined ? play : inView;

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        className={`will-change-transform ${innerClassName}`}
        initial={{ y: '110%' }}
        animate={active ? { y: '0%' } : { y: '110%' }}
        transition={{ duration, ease: EASE_OUT, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
};

/* ── Simple fade-up on scroll ─────────────────────────────────────────────── */
export const FadeUp = ({
  children,
  className = '',
  delay = 0,
  duration = 0.8,
  y = 28,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: '-10% 0px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
};
