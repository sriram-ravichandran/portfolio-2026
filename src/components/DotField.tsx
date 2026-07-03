import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';

/**
 * Site-wide dot-grid in two layers, anchored to the document (not the
 * viewport): one continuous grid runs from the top of the page to the footer
 * and scrolls with the content. The base layer is whisper-faint and always
 * on; a brighter halo trails the pointer on a spring — the cursor
 * "illuminates" the grid it passes over. Rendered as an early child of
 * <main> so every section paints on top. The halo layer is fine-pointer
 * only; touch keeps just the static base.
 */
const DotField = () => {
  // Halo position in DOCUMENT coordinates, so it stays on the right spot of
  // the page while scrolling.
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  const visible = useMotionValue(0);
  const opacity = useSpring(visible, { stiffness: 120, damping: 22 });

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const client = { x: -1000, y: -1000 };
    const place = () => {
      x.set(client.x + window.scrollX);
      y.set(client.y + window.scrollY);
    };
    const move = (e: PointerEvent) => {
      client.x = e.clientX;
      client.y = e.clientY;
      place();
      visible.set(1);
    };
    const scroll = () => {
      if (client.x > -1000) place(); // keep the halo under the cursor while scrolling
    };
    const leave = () => visible.set(0);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', scroll);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, [x, y, visible]);

  const mask = useMotionTemplate`radial-gradient(280px circle at ${sx}px ${sy}px, black 0%, transparent 72%)`;

  return (
    <>
      {/* Base grid — one continuous field spanning the full page height */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(rgb(var(--ink-rgb) / 0.07) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />
      {/* Cursor halo — brightens the grid under the pointer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          opacity,
          backgroundImage: 'radial-gradient(rgb(var(--ink-rgb) / 0.28) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      />
    </>
  );
};

export default DotField;
