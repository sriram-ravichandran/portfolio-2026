import { motion, useScroll, useSpring } from 'framer-motion';

/** Hairline scroll progress bar pinned to the top edge. */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left"
      style={{ scaleX, background: 'var(--accent)' }}
      aria-hidden="true"
    />
  );
};

export default ScrollProgress;
