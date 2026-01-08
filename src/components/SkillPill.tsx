import { motion } from 'framer-motion';

interface __SkillPillProps__ {
  skill: string;
  index: number;
}

const SkillPill = ({ skill, index }: __SkillPillProps__) => {
  return (
    <motion.span
      className="skill-pill text-sm font-medium"
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      whileInView={{ 
        opacity: 1, 
        scale: 1,
        y: 0
      }}
      transition={{
        delay: index * 0.03, // Slightly faster stagger
        duration: 0.4, // Smooth entry duration
        ease: [0.25, 0.46, 0.45, 0.94], // Custom ease for smoothness
      }}
      whileHover={{
        scale: 1.08,
        y: -2,
        transition: {
          duration: 0.2,
          ease: [0.34, 1.56, 0.64, 1], // Smooth bounce
        },
      }}
      whileTap={{
        scale: 0.98,
        transition: {
          duration: 0.1,
          ease: 'easeOut',
        },
      }}
      viewport={{ once: true, margin: "-50px" }}
    >
      {skill}
    </motion.span>
  );
};

export default SkillPill;