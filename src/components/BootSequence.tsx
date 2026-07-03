import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CHECKS = [
  { label: 'NEURAL NETWORK',    status: 'ACTIVE',   delay: 800  },
  { label: 'SECURITY PROTOCOL', status: 'VERIFIED',  delay: 1100 },
  { label: 'DATABASE ACCESS',   status: 'GRANTED',   delay: 1400 },
  { label: 'SYSTEM INTEGRITY',  status: 'OPTIMAL',   delay: 1700 },
];

const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress]       = useState(0);
  const [visibleChecks, setVisibleChecks] = useState(0);
  const [showAccess, setShowAccess]   = useState(false);
  const [flash, setFlash]             = useState(false);
  const [exiting, setExiting]         = useState(false);
  const [done, setDone]               = useState(false);

  const skip =
    typeof window !== 'undefined' &&
    sessionStorage.getItem('ctos-booted') === '1';

  useEffect(() => {
    if (skip) { setDone(true); onComplete(); return; }

    // Progress 0→100 over ~1400ms starting at 500ms
    let progId: ReturnType<typeof setInterval>;
    const t0 = setTimeout(() => {
      progId = setInterval(() => {
        setProgress(p => { if (p >= 100) { clearInterval(progId); return 100; } return Math.min(p + 2, 100); });
      }, 26);
    }, 500);

    const ct = CHECKS.map((_, i) => setTimeout(() => setVisibleChecks(i + 1), CHECKS[i].delay));
    const t1 = setTimeout(() => setShowAccess(true),  2300);
    const t2 = setTimeout(() => { setFlash(true); setTimeout(() => setFlash(false), 70); }, 2700);
    const t3 = setTimeout(() => setExiting(true), 2900);
    const t4 = setTimeout(() => { setDone(true); sessionStorage.setItem('ctos-booted', '1'); onComplete(); }, 3400);

    return () => { clearTimeout(t0); clearInterval(progId); ct.forEach(clearTimeout); [t1,t2,t3,t4].forEach(clearTimeout); };
  }, [onComplete, skip]);

  if (done) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="boot"
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
        style={{ background: '#030507' }}
        animate={exiting ? { y: '-100%' } : {}}
        transition={exiting ? { duration: 0.5, ease: [0.76, 0, 0.24, 1] } : {}}
      >
        {flash && <div className="absolute inset-0 bg-white/10 z-10 pointer-events-none" />}

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.4 }}
          className="mb-2"
        >
          <span
            className="font-mono text-2xl tracking-[0.35em] text-[#00d4ff] select-none"
            style={{ textShadow: '0 0 25px rgba(0,212,255,0.6), 0 0 55px rgba(0,212,255,0.2)' }}
          >
            [CTROS]
          </span>
        </motion.div>

        <motion.p
          className="font-mono text-[9px] tracking-[0.3em] text-[#8ba9b8]/35 mb-10 select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        >
          INITIALIZING NEURAL INTERFACE v2.4.1
        </motion.p>

        {/* Progress */}
        <div className="w-72 mb-8">
          <div className="h-[2px] w-full bg-[rgba(0,212,255,0.07)] overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(to right, rgba(0,212,255,0.25), #00d4ff)',
                boxShadow: '0 0 8px rgba(0,212,255,0.5)',
                transition: 'width 26ms linear',
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="font-mono text-[8px] tracking-[0.2em] text-[#8ba9b8]/25 select-none">LOADING</span>
            <span className="font-mono text-[8px] tracking-[0.15em] text-[#00d4ff]/45 select-none">{progress}%</span>
          </div>
        </div>

        {/* System checks */}
        <div className="w-72 space-y-2.5">
          {CHECKS.map((check, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between select-none"
              initial={{ opacity: 0, x: -8 }}
              animate={visibleChecks > i ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.22 }}
            >
              <span className="font-mono text-[9px] tracking-[0.08em] text-[#8ba9b8]/40 flex items-center gap-2">
                <span className="text-[#4ade80]">✓</span>
                {check.label}
                <span className="text-[#8ba9b8]/15">{'·'.repeat(Math.max(0, 18 - check.label.length))}</span>
              </span>
              <span className="font-mono text-[9px] tracking-[0.12em] text-[#4ade80]/60">{check.status}</span>
            </motion.div>
          ))}
        </div>

        {/* ACCESS GRANTED */}
        <AnimatePresence>
          {showAccess && !exiting && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                className="font-mono text-3xl sm:text-4xl tracking-[0.5em] text-[#4ade80] font-bold select-none"
                style={{ textShadow: '0 0 40px rgba(74,222,128,0.7), 0 0 80px rgba(74,222,128,0.25)' }}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                ACCESS GRANTED
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default BootSequence;
