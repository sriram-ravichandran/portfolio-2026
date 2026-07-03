import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// ── Scramble text hook ────────────────────────────────────────────────────────
const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#ØΦΨ01ABCDEF@$%';

function useScramble(target: string, startDelay = 900, enabled = true) {
  const [text, setText] = useState(() => Array(target.length).fill('█').join(''));
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    timeout = setTimeout(() => {
      let iteration = 0;
      interval = setInterval(() => {
        setText(
          target
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iteration) return target[index];
              return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            })
            .join('')
        );
        iteration += 0.55;
        if (iteration >= target.length) {
          clearInterval(interval);
          setText(target);
          setDone(true);
        }
      }, 38);
    }, startDelay);

    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [target, startDelay, enabled]);

  return { text, done };
}

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(target: string, speed = 55, delay = 2000, enabled = true) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!enabled) return;
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    let i = 0;

    timeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayed(target.slice(0, i + 1));
        i++;
        if (i >= target.length) clearInterval(interval);
      }, speed);
    }, delay);

    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [target, speed, delay, enabled]);

  return displayed;
}

// ── Glitch hook — fires periodically after text is revealed ───────────────────
function useGlitch(target: string, enabled: boolean) {
  const [display, setDisplay] = useState(target);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!enabled) { setDisplay(target); return; }

    const schedule = () => {
      timerRef.current = setTimeout(() => {
        setDisplay(
          target.split('').map(c =>
            c === ' ' ? ' ' : Math.random() < 0.28
              ? SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
              : c
          ).join('')
        );
        setTimeout(() => { setDisplay(target); schedule(); }, 260);
      }, 5500 + Math.random() * 4000);
    };

    schedule();
    return () => clearTimeout(timerRef.current);
  }, [target, enabled]);

  return display;
}

// ── Corner HUD element ────────────────────────────────────────────────────────
const HUDCorners = ({ size = 16, opacity = 0.5 }: { size?: number; opacity?: number }) => (
  <>
    <span className="absolute top-0 left-0 pointer-events-none" style={{ width: size, height: size, borderTop: `1.5px solid rgba(0,212,255,${opacity})`, borderLeft: `1.5px solid rgba(0,212,255,${opacity})` }} />
    <span className="absolute top-0 right-0 pointer-events-none" style={{ width: size, height: size, borderTop: `1.5px solid rgba(0,212,255,${opacity})`, borderRight: `1.5px solid rgba(0,212,255,${opacity})` }} />
    <span className="absolute bottom-0 left-0 pointer-events-none" style={{ width: size, height: size, borderBottom: `1.5px solid rgba(0,212,255,${opacity})`, borderLeft: `1.5px solid rgba(0,212,255,${opacity})` }} />
    <span className="absolute bottom-0 right-0 pointer-events-none" style={{ width: size, height: size, borderBottom: `1.5px solid rgba(0,212,255,${opacity})`, borderRight: `1.5px solid rgba(0,212,255,${opacity})` }} />
  </>
);

// ── Hero ──────────────────────────────────────────────────────────────────────
const Hero = ({ booted }: { booted: boolean }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { text: name1, done: done1 } = useScramble('SRIRAM',        900,  booted);
  const { text: name2, done: done2 } = useScramble('RAVICHANDRAN', 1400,  booted);
  const role                          = useTypewriter('FULL-STACK & BACKEND ENGINEER', 52, 2400, booted);
  const glitch1                       = useGlitch('SRIRAM',        done1);
  const glitch2                       = useGlitch('RAVICHANDRAN', done2);
  const [showScan, setShowScan]       = useState(false);
  const [beamActive, setBeamActive]   = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  // Trigger scan ring once boot is done
  useEffect(() => {
    if (!booted) return;
    const t = setTimeout(() => setShowScan(true), 600);
    return () => clearTimeout(t);
  }, [booted]);

  // Periodic scan beam — starts after boot
  useEffect(() => {
    if (!booted) return;
    const fire = () => { setBeamActive(true); setTimeout(() => setBeamActive(false), 1700); };
    const first = setTimeout(fire, 5500);
    const id    = setInterval(fire, 9000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, [booted]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const nameY       = useTransform(scrollYProgress, [0, 1], [0,  -90]);
  const nameOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const hudY        = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const [mouseCoords, setMouseCoords] = useState({ lat: '41.8827', lon: '87.6233' });

  // Mouse parallax + dynamic coordinates
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const nx = (e.clientX - cx) / cx;
      const ny = (e.clientY - cy) / cy;
      setMouseOffset({ x: nx, y: ny });
      // Map mouse to coords near Chicago
      const lat = (41.8827 + ny * 0.08).toFixed(4);
      const lon = (87.6233 + nx * 0.12).toFixed(4);
      setMouseCoords({ lat, lon });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">

      {/* Periodic hero scan beam */}
      <AnimatePresence>
        {beamActive && (
          <motion.div
            key="hero-beam"
            className="absolute left-0 right-0 pointer-events-none z-10"
            style={{
              height: 2,
              background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.3) 20%, rgba(0,212,255,0.55) 50%, rgba(0,212,255,0.3) 80%, transparent 100%)',
            }}
            initial={{ top: '-2px', opacity: 0 }}
            animate={{ top: '100%', opacity: [0, 0.9, 0.9, 0] }}
            transition={{ duration: 1.65, ease: 'linear' }}
          />
        )}
      </AnimatePresence>

      {/* Radial scan ring — ctOS target lock */}
      {showScan && (
        <>
          <motion.div
            className="absolute rounded-full border pointer-events-none"
            style={{ borderColor: 'rgba(0,212,255,0.6)' }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: '140vmax', height: '140vmax', opacity: 0 }}
            transition={{ duration: 2.2, ease: [0.2, 0, 0.8, 1] }}
          />
          <motion.div
            className="absolute rounded-full border pointer-events-none"
            style={{ borderColor: 'rgba(0,212,255,0.35)' }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: '100vmax', height: '100vmax', opacity: 0 }}
            transition={{ duration: 2.8, ease: [0.2, 0, 0.8, 1], delay: 0.2 }}
          />
        </>
      )}

      {/* Top HUD bar */}
      <motion.div
        className="absolute top-20 left-0 right-0 px-6 flex items-center justify-between pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-[9px] tracking-[0.25em] text-[#00d4ff]/40 uppercase">
            NEURAL NETWORK ACTIVE
          </span>
          <span className="w-12 h-px bg-gradient-to-r from-[rgba(0,212,255,0.4)] to-transparent" />
        </div>
        <div className="flex items-center gap-3">
          <span className="w-12 h-px bg-gradient-to-l from-[rgba(0,212,255,0.4)] to-transparent" />
          <span className="font-mono text-[9px] tracking-[0.25em] text-[#00d4ff]/40 uppercase">
            SUBJECT LOCATED
          </span>
        </div>
      </motion.div>

      {/* Large HUD frame corners */}
      <motion.div
        className="absolute inset-6 md:inset-10 pointer-events-none hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        {(['tl','tr','bl','br'] as const).map(pos => (
          <motion.span
            key={pos}
            className="absolute"
            style={{
              width: 40, height: 40,
              top:    pos.includes('t') ? 0 : undefined,
              bottom: pos.includes('b') ? 0 : undefined,
              left:   pos.includes('l') ? 0 : undefined,
              right:  pos.includes('r') ? 0 : undefined,
              borderTop:    pos.includes('t') ? '1.5px solid rgba(0,212,255,0.25)' : undefined,
              borderBottom: pos.includes('b') ? '1.5px solid rgba(0,212,255,0.25)' : undefined,
              borderLeft:   pos.includes('l') ? '1.5px solid rgba(0,212,255,0.25)' : undefined,
              borderRight:  pos.includes('r') ? '1.5px solid rgba(0,212,255,0.25)' : undefined,
            }}
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{ width: 40, height: 40, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          />
        ))}
      </motion.div>

      {/* Rotating dashed rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '38vmax', height: '38vmax',
            border: '1.5px dashed rgba(0,212,255,0.20)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '52vmax', height: '52vmax',
            border: '1px dashed rgba(0,212,255,0.18)',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '66vmax', height: '66vmax',
            border: '1px dashed rgba(0,212,255,0.11)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto">

        {/* Identity label */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <span className="h-px w-10 bg-[rgba(0,212,255,0.4)]" />
          <span className="font-mono text-[10px] tracking-[0.28em] text-[#00d4ff]/60 uppercase">
            SUBJECT IDENTIFIED
          </span>
          <span className="h-px w-10 bg-[rgba(0,212,255,0.4)]" />
        </motion.div>

        {/* NAME — scramble reveal with mouse parallax + scroll parallax */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          style={{
            transform: `translate(${mouseOffset.x * 12}px, ${mouseOffset.y * 8}px)`,
            transition: 'transform 0.15s ease-out',
            y: nameY,
            opacity: nameOpacity,
          }}
        >
          <h1
            className="font-black uppercase leading-none tracking-tight select-none"
            style={{ fontSize: 'clamp(3.2rem, 11vw, 9rem)', letterSpacing: '-0.02em' }}
          >
            <span
              className="block font-mono"
              style={{
                color: isDark ? '#cce8f4' : '#0d2235',
                textShadow: isDark ? '0 0 40px rgba(0,212,255,0.18)' : 'none',
              }}
            >
              {done1 ? glitch1 : name1}
            </span>
            <span
              className="block font-mono"
              style={{
                color: isDark ? '#00d4ff' : '#0099c8',
                textShadow: isDark ? '0 0 30px rgba(0,212,255,0.55), 0 0 80px rgba(0,212,255,0.18)' : 'none',
              }}
            >
              {done2 ? glitch2 : name2}
            </span>
          </h1>
        </motion.div>

        {/* Role — typewriter */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="font-mono text-[9px] tracking-[0.25em] text-[#8ba9b8]/50">{'>'}</span>
          <span
            className="font-mono tracking-[0.18em] text-[#8ba9b8]"
            style={{ fontSize: 'clamp(0.78rem, 2vw, 1.05rem)' }}
          >
            {role}
            {role.length < 'FULL-STACK & BACKEND ENGINEER'.length && (
              <span className="inline-block w-[2px] h-[1em] bg-[#00d4ff] ml-0.5 animate-[wd-blink_1s_step-end_infinite] align-middle" />
            )}
          </span>
        </div>

        {/* Description */}
        <motion.p
          className="mt-6 text-[#8ba9b8]/65 max-w-lg mx-auto leading-relaxed"
          style={{ fontSize: 'clamp(0.82rem, 1.5vw, 1rem)' }}
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 3.2 }}
        >
          Building scalable systems · LLM-powered agents · Cloud-native applications
        </motion.p>

        {/* System status line */}
        <motion.div
          className="mt-5 flex items-center justify-center gap-4 flex-wrap"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 3.8 }}
        >
          <span className="font-mono text-[8px] tracking-[0.25em] text-[#8ba9b8]/25">SYS STATUS</span>
          {[
            { k: 'UPTIME', v: '99.9%' },
            { k: 'LATENCY', v: '2ms' },
            { k: 'BUILD', v: 'PASSING' },
          ].map(s => (
            <div key={s.k} className="flex items-center gap-1.5">
              <span className="font-mono text-[8px] tracking-[0.15em] text-[#8ba9b8]/25">{s.k}</span>
              <span className="font-mono text-[8px] tracking-[0.15em] text-[#00d4ff]/45">{s.v}</span>
            </div>
          ))}
        </motion.div>

        {/* Status tags */}
        <motion.div
          className="mt-8 flex items-center justify-center gap-4 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 3.6 }}
        >
          {['CHICAGO, IL', 'OPEN TO RELOCATION', 'M.S. CS — IIT'].map((tag, ti) => (
            <motion.div
              key={tag}
              className="relative px-3 py-1"
              style={{ border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.04)' }}
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 3.65 + ti * 0.1 }}
              whileHover={{ y: -3, scale: 1.04, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
            >
              <HUDCorners size={5} opacity={0.6} />
              <span className="font-mono text-[9px] tracking-[0.18em] text-[#00d4ff]/60">
                {tag}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom HUD — corner data */}
      <motion.div
        className="absolute bottom-24 left-6 pointer-events-none"
        style={{ y: hudY }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 4 }}
      >
        <p className="font-mono text-[9px] tracking-widest text-[#8ba9b8]/35" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {mouseCoords.lat}° N · {mouseCoords.lon}° W
        </p>
        <p className="font-mono text-[9px] tracking-widest text-[#8ba9b8]/20 mt-0.5">
          CHICAGO, ILLINOIS
        </p>
      </motion.div>

      <motion.div
        className="absolute bottom-24 right-6 text-right pointer-events-none"
        style={{ y: hudY }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 4 }}
      >
        <p className="font-mono text-[9px] tracking-widest text-[#4ade80]/50">
          ● AVAILABLE
        </p>
        <p className="font-mono text-[9px] tracking-widest text-[#8ba9b8]/20 mt-0.5">
          FOR HIRE
        </p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.5, duration: 0.8 }}
      >
        <span className="font-mono text-[9px] tracking-[0.28em] text-[#8ba9b8]/40 group-hover:text-[#00d4ff]/60 transition-colors uppercase">
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-3.5 h-3.5 text-[#00d4ff]/30 group-hover:text-[#00d4ff]/60 transition-colors" />
        </motion.div>
      </motion.a>
    </section>
  );
};

export default Hero;
