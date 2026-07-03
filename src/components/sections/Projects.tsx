import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

// ── Data ──────────────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    op:    '01',
    title: 'SMARTHOMES',
    status:'DEPLOYED',
    desc:  'Scalable e-commerce platform with AI-powered shopping assistant and real-time support. Features intelligent search via ElasticSearch, containerized microservices, and OpenAI assistant integration.',
    stack: ['React', 'Java Servlets', 'MySQL', 'MongoDB', 'ElasticSearch', 'Docker', 'OpenAI'],
    color: '#00d4ff',
  },
  {
    op:    '02',
    title: 'MEDIABRIDGE',
    status:'DEPLOYED',
    desc:  'Two-node Android media sync app using peer-to-peer transfers with SHA-256 deduplication, chunked resumable uploads, automatic device discovery, and Google Photos as the final sync destination.',
    stack: ['Kotlin', 'Jetpack Compose', 'Ktor', 'P2P', 'SHA-256'],
    color: '#ff6a00',
  },
  {
    op:    '03',
    title: 'STACKGET',
    status:'DEPLOYED',
    desc:  'Cross-platform Go CLI tool available on npm that scans a developer\'s machine to detect all installed tools and versions. Features native OS registry/GUI app discovery, concurrent execution, and YAML/JSON environment snapshots with drift-checking.',
    stack: ['Go', 'CLI', 'npm', 'YAML', 'JSON', 'Concurrency', 'OS Registry'],
    color: '#4ade80',
  },
  {
    op:    '04',
    title: 'HELPNEST',
    status:'DEPLOYED',
    desc:  'Open-source AI-first customer support platform with a conversational AI agent that answers from a knowledge base via vector search, citing sources and escalating uncertain questions to a human inbox.',
    stack: ['Next.js', 'PostgreSQL', 'Turborepo', 'Anthropic', 'OpenAI', 'Gemini', 'Mistral', 'Qdrant'],
    color: '#a855f7',
  },
];

// ── Corner bracket component ──────────────────────────────────────────────────
const Corners = ({ size = 14, color = 'rgba(0,212,255,0.35)', hoverColor = '' }: { size?: number; color?: string; hoverColor?: string }) => (
  <>
    {(['tl','tr','bl','br'] as const).map(pos => (
      <span
        key={pos}
        className="absolute pointer-events-none transition-all duration-300"
        style={{
          width: size, height: size,
          top:    pos.includes('t') ? 0 : undefined,
          bottom: pos.includes('b') ? 0 : undefined,
          left:   pos.includes('l') ? 0 : undefined,
          right:  pos.includes('r') ? 0 : undefined,
          borderTop:    pos.includes('t') ? `1.5px solid ${color}` : undefined,
          borderBottom: pos.includes('b') ? `1.5px solid ${color}` : undefined,
          borderLeft:   pos.includes('l') ? `1.5px solid ${color}` : undefined,
          borderRight:  pos.includes('r') ? `1.5px solid ${color}` : undefined,
        }}
      />
    ))}
  </>
);

// ── Project card ──────────────────────────────────────────────────────────────
const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#ØΦΨ@$%';

const ProjectCard = ({ project, index }: { project: typeof PROJECTS[number]; index: number }) => {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [hovered, setHovered] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glitchTitle, setGlitchTitle] = useState('');

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    setTilt({
      x: ((y - rect.height / 2) / rect.height) * -5,
      y: ((x - rect.width / 2) / rect.width) * 5,
    });
  }, []);

  const onEnter = useCallback(() => {
    setHovered(true);
    // Glitch scramble
    let iter = 0;
    const id = setInterval(() => {
      setGlitchTitle(
        project.title.split('').map((c, i) =>
          i < iter ? project.title[i] : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        ).join('')
      );
      iter++;
      if (iter > project.title.length) { clearInterval(id); setGlitchTitle(''); }
    }, 40);
  }, [project.title]);

  const onLeave = useCallback(() => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlitchTitle('');
  }, []);

  return (
    <motion.div
      ref={ref}
      className="relative p-6 cursor-default"
      style={{
        background: isDark
          ? (hovered ? 'rgba(6,14,24,0.95)' : 'rgba(5,12,20,0.82)')
          : (hovered ? 'rgba(228,244,253,0.98)' : 'rgba(238,247,253,0.95)'),
        border: `1px solid ${hovered ? project.color + '50' : (isDark ? 'rgba(0,212,255,0.14)' : 'rgba(0,119,170,0.18)')}`,
        backdropFilter:'blur(12px)',
        transition:    'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease, transform 0.15s ease-out',
        boxShadow:     hovered ? `0 0 30px ${project.color}15, inset 0 0 30px ${project.color}04` : 'none',
        transform:     `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      initial={{ opacity: 0, y: 80, scale: 0.94, filter: 'blur(8px)' }}
      animate={inView ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } : {}}
      transition={{ type: 'spring', stiffness: 65, damping: 20, delay: index * 0.13 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseMove={onMouseMove}
    >
      {/* Mouse spotlight */}
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, ${project.color}12, transparent 60%)`,
          }}
        />
      )}
      <Corners
        size={hovered ? 18 : 12}
        color={hovered ? project.color + '80' : 'rgba(0,212,255,0.3)'}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] tracking-widest text-[#8ba9b8]/35">OP:{project.op}</span>
          <span className="h-px w-5" style={{ background: `rgba(0,212,255,0.3)` }} />
          <h3
            className="font-mono font-bold tracking-[0.1em] text-sm transition-colors duration-300"
            style={{ color: hovered ? project.color : (isDark ? '#cce8f4' : '#0d2235') }}
          >
            {glitchTitle || project.title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: project.color, boxShadow: `0 0 6px ${project.color}` }}
          />
          <span
            className="font-mono text-[8px] tracking-[0.2em]"
            style={{ color: project.color + 'aa' }}
          >
            {project.status}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div
        className="h-px mb-5 transition-all duration-500"
        style={{
          background: hovered
            ? `linear-gradient(to right, ${project.color}60, transparent)`
            : 'linear-gradient(to right, rgba(0,212,255,0.2), transparent)',
        }}
      />

      {/* Description */}
      <p className="text-[#8ba9b8]/70 text-sm leading-relaxed mb-6 min-h-[4.5rem]">
        {project.desc}
      </p>

      {/* Tech stack */}
      <div className="flex flex-wrap gap-1.5">
        {project.stack.map(tech => (
          <span
            key={tech}
            className="font-mono text-[10px] tracking-[0.08em] px-2 py-0.5 transition-all duration-300"
            style={{
              border:  `1px solid ${hovered ? project.color + '35' : 'rgba(0,212,255,0.14)'}`,
              color:   hovered ? project.color + 'cc' : '#8ba9b8',
              background: hovered ? `${project.color}06` : 'rgba(0,212,255,0.03)',
            }}
          >
            {tech}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const Projects = () => {
  const titleRef   = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section id="projects" className="relative py-28 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div ref={titleRef} className="mb-16">
          <motion.div
            className="wd-badge mb-5 inline-flex"
            initial={{ opacity: 0, x: -40, filter: 'blur(6px)' }}
            animate={titleInView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
            ACTIVE OPERATIONS
          </motion.div>

          <motion.h2
            className="font-black uppercase text-[#cce8f4]"
            style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', letterSpacing: '-0.02em', lineHeight: 0.88 }}
            initial={{ opacity: 0, y: 70, filter: 'blur(12px)' }}
            animate={titleInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          >
            PROJECT{' '}
            <span style={{ color: isDark ? '#00d4ff' : '#0099c8', textShadow: isDark ? '0 0 30px rgba(0,212,255,0.4)' : 'none' }}>
              ARCHIVE.
            </span>
          </motion.h2>

          <motion.p
            className="mt-5 font-mono text-[10px] tracking-[0.2em] text-[#8ba9b8]/40 max-w-md"
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={titleInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            CLASSIFIED — HOVER TO REVEAL DETAILS · {PROJECTS.length} OPERATIONS ON RECORD
          </motion.p>
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROJECTS.map((project, index) => (
            <ProjectCard key={project.op} project={project} index={index} />
          ))}
        </div>

        {/* Bottom status bar */}
        <motion.div
          className="mt-10 flex items-center justify-between"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-16 bg-gradient-to-r from-[rgba(0,212,255,0.4)] to-transparent" />
            <span className="font-mono text-[9px] tracking-widest text-[#8ba9b8]/30">
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
          <span className="font-mono text-[9px] tracking-widest text-[#4ade80]/40">
            ● {PROJECTS.length}/{PROJECTS.length} DEPLOYED
          </span>
        </motion.div>

      </div>
    </section>
  );
};

export default Projects;
