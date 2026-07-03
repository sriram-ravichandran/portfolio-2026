import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_OUT, EASE_IO } from '@/lib/anim';
import ThemeToggle from '@/components/ThemeToggle';

const NAV_ITEMS = [
  { label: 'About',    href: '#about',    idx: '01' },
  { label: 'Projects', href: '#projects', idx: '02' },
  { label: 'Contact',  href: '#contact',  idx: '03' },
];

const useChicagoTime = () => {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

const Navbar = ({ booted }: { booted: boolean }) => {
  const [open, setOpen]         = useState(false);
  const [hidden, setHidden]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive]     = useState('');
  const lastY = useRef(0);
  const time = useChicagoTime();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 140 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-40% 0px -55% 0px' }
    );
    ['about', 'projects', 'contact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4"
        initial={{ y: -80, opacity: 0 }}
        animate={{
          y: booted ? (hidden && !open ? -110 : 0) : -80,
          opacity: booted ? 1 : 0,
        }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
        <nav
          className={`flex items-center justify-between w-full text-ink rounded-full transition-all duration-500 ${
            scrolled
              ? 'max-w-[54rem] mt-3 md:mt-4 px-5 md:px-7 py-2.5 border border-line bg-surface/85 backdrop-blur-xl shadow-[0_14px_44px_-10px_rgb(var(--signal-rgb)/0.25),0_10px_36px_-16px_rgb(0_0_0/0.28)]'
              : 'max-w-[100rem] mt-0 px-2 md:px-8 py-4 border border-transparent'
          }`}
        >
          {/* Wordmark */}
          <a href="#" className="group" aria-label="Back to top">
            <span className="display text-[17px] tracking-tight transition-colors duration-300 group-hover:text-signal">
              SR
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-9">
            {NAV_ITEMS.map(item => {
              const isActive = active === item.href.slice(1);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="link-sweep flex items-baseline gap-1.5 text-[13px] font-medium tracking-wide uppercase"
                  style={{ opacity: isActive ? 1 : 0.65, transition: 'opacity 0.3s' }}
                >
                  <sup className="font-mono text-[9px] text-signal">{item.idx}</sup>
                  {item.label}
                </a>
              );
            })}
            <ThemeToggle />
          </div>

          {/* Mobile: toggle + menu */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle className="!w-9 !h-9" />
            <button
              onClick={() => setOpen(true)}
              className="label-mono !text-ink py-2 px-1"
              aria-label="Open menu"
            >
              Menu
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Fullscreen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            className="fixed inset-0 z-[80] flex flex-col md:hidden bg-canvas"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.7, ease: EASE_IO }}
          >
            <div className="flex items-center justify-between px-6 py-5 hairline-b">
              <span className="label-mono">Navigation</span>
              <button
                onClick={() => setOpen(false)}
                className="label-mono !text-ink py-2 px-1"
                aria-label="Close menu"
              >
                Close
              </button>
            </div>

            <nav className="flex-1 flex flex-col justify-center px-6 gap-2">
              {NAV_ITEMS.map((item, i) => (
                <div key={item.href} className="overflow-hidden">
                  <motion.a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-baseline gap-4 py-3"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '110%' }}
                    transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.25 + i * 0.08 }}
                  >
                    <span className="font-mono text-xs text-signal">{item.idx}</span>
                    <span className="display text-ink whitespace-nowrap" style={{ fontSize: 'min(7.8vw, 4.5rem)' }}>
                      {item.label}
                    </span>
                  </motion.a>
                </div>
              ))}
            </nav>

            <motion.div
              className="px-6 py-6 hairline-t flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="label-mono">Chicago, IL</span>
              <span className="label-mono tabular-nums">{time}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

export default Navbar;
