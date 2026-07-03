import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const NAV_ITEMS = [
  { label: 'ABOUT',    href: '#about',    idx: '01' },
  { label: 'PROJECTS', href: '#projects', idx: '02' },
  { label: 'CONTACT',  href: '#contact',  idx: '03' },
];

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden]     = useState(false);
  const [active, setActive]     = useState('');
  const [time, setTime]         = useState('');
  const lastScrollY = useRef(0);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      setHidden(y > 120 && y > lastScrollY.current);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = ['about', 'projects', 'contact'];
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }); },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/*
        Outer wrapper: always full-width fixed, handles hide-on-scroll via CSS.
        pointer-events-none so the transparent gutters (when shrunk) are click-through.
      */}
      <div
        className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none"
        style={{
          paddingTop: scrolled ? 14 : 0,
          transform: hidden ? 'translateY(-130%)' : 'translateY(0)',
          transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), padding-top 0.55s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* motion.nav springs between 100% ↔ 55% width */}
        <motion.nav
          className="pointer-events-auto w-full overflow-hidden"
          initial={{ opacity: 0, y: -36, width: '100%' }}
          animate={{ opacity: 1, y: 0, width: scrolled ? '55%' : '100%' }}
          transition={{
            opacity: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
            y:       { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
            width:   { type: 'spring', stiffness: 160, damping: 26, restDelta: 0.5 },
          }}
          style={{
            borderRadius: scrolled ? 12 : 0,
            boxShadow: scrolled
              ? isDark
                ? '0 0 0 1px rgba(0,212,255,0.35), 0 0 40px rgba(0,212,255,0.14)'
                : '0 4px 28px rgba(0,80,130,0.18), 0 0 0 1px rgba(0,119,170,0.3)'
              : 'none',
            transition: 'border-radius 0.55s cubic-bezier(0.4,0,0.2,1), box-shadow 0.55s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Top accent line */}
          <div
            className="h-px"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.5) 25%, rgba(0,212,255,0.9) 50%, rgba(0,212,255,0.5) 75%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, rgba(0,119,170,0.5) 25%, rgba(0,119,170,0.9) 50%, rgba(0,119,170,0.5) 75%, transparent 100%)',
              transition: 'background 0.4s ease',
            }}
          />

          <div
            className="flex items-stretch"
            style={{
              background: isDark
                ? (scrolled ? 'rgba(2,4,9,0.98)' : 'rgba(2,4,9,0.85)')
                : (scrolled ? 'rgba(228,236,246,0.98)' : 'rgba(228,236,246,0.90)'),
              borderBottom: `1px solid ${isDark ? 'rgba(0,212,255,0.13)' : 'rgba(0,119,170,0.18)'}`,
              backdropFilter: 'blur(24px)',
              height: 54,
              transition: 'background 0.4s ease, border-color 0.4s ease',
            }}
          >

            {/* ── LEFT: Logo ── */}
            <div className="flex items-center shrink-0" style={{ borderRight: '1px solid rgba(0,212,255,0.1)' }}>
              <a href="#" className="relative flex items-center gap-3 px-5 h-full">
                <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 pointer-events-none"
                  style={{ borderTop: '1.5px solid rgba(0,212,255,0.65)', borderLeft: '1.5px solid rgba(0,212,255,0.65)' }} />
                <span className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 pointer-events-none"
                  style={{ borderBottom: '1.5px solid rgba(0,212,255,0.65)', borderRight: '1.5px solid rgba(0,212,255,0.65)' }} />

                <motion.span
                  className="w-2 h-2 rounded-full bg-[#00d4ff] shrink-0"
                  style={{ boxShadow: '0 0 8px rgba(0,212,255,0.8)' }}
                  animate={{ opacity: [1, 0.35, 1], scale: [1, 0.75, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="flex flex-col leading-none gap-0.5">
                  <span className="font-mono text-[12px] font-bold tracking-[0.22em] text-[#00d4ff]"
                    style={{ textShadow: '0 0 14px rgba(0,212,255,0.65)' }}>
                    CTROS
                  </span>
                  <span className="font-mono text-[7px] tracking-[0.18em] text-[#8ba9b8]/35">v2.4.1</span>
                </div>
              </a>

              {/* System data — fades out when shrunk */}
              <AnimatePresence>
                {!scrolled && (
                  <motion.div
                    key="sysdata"
                    className="hidden lg:flex items-center gap-4 px-5 h-full"
                    style={{ borderLeft: '1px solid rgba(0,212,255,0.08)' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[7px] tracking-[0.2em] text-[#8ba9b8]/28">SYS</span>
                      <span className="font-mono text-[9px] tracking-[0.14em] text-[#00d4ff]/55"
                        style={{ fontVariantNumeric: 'tabular-nums' }}>{time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[7px] tracking-[0.15em] text-[#8ba9b8]/22">ID</span>
                      <span className="font-mono text-[8px] tracking-[0.08em] text-[#a855f7]/45">A3F7·2B4C</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── CENTER: Nav links ── */}
            <div className="hidden md:flex items-center flex-1 justify-center gap-0">
              {NAV_ITEMS.map(item => {
                const isActive = active === item.href.slice(1);
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="relative group flex items-center gap-2.5 px-5 h-full transition-colors duration-200"
                    style={{
                      background: isActive ? 'rgba(0,212,255,0.07)' : 'transparent',
                      borderRight: '1px solid rgba(0,212,255,0.07)',
                    }}
                  >
                    {/* Animated active pip */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pip"
                        className="absolute left-0 top-1/4 bottom-1/4 w-[2px] rounded-full"
                        style={{ background: '#00d4ff', boxShadow: '0 0 8px rgba(0,212,255,0.9)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    <span className="font-mono text-[8px] tracking-widest transition-colors duration-200"
                      style={{ color: isActive ? 'rgba(0,212,255,0.55)' : 'rgba(139,169,184,0.28)' }}>
                      {item.idx}
                    </span>
                    <span className="font-mono text-[9px] text-[#8ba9b8]/14">/</span>
                    <span className="font-mono text-[10px] tracking-[0.22em] font-medium transition-all duration-200"
                      style={{ color: isActive ? '#00d4ff' : '#8ba9b8', textShadow: isActive ? '0 0 14px rgba(0,212,255,0.55)' : 'none' }}>
                      {item.label}
                    </span>

                    {/* Hover corner accents */}
                    <span className="absolute top-2 left-2 w-2 h-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ borderTop: '1px solid rgba(0,212,255,0.55)', borderLeft: '1px solid rgba(0,212,255,0.55)' }} />
                    <span className="absolute bottom-2 right-2 w-2 h-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ borderBottom: '1px solid rgba(0,212,255,0.55)', borderRight: '1px solid rgba(0,212,255,0.55)' }} />
                    <span className="absolute bottom-0 left-0 right-0 h-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)' }} />
                  </a>
                );
              })}
            </div>

            {/* Mobile toggle */}
            <div className="md:hidden flex items-center px-4"
              style={{ borderLeft: '1px solid rgba(0,212,255,0.1)' }}>
              <button
                onClick={() => setOpen(true)}
                className="relative w-9 h-9 flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(0,212,255,0.08)]"
                style={{ border: '1px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.04)' }}
              >
                <span className="absolute top-0.5 left-0.5 w-2 h-2 pointer-events-none"
                  style={{ borderTop: '1px solid rgba(0,212,255,0.7)', borderLeft: '1px solid rgba(0,212,255,0.7)' }} />
                <span className="absolute bottom-0.5 right-0.5 w-2 h-2 pointer-events-none"
                  style={{ borderBottom: '1px solid rgba(0,212,255,0.7)', borderRight: '1px solid rgba(0,212,255,0.7)' }} />
                <Menu className="w-4 h-4 text-[#00d4ff]" />
              </button>
            </div>

          </div>

          {/* Bottom glow line */}
          <div className="h-px"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.18) 30%, rgba(0,212,255,0.3) 50%, rgba(0,212,255,0.18) 70%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, rgba(0,119,170,0.18) 30%, rgba(0,119,170,0.3) 50%, rgba(0,119,170,0.18) 70%, transparent 100%)',
              transition: 'background 0.4s ease',
            }} />
        </motion.nav>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm md:hidden"
            />
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed right-0 top-0 bottom-0 w-[82%] max-w-xs z-[70] md:hidden flex flex-col"
              style={{ background: 'rgba(2,4,9,0.99)', borderLeft: '1px solid rgba(0,212,255,0.18)' }}
            >
              <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.7))' }} />

              <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
                <div className="flex items-center gap-3">
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  <span className="font-mono text-[9px] tracking-[0.28em] text-[#00d4ff]/75">NAV // MENU</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="relative w-8 h-8 flex items-center justify-center hover:bg-[rgba(0,212,255,0.08)] transition-colors duration-200"
                  style={{ border: '1px solid rgba(0,212,255,0.25)' }}
                >
                  <X className="w-3.5 h-3.5 text-[#8ba9b8]" />
                </button>
              </div>

              <nav className="flex flex-col mt-4 px-4 gap-1">
                {NAV_ITEMS.map((item, i) => {
                  const isActive = active === item.href.slice(1);
                  return (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      initial={{ opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.07 + i * 0.08, type: 'spring', stiffness: 250, damping: 22 }}
                      className="relative flex items-center gap-4 px-4 py-4 transition-all duration-200"
                      style={{
                        borderBottom: '1px solid rgba(0,212,255,0.07)',
                        background: isActive ? 'rgba(0,212,255,0.06)' : 'transparent',
                      }}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/4 bottom-1/4 w-[2px] rounded-full bg-[#00d4ff]"
                          style={{ boxShadow: '0 0 6px rgba(0,212,255,0.8)' }} />
                      )}
                      <span className="font-mono text-[9px] tracking-widest"
                        style={{ color: isActive ? 'rgba(0,212,255,0.6)' : 'rgba(139,169,184,0.3)' }}>{item.idx}</span>
                      <span className="font-mono text-[9px] text-[#8ba9b8]/15">/</span>
                      <span className="font-mono text-xl font-bold tracking-[0.1em] transition-colors duration-200"
                        style={{ color: isActive ? '#00d4ff' : '#cce8f4' }}>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto font-mono text-[7px] tracking-[0.2em] text-[#00d4ff]/45">◈ ACTIVE</span>
                      )}
                    </motion.a>
                  );
                })}
              </nav>

              <div className="mt-auto px-5 py-5" style={{ borderTop: '1px solid rgba(0,212,255,0.08)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"
                      animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    <span className="font-mono text-[8px] tracking-[0.18em] text-[#4ade80]/55">NEURAL LINK ACTIVE</span>
                  </div>
                  <span className="font-mono text-[8px] tracking-widest text-[#8ba9b8]/22"
                    style={{ fontVariantNumeric: 'tabular-nums' }}>{time}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
