import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Blend-difference cursor dot. Springs after the pointer, grows 4× over
 * interactive targets. Renders nothing on coarse-pointer devices.
 */
const Cursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 450, damping: 38, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 450, damping: 38, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!fine.matches) return;
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const target = e.target as Element | null;
      setHovering(!!target?.closest('a, button, [role="button"], [data-cursor="hover"]'));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[95] pointer-events-none rounded-full mix-blend-difference"
      style={{
        background: '#F2EFE8', // fixed ivory: difference-blend inverts correctly on both themes
        x: sx,
        y: sy,
        translateX: '-50%',
        translateY: '-50%',
        width: 12,
        height: 12,
      }}
      animate={{
        scale: visible ? (hovering ? 4 : 1) : 0,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      aria-hidden="true"
    />
  );
};

export default Cursor;
