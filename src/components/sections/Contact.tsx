import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Linkedin, Github, MapPin, Phone, ArrowUpRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// ── Data ──────────────────────────────────────────────────────────────────────
const CHANNELS = [
  {
    icon: Mail,
    label: 'EMAIL',
    value: 'sriramravichandran02@gmail.com',
    cta: 'SEND A MESSAGE',
    href: 'mailto:sriramravichandran02@gmail.com',
    color: '#00d4ff',
    lightColor: '#0088bb',
    target: undefined as string | undefined,
  },
  {
    icon: Linkedin,
    label: 'LINKEDIN',
    value: '/in/sriram-ravichandran',
    cta: 'CONNECT WITH ME',
    href: 'https://linkedin.com/in/sriram-ravichandran',
    color: '#0a8ef0',
    lightColor: '#0a8ef0',
    target: '_blank' as string,
  },
  {
    icon: Github,
    label: 'GITHUB',
    value: '/sriram-ravichandran',
    cta: 'VIEW MY REPOSITORIES',
    href: 'https://github.com/sriram-ravichandran',
    color: '#cce8f4',
    lightColor: '#3a6a8a',
    target: '_blank' as string,
  },
];

const HEADLINE = ['LET\'S BUILD', 'SOMETHING', 'REMARKABLE.'];

// ── Background broadcast canvas ───────────────────────────────────────────────
const useBroadcast = (ref: React.RefObject<HTMLCanvasElement | null>) => {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    interface Ring { r: number; alpha: number; maxR: number; }
    const rings: Ring[] = [];
    let nextRing = 400;

    const dots = Array.from({ length: 35 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.6 + 0.7,
      phase: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.00018,
      vy: (Math.random() - 0.5) * 0.00018,
      active: 0,
    }));

    let animId: number;
    const t0 = performance.now();

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const elapsed = performance.now() - t0;
      const t = elapsed * 0.001;
      const W = canvas.width, H = canvas.height;
      const ox = W * 0.08, oy = H * 0.72;

      ctx.clearRect(0, 0, W, H);

      // Spawn rings
      if (elapsed > nextRing) {
        const maxR = Math.sqrt((W - ox) ** 2 + H ** 2) * 1.1;
        rings.push({ r: 0, alpha: 0.9, maxR });
        nextRing = elapsed + 2000 + Math.random() * 800;
      }

      // Rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const rng = rings[i];
        rng.r    += 2;
        rng.alpha = 0.9 * Math.max(0, 1 - rng.r / rng.maxR);
        if (rng.alpha < 0.008) { rings.splice(i, 1); continue; }

        ctx.beginPath(); ctx.arc(ox, oy, rng.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,212,255,${rng.alpha * 0.28})`;
        ctx.lineWidth = 1; ctx.stroke();

        if (rng.r > 40) {
          ctx.beginPath(); ctx.arc(ox, oy, rng.r * 0.82, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,212,255,${rng.alpha * 0.1})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }

        // Activate dots ring passes through
        dots.forEach(d => {
          const nx = d.x * W, ny = d.y * H;
          const dist = Math.abs(Math.sqrt((nx - ox) ** 2 + (ny - oy) ** 2) - rng.r);
          if (dist < 10) d.active = Math.min(1, d.active + 0.6);
        });
      }

      // Origin node (broadcast source)
      const srcGrd = ctx.createRadialGradient(ox, oy, 0, ox, oy, 22);
      srcGrd.addColorStop(0, 'rgba(0,212,255,0.35)');
      srcGrd.addColorStop(1, 'rgba(0,212,255,0)');
      ctx.fillStyle = srcGrd; ctx.beginPath(); ctx.arc(ox, oy, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#00d4ff'; ctx.beginPath(); ctx.arc(ox, oy, 4, 0, Math.PI * 2); ctx.fill();

      // Dots
      dots.forEach(d => {
        d.x = Math.max(0.01, Math.min(0.99, d.x + d.vx));
        d.y = Math.max(0.01, Math.min(0.99, d.y + d.vy));
        d.active *= 0.978;
        const nx = d.x * W, ny = d.y * H;
        const pulse = 0.4 + Math.sin(t * 1.4 + d.phase) * 0.35;
        const a = 0.1 + d.active * 0.6 * pulse;

        if (d.active > 0.05) {
          const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 14);
          g.addColorStop(0, `rgba(0,212,255,${d.active * 0.45})`);
          g.addColorStop(1, 'rgba(0,212,255,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, ny, 14, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = `rgba(0,212,255,${a})`;
        ctx.beginPath(); ctx.arc(nx, ny, d.r, 0, Math.PI * 2); ctx.fill();
      });

      // Edges between active dots
      for (let i = 0; i < dots.length; i++) {
        if (dots[i].active < 0.08) continue;
        for (let j = i + 1; j < dots.length; j++) {
          const dx = (dots[i].x - dots[j].x) * W;
          const dy = (dots[i].y - dots[j].y) * H;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 130 && dots[j].active > 0.05) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x * W, dots[i].y * H);
            ctx.lineTo(dots[j].x * W, dots[j].y * H);
            ctx.strokeStyle = `rgba(0,212,255,${Math.min(dots[i].active, dots[j].active) * 0.28 * (1 - d / 130)})`;
            ctx.lineWidth = 0.55; ctx.stroke();
          }
        }
      }
    };

    tick();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [ref]);
};

// ── Corners ───────────────────────────────────────────────────────────────────
const Corners = ({ size = 12, color = 'rgba(0,212,255,0.35)' }: { size?: number; color?: string }) => (
  <>
    {(['tl','tr','bl','br'] as const).map(p => (
      <span key={p} className="absolute pointer-events-none transition-all duration-300" style={{
        width: size, height: size,
        top: p.includes('t') ? 0 : undefined, bottom: p.includes('b') ? 0 : undefined,
        left: p.includes('l') ? 0 : undefined, right: p.includes('r') ? 0 : undefined,
        borderTop:    p.includes('t') ? `1.5px solid ${color}` : undefined,
        borderBottom: p.includes('b') ? `1.5px solid ${color}` : undefined,
        borderLeft:   p.includes('l') ? `1.5px solid ${color}` : undefined,
        borderRight:  p.includes('r') ? `1.5px solid ${color}` : undefined,
      }} />
    ))}
  </>
);

// ── Channel node component ────────────────────────────────────────────────────
const ChannelNode = ({
  ch, index, inView,
}: { ch: typeof CHANNELS[number]; index: number; inView: boolean }) => {
  const [hov, setHov] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const hc = isDark ? ch.color : ch.lightColor;

  return (
    <motion.a
      href={ch.href}
      target={ch.target}
      rel="noopener noreferrer"
      className="relative block p-5 group"
      style={{
        background: hov
          ? `${hc}09`
          : (isDark ? 'rgba(4,10,18,0.92)' : 'rgba(238,247,253,0.95)'),
        border: `1px solid ${hov ? hc + '55' : (isDark ? 'rgba(0,212,255,0.16)' : 'rgba(0,119,170,0.18)')}`,
        backdropFilter: 'blur(14px)',
        transition: 'all 0.28s ease',
        boxShadow: hov ? `0 0 35px ${hc}18, inset 0 0 35px ${hc}05` : 'none',
      }}
      initial={{ opacity: 0, x: 60, filter: 'blur(6px)' }}
      animate={inView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
      transition={{ type: 'spring', stiffness: 75, damping: 20, delay: 0.12 + index * 0.15 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <Corners size={hov ? 14 : 9} color={hov ? hc + '80' : 'rgba(0,212,255,0.3)'} />

      <div className="flex items-center gap-5">
        {/* Icon */}
        <div
          className="w-12 h-12 flex items-center justify-center shrink-0 transition-all duration-300"
          style={{
            border: `1px solid ${hov ? hc + '70' : 'rgba(0,212,255,0.22)'}`,
            background: hov ? `${hc}14` : 'rgba(0,212,255,0.04)',
            boxShadow: hov ? `0 0 22px ${hc}30` : 'none',
          }}
        >
          <ch.icon className="w-5 h-5 transition-colors duration-300" style={{ color: hov ? hc : '#8ba9b8' }} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[8px] tracking-[0.28em] text-[#8ba9b8]/38 mb-0.5">{ch.label}</p>
          <p
            className="font-mono text-[11px] tracking-[0.06em] transition-colors duration-300 truncate"
            style={{ color: hov ? hc : (isDark ? '#cce8f4' : '#0d2235') }}
          >
            {ch.value}
          </p>
          <p
            className="font-mono text-[9px] tracking-[0.2em] mt-1.5 transition-all duration-300"
            style={{ color: hov ? hc + 'cc' : 'rgba(139,169,184,0.35)', transform: hov ? 'translateX(4px)' : 'none' }}
          >
            {hov ? '▶ ' : '  '}{ch.cta}
          </p>
        </div>

        {/* Arrow */}
        <ArrowUpRight
          className="w-4 h-4 shrink-0 transition-all duration-300"
          style={{
            color: hov ? hc : 'rgba(139,169,184,0.25)',
            transform: hov ? 'translate(2px,-2px)' : 'none',
          }}
        />
      </div>

      {/* Scan line on hover */}
      {hov && (
        <motion.div
          className="absolute bottom-0 left-0 h-[1.5px]"
          style={{ background: `linear-gradient(to right, ${hc}aa, transparent)` }}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.35 }}
        />
      )}
    </motion.a>
  );
};

// ── Neural connector (animated packet between nodes) ──────────────────────────
const NeuralConnector = ({ delay }: { delay: number }) => (
  <div className="flex justify-center items-stretch" style={{ height: 44 }}>
    <div className="relative" style={{ width: 1, background: 'rgba(0,212,255,0.15)' }}>
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 8, height: 8,
          background: '#00d4ff',
          boxShadow: '0 0 14px rgba(0,212,255,0.9)',
          left: -3.5,
        }}
        animate={{ top: ['0%', '100%'], opacity: [0.9, 0.2, 0.9] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay }}
      />
    </div>
  </div>
);

// ── Main Contact component ────────────────────────────────────────────────────
const Contact = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  useBroadcast(canvasRef);

  const titleRef  = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true });
  const leftRef   = useRef<HTMLDivElement>(null);
  const leftInView  = useInView(leftRef,  { once: true, margin: '-60px' });
  const rightRef  = useRef<HTMLDivElement>(null);
  const rightInView = useInView(rightRef, { once: true, margin: '-60px' });

  return (
    <section id="contact" className="relative py-28 px-6 overflow-hidden">
      {/* Broadcast canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      <div className="max-w-7xl mx-auto relative" style={{ zIndex: 1 }}>

        {/* Header */}
        <div ref={titleRef} className="mb-14">
          <motion.div
            className="wd-badge mb-5 inline-flex"
            initial={{ opacity: 0, x: -40, filter: 'blur(6px)' }}
            animate={titleInView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
            ESTABLISH CONNECTION
          </motion.div>

        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* ── Left: CTA ─────────────────────────────────────────────────── */}
          <div ref={leftRef} className="lg:col-span-7 space-y-8">

            {/* Availability status */}
            <motion.div
              className="inline-flex items-center gap-3 px-4 py-2"
              style={{ border: '1px solid rgba(74,222,128,0.28)', background: 'rgba(74,222,128,0.05)' }}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={leftInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.05 }}
            >
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
              <span className="font-mono text-[9px] tracking-[0.22em] text-[#4ade80]/80">ACTIVELY SEEKING OPPORTUNITIES</span>
              <span className="font-mono text-[9px] tracking-[0.12em] text-[#4ade80]/40">· FULL-TIME · FREELANCE · AI</span>
            </motion.div>

            {/* Staggered headline */}
            <div className="space-y-1">
              {HEADLINE.map((word, i) => (
                <motion.span
                  key={word}
                  className="block font-black uppercase leading-none"
                  style={{
                    fontSize: 'clamp(2.8rem,8vw,6rem)',
                    letterSpacing: '-0.03em',
                    color: i === 2 ? (isDark ? '#00d4ff' : '#0099c8') : (isDark ? '#cce8f4' : '#0d2235'),
                    textShadow: i === 2 ? '0 0 60px rgba(0,212,255,0.5), 0 0 120px rgba(0,212,255,0.15)' : undefined,
                  }}
                  initial={{ opacity: 0, y: 80, filter: 'blur(14px)' }}
                  animate={leftInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                  transition={{ duration: 0.95, delay: 0.05 + i * 0.13, ease: [0.16, 1, 0.3, 1] }}
                >
                  {word}
                </motion.span>
              ))}
            </div>

            {/* Body */}
            <motion.p
              className="text-[#8ba9b8]/75 leading-relaxed max-w-lg"
              style={{ fontSize: '1.05rem' }}
              initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
              animate={leftInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.38 }}
            >
              Full-stack & backend engineer ready to architect scalable systems,
              ship LLM-powered AI agents, and build cloud-native applications
              that actually matter.
              <br />
              <span className="text-[#cce8f4]/80 font-medium">
                Open to full-time roles, freelance projects, and AI research collaborations.
              </span>
            </motion.p>

            {/* CTA button */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={leftInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.5 }}
            >
              <motion.a
                href="mailto:sriramravichandran02@gmail.com"
                className="group relative inline-flex items-center gap-4"
                style={{
                  padding: '1.25rem 2.8rem',
                  border: '1px solid rgba(0,212,255,0.55)',
                  background: 'rgba(0,212,255,0.06)',
                  fontFamily: '"Share Tech Mono",monospace',
                  fontSize: '0.82rem',
                  letterSpacing: '0.22em',
                  color: '#00d4ff',
                }}
                whileHover={{ scale: 1.02, background: 'rgba(0,212,255,0.1)' }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Broadcast rings */}
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="absolute inset-0 pointer-events-none"
                    style={{ border: '1px solid rgba(0,212,255,0.3)' }}
                    animate={{ scale: [1, 1.45, 1.45], opacity: [0.5, 0, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.72, ease: 'easeOut' }}
                  />
                ))}
                {/* Corner accents */}
                <Corners size={10} color="rgba(0,212,255,0.8)" />

                INITIATE CONTACT
                <ArrowUpRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.a>
            </motion.div>

            {/* Details */}
            <motion.div
              className="flex flex-wrap gap-6 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={leftInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.62 }}
            >
              {[
                { icon: MapPin, text: 'Chicago, IL — Open to Relocation' },
                { icon: Phone,  text: '+1 312 394 9647' },
              ].map(d => (
                <div key={d.text} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center shrink-0"
                    style={{ border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.04)' }}
                  >
                    <d.icon className="w-3.5 h-3.5 text-[#00d4ff]/55" />
                  </div>
                  <span className="text-sm" style={{ color: isDark ? 'rgba(204,232,244,0.7)' : '#2e5068' }}>{d.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: channel network ─────────────────────────────────────── */}
          <div ref={rightRef} className="lg:col-span-5">

            {/* Header */}
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0 }}
              animate={rightInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
            >
              <span className="font-mono text-[8px] tracking-[0.3em] text-[#8ba9b8]/35">DIRECT CHANNELS</span>
              <span className="h-px flex-1 bg-gradient-to-r from-[rgba(0,212,255,0.35)] to-transparent" />
              <span className="font-mono text-[8px] tracking-[0.2em] text-[#00d4ff]/40">
                {CHANNELS.length} NODES
              </span>
            </motion.div>

            {/* Channel nodes with connectors */}
            <div>
              {CHANNELS.map((ch, i) => (
                <div key={ch.label}>
                  <ChannelNode ch={ch} index={i} inView={rightInView} />
                  {i < CHANNELS.length - 1 && <NeuralConnector delay={i * 0.5} />}
                </div>
              ))}
            </div>

            {/* System status */}
            <motion.div
              className="mt-8 p-4 relative"
              style={{
                border: `1px solid ${isDark ? 'rgba(0,212,255,0.1)' : 'rgba(0,119,170,0.15)'}`,
                background: isDark ? 'rgba(0,212,255,0.03)' : 'rgba(232,245,252,0.92)',
              }}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={rightInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.55 }}
            >
              <p className="font-mono text-[7px] tracking-[0.28em] text-[#8ba9b8]/30 mb-3">SYSTEM STATUS</p>
              {[
                { k: 'RESPONSE TIME', v: '< 24 HOURS',   ok: true  },
                { k: 'AVAILABILITY',  v: 'OPEN',          ok: true  },
                { k: 'LOCATION',      v: 'CHICAGO, IL',   ok: true  },
                { k: 'CLEARANCE',     v: 'FULL-TIME HIRE', ok: true  },
              ].map(s => (
                <div key={s.k} className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[8px] tracking-[0.15em] text-[#8ba9b8]/40">{s.k}</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-[#4ade80] animate-pulse' : 'bg-[#ff3b3b]'}`} />
                    <span className="font-mono text-[8px] tracking-[0.12em]" style={{ color: s.ok ? '#4ade80' : '#ff3b3b' }}>
                      {s.v}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          className="mt-24 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(0,212,255,0.08)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="font-mono text-[9px] tracking-widest text-[#8ba9b8]/28">
            © {new Date().getFullYear()} SRIRAM RAVICHANDRAN · ALL RIGHTS RESERVED
          </p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] tracking-widest text-[#8ba9b8]/18">DESIGNED &amp; BUILT WITH</span>
            <span className="text-[#ff3b3b]/40 text-xs">♥</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Contact;
