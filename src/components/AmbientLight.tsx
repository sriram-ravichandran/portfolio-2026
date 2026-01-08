import { motion, useSpring, useTransform } from 'framer-motion';
import { useMousePosition } from '@/hooks/useMousePosition';

const AmbientLight = () => {
  const { x, y } = useMousePosition();
  
  const springConfig = { damping: 25, stiffness: 100 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  return (
    <motion.div
      className="ambient-light"
      style={{
        left: xSpring,
        top: ySpring,
      }}
    />
  );
};

export default AmbientLight;
