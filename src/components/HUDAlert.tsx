import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ALERTS: Record<string, { code: string; title: string; lines: string[] }> = {
  about: {
    code:  'SYS-4401',
    title: 'PROFILE ACCESS GRANTED',
    lines: ['LOADING CLASSIFIED SUBJECT DATA', 'RECORD INTEGRITY · VERIFIED'],
  },
  projects: {
    code:  'SYS-4402',
    title: 'OPERATION FILES DECRYPTED',
    lines: ['ACTIVE DEPLOYMENTS · 4 FOUND', 'CLEARANCE LEVEL · MAXIMUM'],
  },
  contact: {
    code:  'SYS-4403',
    title: 'SECURE CHANNEL OPEN',
    lines: ['NEURAL UPLINK ESTABLISHED', 'TRANSMISSION READY · AWAITING INPUT'],
  },
};

type Alert = typeof ALERTS[string];

const Corners = () => (
  <>
    <span className="absolute top-0 left-0" style={{ width: 8, height: 8, borderTop: '1.5px solid rgba(0,212,255,0.7)', borderLeft: '1.5px solid rgba(0,212,255,0.7)' }} />
    <span className="absolute top-0 right-0" style={{ width: 8, height: 8, borderTop: '1.5px solid rgba(0,212,255,0.7)', borderRight: '1.5px solid rgba(0,212,255,0.7)' }} />
    <span className="absolute bottom-0 left-0" style={{ width: 8, height: 8, borderBottom: '1.5px solid rgba(0,212,255,0.7)', borderLeft: '1.5px solid rgba(0,212,255,0.7)' }} />
    <span className="absolute bottom-0 right-0" style={{ width: 8, height: 8, borderBottom: '1.5px solid rgba(0,212,255,0.7)', borderRight: '1.5px solid rgba(0,212,255,0.7)' }} />
  </>
);

const HUDAlert = () => {
  const [alert, setAlert] = useState<(Alert & { id: string }) | null>(null);
  const timer  = useRef<ReturnType<typeof setTimeout>>();
  const shown  = useRef(new Set<string>());

  const show = useCallback((section: string) => {
    const a = ALERTS[section];
    if (!a || shown.current.has(section)) return;
    shown.current.add(section);
    clearTimeout(timer.current);
    setAlert({ ...a, id: section });
    timer.current = setTimeout(() => setAlert(null), 3200);
  }, []);

  useEffect(() => {
    const observers = Object.keys(ALERTS).map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        entries => { entries.forEach(e => { if (e.isIntersecting) show(id); }); },
        { threshold: 0.18 }
      );
      obs.observe(el);
      return obs;
    });
    return () => {
      observers.forEach(o => o?.disconnect());
      clearTimeout(timer.current);
    };
  }, [show]);

  return (
    <AnimatePresence mode="wait">
      {alert && (
        <motion.div
          key={alert.id}
          className="fixed bottom-10 left-6 z-[120] pointer-events-none select-none"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div
            className="relative px-5 py-4 min-w-[230px]"
            style={{
              background: 'rgba(3,5,7,0.94)',
              border: '1px solid rgba(0,212,255,0.28)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <Corners />

            {/* Scan bar */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.5), transparent)', transformOrigin: 'left' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />

            {/* Header row */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
              <span className="font-mono text-[7px] tracking-[0.3em] text-[#00d4ff]/50">{alert.code}</span>
              <span className="h-px flex-1 bg-gradient-to-r from-[rgba(0,212,255,0.4)] to-transparent" />
            </div>

            {/* Title */}
            <p className="font-mono text-[10px] tracking-[0.18em] text-[#00d4ff] font-bold mb-2">
              {alert.title}
            </p>

            {/* Lines */}
            <div className="space-y-1">
              {alert.lines.map((line, i) => (
                <motion.p
                  key={i}
                  className="font-mono text-[8px] tracking-[0.15em] text-[#8ba9b8]/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.1 }}
                >
                  <span className="text-[#00d4ff]/40 mr-1.5">›</span>{line}
                </motion.p>
              ))}
            </div>

            {/* Progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-[1px]"
              style={{ background: 'rgba(0,212,255,0.35)' }}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3.0, ease: 'linear', delay: 0.2 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HUDAlert;
