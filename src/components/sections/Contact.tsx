import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, Mail, Linkedin, Github, MapPin, Phone } from 'lucide-react';
import { Chars, FadeUp } from '@/lib/anim';

/* ── Data ─────────────────────────────────────────────────────────────────── */
const EMAIL = 'sriramravichandran02@gmail.com';

const SOCIALS = [
  { icon: Mail,     label: 'Email',    href: `mailto:${EMAIL}`,                              external: false },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/sriram-ravichandran', external: true  },
  { icon: Github,   label: 'GitHub',   href: 'https://github.com/sriram-ravichandran',      external: true  },
];

const useLocalTime = () => {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: '2-digit', minute: '2-digit',
      hour12: true,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return time;
};

/* ── 3D tilting contact card ──────────────────────────────────────────────── */
const ContactCard = ({ time }: { time: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  const rotX = useSpring(useMotionValue(0), { stiffness: 140, damping: 18 });
  const rotY = useSpring(useMotionValue(0), { stiffness: 140, damping: 18 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glare = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(60% 45% at ${gx}% ${gy}%, rgb(var(--ink-rgb) / 0.10) 0%, transparent 70%)`
  );

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;   // 0..1
    const py = (e.clientY - rect.top) / rect.height;
    // Gentle tilt — strong angles make hover targets slide out from under the pointer
    rotX.set((0.5 - py) * 7);
    rotY.set((px - 0.5) * 7);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };

  const onLeave = () => {
    rotX.set(0);
    rotY.set(0);
  };

  return (
    <div style={{ perspective: 1100 }}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative rounded-3xl border border-line bg-surface p-8 md:p-11 overflow-hidden"
        style={{ rotateX: rotX, rotateY: rotY }}
      >
        {/* Sheen following the pointer */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ background: glare }} />
        {/* Signal corner wash */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(90% 70% at 100% 0%, rgb(var(--signal-rgb) / 0.10) 0%, transparent 55%)' }}
        />

        <div className="relative">
          {/* Card header */}
          <div className="flex items-center justify-between mb-12 md:mb-16">
            <span className="label-mono">Contact card</span>
            <span className="inline-flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--ok)', animation: 'pulse-dot 2.2s ease-in-out infinite' }}
              />
              <span className="label-mono !text-ink/80">Open to work</span>
            </span>
          </div>

          {/* Identity */}
          <p className="display text-ink mb-1.5" style={{ fontSize: 'clamp(1.45rem, 2.2vw, 2rem)' }}>
            Sriram Ravichandran
          </p>
          <p className="label-mono mb-10 md:mb-14">Full-stack &amp; backend engineer</p>

          {/* Email CTA — the card's centerpiece */}
          <a
            href={`mailto:${EMAIL}`}
            className="group block rounded-2xl border border-line px-5 py-5 md:px-7 md:py-6 mb-9 transition-colors duration-500 hover:bg-signal hover:border-signal"
            data-cursor="hover"
          >
            <span className="label-mono block mb-1 transition-colors duration-500 group-hover:!text-white/80">
              Say hello
            </span>
            <span className="flex items-center justify-between gap-3">
              <span className="text-ink font-medium text-sm md:text-base truncate transition-colors duration-500 group-hover:text-white">
                {EMAIL}
              </span>
              <ArrowUpRight className="w-5 h-5 shrink-0 text-signal transition-all duration-500 group-hover:text-white group-hover:rotate-45" />
            </span>
          </a>

          {/* Footer row: socials + locale */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              {SOCIALS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.external ? '_blank' : undefined}
                  rel={s.external ? 'noopener noreferrer' : undefined}
                  aria-label={s.label}
                  className="group/coin relative z-10 flex items-center justify-center w-14 h-14 rounded-full border border-line transition-all duration-300 ease-out-expo hover:bg-ink hover:border-ink hover:scale-110"
                >
                  <s.icon className="w-5 h-5 text-inkmuted transition-colors duration-300 group-hover/coin:text-canvas" />
                </a>
              ))}
            </div>
            <div className="text-right">
              <p className="label-mono">Chicago, IL</p>
              <p className="label-mono !text-ink/70 tabular-nums">{time} CT</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Main ─────────────────────────────────────────────────────────────────── */
const Contact = () => {
  const time = useLocalTime();

  return (
    <section
      id="contact"
      className="relative min-h-[100svh] flex flex-col pt-14 md:pt-16 overflow-hidden"
      aria-label="Contact"
    >
      <div className="px-6 md:px-12 max-w-[1400px] mx-auto w-full flex-1 flex flex-col">
        {/* Opener row */}
        <FadeUp className="hairline-t pt-5 mb-10 md:mb-0 flex items-baseline justify-between gap-4 flex-wrap">
          <span className="label-mono">
            <span className="text-signal">03</span>
            <span className="mx-2 opacity-40">/</span>
            Contact
          </span>
          <span className="label-mono hidden sm:block">Have an idea? Let&apos;s talk —</span>
        </FadeUp>

        {/* Headline left · tilt card right — vertically centered in the viewport */}
        <div className="flex-1 grid lg:grid-cols-12 gap-14 lg:gap-16 items-center content-center pb-16 md:pb-20">
          <div className="lg:col-span-7">
            {/* Justified type block — each line sized to fill the column */}
            <h2 className="display text-ink mb-8">
              <span className="flex items-center gap-4 whitespace-nowrap" style={{ fontSize: 'clamp(1.9rem, 4.1vw, 4rem)' }}>
                <Chars text="LET'S BUILD" interactive />
                <motion.span
                  className="text-signal shrink-0 leading-none"
                  style={{ fontSize: '0.55em' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  aria-hidden="true"
                >
                  ✦
                </motion.span>
              </span>
              <span className="block whitespace-nowrap text-outline" style={{ fontSize: 'clamp(2.2rem, 4.7vw, 4.6rem)' }}>
                <Chars text="SOMETHING" delay={0.1} interactive />
              </span>
              <span
                className="block whitespace-nowrap overflow-hidden py-[0.1em] -my-[0.06em]"
                style={{ fontSize: 'clamp(2.9rem, 7vw, 6.8rem)' }}
              >
                <Chars text="remarkable." delay={0.2} className="serif-accent text-signal" />
              </span>
            </h2>

            <FadeUp delay={0.15}>
              <p className="text-inkmuted text-base md:text-lg leading-relaxed max-w-md mb-8">
                Open to full-time roles, freelance projects, and AI research
                collaborations. Tell me what you&apos;re building — I reply within
                24 hours.
              </p>
            </FadeUp>

            <FadeUp delay={0.25} className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-inkmuted">
              <span className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-signal" /> Chicago, IL — open to relocation
              </span>
              <span className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-signal" /> +1 312 394 9647
              </span>
            </FadeUp>
          </div>

          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 60, rotate: 3 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: '-12% 0px' }}
            transition={{ type: 'spring', stiffness: 90, damping: 16, delay: 0.2 }}
          >
            <ContactCard time={time} />
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="hairline-t px-6 md:px-12 py-7">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="label-mono">© {new Date().getFullYear()} Sriram Ravichandran</p>
          <p className="label-mono tabular-nums">Chicago — {time}</p>
        </div>
      </footer>
    </section>
  );
};

export default Contact;
