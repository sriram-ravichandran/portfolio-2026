import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Chars, FadeUp } from '@/lib/anim';

/**
 * Shared section opener: hairline, mono index row, giant display title.
 * `titleLines` render as stacked mask-revealed lines; a line can opt into
 * the serif-italic accent or outline treatment.
 */
export interface TitleLine {
  text: string;
  serif?: boolean;
  outline?: boolean;
}

const SectionHeader = ({
  index,
  label,
  meta,
  titleLines,
}: {
  index: string;
  label: string;
  meta?: string;
  titleLines: TitleLine[];
}) => {
  // Lines drift horizontally in opposite directions as the header scrolls by.
  // On small screens the lines are sized to nearly fill the viewport, so the
  // drift is damped to keep them inside the gutters.
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const amp = typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 40;
  const driftA = useTransform(scrollYProgress, [0, 1], [amp, -amp]);
  const driftB = useTransform(scrollYProgress, [0, 1], [-amp, amp]);

  return (
    <div ref={ref} className="mb-16 md:mb-24">
      <FadeUp className="hairline-t pt-5 mb-10 md:mb-14 flex items-baseline justify-between gap-4">
        <span className="label-mono">
          <span className="text-signal">{index}</span>
          <span className="mx-2 opacity-40">/</span>
          {label}
        </span>
        {meta && <span className="label-mono hidden sm:block">{meta}</span>}
      </FadeUp>

      {/* Mobile size is vw-proportional so the longest line (CREDENTIALS) never wraps */}
      <h2 className="display text-ink text-[min(7.2vw,2.6rem)] md:text-[clamp(2.6rem,8vw,7rem)]">
        {titleLines.map((line, i) =>
          line.serif ? (
            <motion.span key={i} className="block whitespace-nowrap overflow-hidden py-[0.08em] -my-[0.08em]" style={{ x: driftB }}>
              <Chars
                text={line.text}
                delay={0.12 * i}
                className="serif-accent text-signal"
                style={{ fontSize: '0.92em' }}
              />
            </motion.span>
          ) : (
            <motion.span
              key={i}
              className={`block whitespace-nowrap ${line.outline ? 'text-outline' : ''}`}
              style={{ x: i % 2 === 0 ? driftA : driftB }}
            >
              <Chars text={line.text} delay={0.12 * i} />
            </motion.span>
          )
        )}
      </h2>
    </div>
  );
};

export default SectionHeader;
