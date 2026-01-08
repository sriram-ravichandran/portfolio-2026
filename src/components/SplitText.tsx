import { motion, Variants } from 'framer-motion';

interface SplitTextProps {
  text: string;
  className?: string;      // applied to EACH letter
  delay?: number;
}

const SplitText = ({ text, className = '', delay = 0 }: SplitTextProps) => {
  const letters = text.split('');

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: delay,
      },
    },
  };

  const child: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.span
      className="inline-flex flex-wrap"
      variants={container}
      initial="hidden"
      animate="visible"
      style={{ perspective: 1000 }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={child}
          className={`inline-block ${className}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default SplitText;
