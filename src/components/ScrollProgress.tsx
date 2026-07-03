import { motion, useScroll, useSpring } from 'framer-motion';

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[150]"
      style={{
        scaleX,
        background: 'linear-gradient(to right, rgba(0,212,255,0.4), #00d4ff)',
        boxShadow: '0 0 8px rgba(0,212,255,0.6), 0 0 20px rgba(0,212,255,0.2)',
      }}
    />
  );
};

export default ScrollProgress;
