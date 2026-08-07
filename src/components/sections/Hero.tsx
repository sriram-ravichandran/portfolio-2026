import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Chars, MaskLine, EASE_OUT } from '@/lib/anim';
import Marquee from '@/components/Marquee';

const KEYWORDS = [
  'Agentic AI',
  'RAG Pipelines',
  'Knowledge Graphs',
  'Multi-Agent Orchestration',
  'Scalable Systems',
  'M.S. CS — Illinois Tech',
];

/* Static scroll cue — the marquee below already supplies motion, so this one holds still.
   The hairline fills with signal on hover only. */
const ScrollCue = () => (
  <a
    href="#about"
    className="group flex flex-col items-center gap-3 pb-1"
    aria-label="Scroll to about section"
    data-cursor="hover"
  >
    <span
      className="label-mono !text-ink/60 transition-colors duration-300 group-hover:!text-ink"
      style={{ writingMode: 'vertical-rl', letterSpacing: '0.35em' }}
    >
      SCROLL
    </span>
    <span className="relative block w-px h-16 overflow-hidden" style={{ background: 'var(--line)' }}>
      <span className="absolute inset-x-0 top-0 h-full bg-signal -translate-y-full transition-transform duration-700 group-hover:translate-y-0" />
    </span>
  </a>
);

const Hero = ({ booted }: { booted: boolean }) => {
  const sectionRef = useRef<HTMLElement>(null);

  /* Scroll choreography — name sinks, shrinks and fades as you leave */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const nameY       = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const nameScale   = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const nameOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const orbAY       = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const orbBY       = useTransform(scrollYProgress, [0, 1], [0, -180]);

  /* Mouse parallax — name and orbs lean subtly toward the pointer */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const nameMX = useSpring(useTransform(mx, v => v * 14), { stiffness: 60, damping: 20 });
  const nameMY = useSpring(useTransform(my, v => v * 10), { stiffness: 60, damping: 20 });
  const orbMX  = useSpring(useTransform(mx, v => v * -36), { stiffness: 40, damping: 24 });
  const orbMY  = useSpring(useTransform(my, v => v * -26), { stiffness: 40, damping: 24 });

  const onMouseMove = (e: React.MouseEvent) => {
    mx.set((e.clientX / window.innerWidth) - 0.5);
    my.set((e.clientY / window.innerHeight) - 0.5);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden"
      aria-label="Introduction"
    >
      {/* Ambient orbs — drift on their own, lean with the mouse, split on scroll */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ x: orbMX, y: orbMY }} aria-hidden="true">
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{
            width: '46vmax', height: '46vmax', right: '-14%', top: '-18%',
            background: 'radial-gradient(circle, rgb(var(--signal-rgb) / 0.12) 0%, transparent 60%)',
            y: orbAY,
          }}
          animate={{ x: [0, -50, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{
            width: '38vmax', height: '38vmax', left: '-12%', bottom: '-16%',
            background: 'radial-gradient(circle, rgb(var(--ink-rgb) / 0.07) 0%, transparent 60%)',
            y: orbBY,
          }}
          animate={{ x: [0, 60, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
      </motion.div>

      {/* Center: the name */}
      <motion.div
        className="relative px-6 md:px-12 flex-1 flex flex-col justify-center pt-24 pb-10"
        style={{ y: nameY, opacity: nameOpacity, scale: nameScale }}
      >
        {/* Availability pill */}
        <MaskLine play={booted} delay={0.25} className="mb-6 md:mb-10">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-line px-4 py-2 bg-canvas/40 backdrop-blur-sm">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--ok)', animation: 'pulse-dot 2.2s ease-in-out infinite' }}
            />
            <span className="label-mono !text-ink/80">Open to opportunities</span>
          </span>
        </MaskLine>

        <motion.h1 className="display text-ink relative" style={{ x: nameMX, y: nameMY }}>
          <span className="block whitespace-nowrap" style={{ fontSize: 'min(13vw, 12.5rem)' }}>
            <Chars text="SRIRAM" play={booted} delay={0.35} interactive />
          </span>
          <span
            className="block whitespace-nowrap text-outline"
            style={{ fontSize: 'min(6.4vw, 6.4rem)' }}
          >
            <Chars text="RAVICHANDRAN" play={booted} delay={0.55} interactive />
          </span>
        </motion.h1>

        {/* Role + description + scroll badge row */}
        <div className="mt-8 md:mt-14 grid md:grid-cols-12 gap-6 md:gap-10 items-end">
          <MaskLine play={booted} delay={1.05} className="md:col-span-5">
            <p
              className="display text-ink leading-none"
              style={{ fontSize: 'clamp(1.3rem, 3vw, 2.2rem)' }}
            >
              Full-Stack{' '}
              <span className="serif-accent text-signal" style={{ fontSize: '1.2em' }}>&amp;</span>{' '}
              AI{' '}
              <span className="serif-accent text-signal" style={{ fontSize: '1.12em' }}>
                engineer
              </span>
            </p>
          </MaskLine>

          <motion.p
            className="text-inkmuted text-base md:text-lg leading-relaxed max-w-md md:col-span-4"
            initial={{ opacity: 0, y: 24 }}
            animate={booted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 1.25 }}
          >
            I ship production-grade agentic systems end-to-end — RAG pipelines,
            multi-agent orchestration, and the infrastructure under them.
          </motion.p>

          <motion.div
            className="hidden md:flex md:col-span-3 justify-end"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={booted ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 140, damping: 16, delay: 1.6 }}
          >
            <ScrollCue />
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom: keyword marquee — alternating solid / outline */}
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: booted ? 1 : 0 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <Marquee duration={34} className="hairline-t py-5">
          {KEYWORDS.map((k, i) => (
            <span key={k} className="flex items-center shrink-0">
              <span
                className={`display whitespace-nowrap ${i % 2 === 0 ? 'text-ink/85' : 'text-outline-thin'}`}
                style={{ fontSize: 'clamp(1.05rem, 2vw, 1.5rem)' }}
              >
                {k}
              </span>
              <span className="mx-7 text-signal" aria-hidden="true">✦</span>
            </span>
          ))}
        </Marquee>
      </motion.div>
    </section>
  );
};

export default Hero;
