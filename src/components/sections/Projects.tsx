import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import MagneticReveal from '@/components/MagneticReveal';
import { cn } from '@/lib/utils';

// --- DATA ---
const projects = [
  {
    title: 'SmartHomes',
    description: 'A scalable e-commerce platform with intelligent search and AI-powered shopping assistance. Features real-time support via OpenAI, ElasticSearch integration, and containerized deployment.',
    tech: ['React', 'Servlets', 'MySQL', 'MongoDB', 'ElasticSearch', 'Docker', 'OpenAI'],
    links: { demo: '#', repo: '#' }
  },
  {
    title: 'Voice Assistant',
    description: 'A Python desktop application that processes natural language commands to execute system operations, fetch real-time web results, and automate routine tasks through voice interaction.',
    tech: ['Python', 'NLP', 'APIs', 'Voice Recognition'],
    links: { demo: '#', repo: '#' }
  },
  {
    title: 'Connect',
    description: 'Full-stack social media application featuring posts, likes, real-time chat, and group functionality. Designed for seamless user interaction with modern web technologies.',
    tech: ['React.js', 'Express.js', 'MySQL', 'WebSockets'],
    links: { demo: '#', repo: '#' }
  },
];

// --- INTERNAL COMPONENT: SPOTLIGHT CARD ---
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setOpacity(1);
  };

  const handleBlur = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleFocus}
      onMouseLeave={handleBlur}
      className={cn(
        // Base styles
        "relative h-full w-full overflow-hidden rounded-3xl border p-8 transition-colors group",
        // Light Mode: Semi-transparent white with backdrop blur (frosted glass)
        "border-[rgba(119,119,119,0.2)] bg-[rgba(255,255,255,0.15)] backdrop-blur-sm hover:border-[rgba(217,179,38,0.35)]",
        // Dark Mode: White/10 border, white/5 bg, white spotlight
        "dark:border-white/10 dark:bg-white/5 dark:hover:border-[rgba(217,179,38,0.35)]",
        // CSS Variable for spotlight color (Light = black/5%, Dark = white/6%)
        "[--spotlight-color:rgba(0,0,0,0.05)] dark:[--spotlight-color:rgba(255,255,255,0.06)]",
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

// --- MAIN COMPONENT ---
const Projects = () => {
  return (
    <section id="projects" className="relative py-32 px-6 overflow-hidden text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <MagneticReveal className="mb-24 text-center md:text-left">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 backdrop-blur-sm mb-6 dark:border-white/10 dark:bg-white/5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Selected Work</span>
          </div>

          <h2 className="headline-lg mt-2 uppercase leading-[0.85] tracking-tighter text-foreground">
            Project <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/40">
              Archive.
            </span>
          </h2>
        </MagneticReveal>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <MagneticReveal key={project.title} delay={index * 0.1} className="h-full">
              <SpotlightCard>
                
                {/* TOP SECTION (Icon, Title, Desc) 
                  h-[17rem]: Tightened height. 
                  Fits "SmartHomes" perfectly while keeping all borders aligned.
                */}
                <div className="flex flex-col h-[17rem]">
                  {/* Icon Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-full bg-secondary/50 border border-border text-muted-foreground group-hover:text-foreground group-hover:border-foreground/20 transition-colors dark:bg-white/5 dark:border-white/10 dark:group-hover:text-white dark:group-hover:border-white/20">
                      <Layers className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-2xl font-semibold mb-3 text-foreground transition-colors duration-300">
                      {project.title}
                    </h3>
                    {/* Removed mb-6 so text sits closer to the line below */}
                    <p className="text-muted-foreground/80 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* BOTTOM SECTION (Tech Stack)
                   Sits immediately below the top section border.
                */}
                <div className="pt-6 border-t border-border dark:border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span 
                        key={tech} 
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary/40 border border-border text-muted-foreground dark:bg-white/5 dark:border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

              </SpotlightCard>
            </MagneticReveal>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default Projects;