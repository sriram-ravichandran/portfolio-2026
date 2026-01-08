import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface MagneticRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const MagneticReveal = ({ children, className = '', delay = 0 }: MagneticRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};

export default MagneticReveal;
