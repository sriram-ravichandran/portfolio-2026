import { motion } from 'framer-motion';

interface TimelineItem {
  title: string;
  subtitle: string;
  date: string;
  description?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

const Timeline = ({ items }: TimelineProps) => {
  return (
    <div className="relative pl-6">
      <div className="timeline-line" />
      {items.map((item, index) => (
        <motion.div
          key={index}
          className="relative pb-8 last:pb-0"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="timeline-dot top-2" />
          <div className="ml-4">
            <span className="label">{item.date}</span>
            <h4 className="font-semibold mt-1">{item.title}</h4>
            <p className="text-sm text-muted-foreground">{item.subtitle}</p>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Timeline;
