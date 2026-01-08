import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Briefcase,
  GraduationCap,
  Code2,
  Trophy,
  Download,
  Sparkles,
} from 'lucide-react';
import MagneticReveal from '@/components/MagneticReveal';
import Timeline from '@/components/Timeline';
import SkillPill from '@/components/SkillPill';
import { cn } from '@/lib/utils'; 

// --- DATA ---
const education = [
  {
    title: 'M.S. Computer Science',
    subtitle: 'Illinois Institute of Technology',
    date: '2024 - 2026',
    description: 'GPA: 3.44',
  },
  {
    title: 'B.E. Computer Science',
    subtitle: 'Sri Eshwar College of Engineering',
    date: '2019 - 2023',
    description: 'GPA: 3.66',
  },
];

const experience = [
  {
    title: 'AI Agent Developer Intern',
    subtitle: 'NeuralSeek • Miami, United States',
    date: 'Oct 2025 – Nov 2025',
    description:
      'Built a RAG-powered AI agent with automated data lineage to ensure verifiable citations and reduce hallucinations. Improved LLM response quality using prompt engineering and ethical guardrails while meeting security and scalability requirements.',
  },
  {
    title: 'Member Technical Staff',
    subtitle: 'Zoho Corporation • Chennai, India',
    date: 'Jun 2023 – Jul 2023',
    description:
      'Resolved high-priority production issues affecting 10,000+ Apple devices and collaborated with frontend teams to ensure seamless REST API integration and troubleshooting.',
  },
  {
    title: 'Project Trainee',
    subtitle: 'Zoho Corporation • Chennai, India',
    date: 'Aug 2022 – May 2023',
    description:
      'Identified and fixed security loopholes in the MDM system that enabled policy bypass, reducing violations by 10%. Authored product documentation and gained hands-on experience in debugging and feature-level development.',
  },
  {
    title: 'Summer Intern',
    subtitle: 'Zoho Corporation • Chennai, India',
    date: 'May 2022 – Jun 2022',
    description:
      'Developed backend fundamentals through hands-on work with production systems, participating in code reviews and mentorship sessions to improve code quality and engineering best practices.',
  },
];

const skills = [
  'Python', 'C++', 'Java', 'JavaScript', 'TypeScript', 
  'React', 'Node.js', 'Jersey', 'Docker', 'Kubernetes', 
  'Kafka', 'PostgreSQL', 'MongoDB', 'LangGraph', 'AutoGen',
  'AWS', 'Git', 'ElasticSearch', 'Linux'
];

// --- SPOTLIGHT CARD ---
const SpotlightCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        'relative w-full overflow-hidden rounded-3xl border transition-colors',
        'border-[rgba(119,119,119,0.2)] bg-[rgba(255,255,255,0.15)] backdrop-blur-sm hover:border-[rgba(217,179,38,0.35)]',
        'dark:border-white/10 dark:bg-white/5 dark:hover:border-[rgba(217,179,38,0.35)]',
        '[--spotlight-color:rgba(0,0,0,0.05)] dark:[--spotlight-color:rgba(255,255,255,0.06)]',
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, var(--spotlight-color), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// --- COUNTER ---
const ExperienceCounter = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const target = 1.5;
    const duration = 1000;
    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Number((progress * target).toFixed(1)));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView]);

  return (
    <div ref={ref}>
      <div className="text-4xl font-semibold text-foreground">~{value}</div>
      <div className="mt-1 text-sm text-muted-foreground uppercase tracking-wider">
        years industry experience
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const About = () => {
  return (
    <section id="about" className="relative py-32 px-6 overflow-hidden text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* SECTION HEADER (RESTORED) */}
        <MagneticReveal className="mb-24 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 backdrop-blur-sm mb-6 dark:border-white/10 dark:bg-white/5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              About Me
            </span>
          </div>

          <h2 className="headline-lg mt-2 text-foreground">
            CRAFTING DIGITAL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/40">
              EXPERIENCES.
            </span>
          </h2>
        </MagneticReveal>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <MagneticReveal>
              <SpotlightCard className="p-8">
                <div className="flex items-center gap-3 mb-6 text-muted-foreground">
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-sm font-medium uppercase tracking-widest">Education</span>
                </div>
                <Timeline items={education} />
              </SpotlightCard>
            </MagneticReveal>

            <MagneticReveal>
  <SpotlightCard className="p-8 min-h-[340px] flex flex-col justify-center">
    <div className="flex items-center gap-3 mb-10 text-muted-foreground">
      <Sparkles className="w-5 h-5" />
      <span className="text-sm font-medium uppercase tracking-widest">
        Highlights
      </span>
    </div>

    <div className="space-y-10">
      <ExperienceCounter />

      <p className="text-muted-foreground leading-relaxed max-w-sm">
        Debugged and fixed issues directly in production environments
      </p>
    </div>
  </SpotlightCard>
</MagneticReveal>

          </div>

          {/* EXPERIENCE */}
          <MagneticReveal className="md:row-span-2 lg:col-span-8">
  <SpotlightCard className="p-8">
    <div className="flex items-center gap-3 mb-6 text-muted-foreground">
      <Briefcase className="w-5 h-5" />
      <span className="text-sm font-medium uppercase tracking-widest">
        Experience
      </span>
    </div>
    <Timeline items={experience} />
  </SpotlightCard>
</MagneticReveal>

          {/* SKILLS */}
          <MagneticReveal className="lg:col-span-8">
            <SpotlightCard className="p-8">
              <div className="flex items-center gap-3 mb-6 text-muted-foreground">
                <Code2 className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-widest">Technical Arsenal</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill, index) => (
                  <SkillPill key={skill} skill={skill} index={index} />
                ))}
              </div>
            </SpotlightCard>
          </MagneticReveal>

          {/* ACHIEVEMENTS */}
          <MagneticReveal className="lg:col-span-4">
            <SpotlightCard className="p-8">
              <div className="flex items-center gap-3 mb-6 text-muted-foreground">
                <Trophy className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-widest">Achievements</span>
              </div>
              <ul className="space-y-6">
                <li>
                  <p className="font-medium text-lg text-foreground">Interizon Hackathon</p>
                  <p className="text-sm text-muted-foreground">2021 • Winner</p>
                </li>
                <li>
                  <p className="font-medium text-lg text-foreground">Freshathon Expo</p>
                  <p className="text-sm text-muted-foreground">2024 • Jury Panel</p>
                </li>
              </ul>
            </SpotlightCard>
          </MagneticReveal>
        </div>

        {/* BIO SECTION (RESTORED) */}
        <div className="mt-20 grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-xl md:text-2xl leading-relaxed text-muted-foreground font-light">
  I'm a <span className="text-foreground font-medium">Full-Stack Developer</span> specializing in scalable systems, distributed architectures, and cloud-native applications.
</p>
<p className="mt-6 text-lg leading-relaxed text-muted-foreground/80">
  Currently pursuing my Master's in Computer Science at Illinois Institute of Technology, I bring hands-on experience from Zoho Corporation and NeuralSeek - Engineering everything from secure MDM infrastructures to RAG-powered AI agents.
</p>
          </motion.div>

          <motion.div
            className="flex items-center justify-start lg:justify-end"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <MagneticReveal>
              <a 
                href="https://drive.google.com/file/d/183Lp_e2Jk8mGbcJFjZW5YBUiszMMx3XR/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-8 py-4 bg-foreground text-background rounded-full font-semibold flex items-center gap-3 hover:bg-foreground/90 transition-all shadow-lg hover:shadow-xl"
              >
                Download Resume
                <Download className="w-4 h-4 transition-transform group-hover:translate-y-1" />
              </a>
            </MagneticReveal>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default About;
