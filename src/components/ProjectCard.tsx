import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface ProjectCardProps {
  title: string;
  description: string;
  tech: string[];
  index: number;
}

const ProjectCard = ({ title, description, tech, index }: ProjectCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-5deg', '5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className="project-card p-8 md:p-12"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        type: 'spring',
        stiffness: 100,
        damping: 20,
      }}
      viewport={{ once: true, margin: '-50px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div style={{ transform: 'translateZ(50px)' }}>
        <span className="label">Project {String(index + 1).padStart(2, '0')}</span>
        <h3 className="headline-md mt-4 mb-4">{title}</h3>
        <p className="body-md text-muted-foreground mb-6 max-w-2xl">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tech.map((t, i) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectCard;
