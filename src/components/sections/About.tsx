import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Download } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// ── Data ──────────────────────────────────────────────────────────────────────
const education = [
  {
    idx: '01',
    school: 'ILLINOIS INSTITUTE OF TECHNOLOGY',
    degree: 'M.S. COMPUTER SCIENCE',
    period: 'AUG 2024 — MAY 2026',
    gpa: '3.50',
  },
  {
    idx: '02',
    school: 'SRI ESHWAR COLLEGE OF ENGINEERING',
    degree: 'B.E. COMPUTER SCIENCE',
    period: 'MAY 2019 — APR 2023',
    gpa: '3.66',
  },
];

const experience = [
  {
    badge: 'INTERN',
    role: 'AI AGENT DEVELOPER',
    company: 'NeuralSeek',
    location: 'Miami, FL (Remote)',
    period: 'OCT 2025 — NOV 2025',
    desc: 'Engineered a RAG-powered AI agent with automated data lineage to guarantee verifiable citation accuracy and minimize model hallucinations. Optimized LLM response quality through advanced prompt engineering and ethical guardrails.',
    color: '#00d4ff',
  },
  {
    badge: 'STAFF',
    role: 'MEMBER TECHNICAL STAFF',
    company: 'Zoho Corporation',
    location: 'Chennai, India',
    period: 'JUN 2023 — JUL 2023',
    desc: 'Resolved high-priority support tickets, applying fixes across 10,000+ Apple devices, boosting system functionality. Collaborated with front-end developers on REST API integration.',
    color: '#ff6a00',
  },
  {
    badge: 'TRAIN',
    role: 'PROJECT TRAINEE',
    company: 'Zoho Corporation',
    location: 'Chennai, India',
    period: 'AUG 2022 — MAY 2023',
    desc: 'Detected and resolved key glitches in the MDM system reducing policy violation cases by ~10%. Created product feature documentation reducing onboarding time for new developers.',
    color: '#ff6a00',
  },
  {
    badge: 'INTERN',
    role: 'SUMMER INTERN',
    company: 'Zoho Corporation',
    location: 'Chennai, India',
    period: 'MAY 2022 — JUN 2022',
    desc: 'Acquired proficiency in backend development through hands-on work with production systems. Participated in code reviews and mentorship sessions.',
    color: '#ff6a00',
  },
];

const skillMatrix = [
  {
    cat: 'LANGUAGES',
    skills: ['Python', 'Java', 'JavaScript (ES6+)', 'TypeScript', 'Go', 'Kotlin', 'C++', 'C', 'SQL', 'HTML5', 'CSS3'],
  },
  {
    cat: 'FRAMEWORKS & AI INFRA',
    skills: ['LangGraph', 'LangChain', 'AutoGen', 'Multi-Agent Orchestration', 'Agentic AI', 'RAG Architecture', 'Prompt Engineering', 'LLM APIs (OpenAI, Claude)', 'React.js', 'Next.js', 'Node.js', 'FastAPI', 'RESTful APIs (Jersey, Ktor)', 'WebSockets', 'Java Servlets', 'Jetpack Compose'],
  },
  {
    cat: 'DATABASES & VECTOR SEARCH',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'ElasticSearch', 'Vector Databases', 'Vector Embeddings', 'Semantic Search', 'Graph Databases', 'Data Deduplication (SHA-256)'],
  },
  {
    cat: 'CLOUD, DEVOPS & DISTRIBUTED SYSTEMS',
    skills: ['AWS', 'Microsoft Azure', 'Docker', 'Kubernetes', 'Apache Kafka', 'Git', 'GitHub', 'GitHub Actions', 'CI/CD', 'Linux', 'Microservices Architecture', 'System Design', 'Peer-to-Peer (P2P) Systems', 'Embedded Servers'],
  },
  {
    cat: 'ENGINEERING PRACTICES',
    skills: ['Agile/Scrum', 'Code Reviews', 'Unit & E2E Testing (Playwright)', 'Debugging & Troubleshooting'],
  },
];

const achievements = [
  { title: 'INTERIZON HACKATHON 2021', award: 'WINNER',     date: 'JAN 2023'  },
  { title: 'FRESHATHON PROJECT EXPO',  award: 'JURY PANEL', date: 'JUNE 2024' },
];

// ── Corner bracket component ──────────────────────────────────────────────────
const Corners = ({ size = 14, color = 'rgba(0,212,255,0.4)' }: { size?: number; color?: string }) => (
  <>
    <span className="absolute top-0 left-0 pointer-events-none" style={{ width: size, height: size, borderTop: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` }} />
    <span className="absolute top-0 right-0 pointer-events-none" style={{ width: size, height: size, borderTop: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` }} />
    <span className="absolute bottom-0 left-0 pointer-events-none" style={{ width: size, height: size, borderBottom: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` }} />
    <span className="absolute bottom-0 right-0 pointer-events-none" style={{ width: size, height: size, borderBottom: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` }} />
  </>
);

// ── Panel wrapper ─────────────────────────────────────────────────────────────
const Panel = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <motion.div
      ref={ref}
      className={`relative p-6 ${className}`}
      style={{
        background: isDark ? 'rgba(5,12,20,0.85)' : 'rgba(238,247,253,0.95)',
        border: `1px solid ${isDark ? 'rgba(0,212,255,0.14)' : 'rgba(0,119,170,0.16)'}`,
        backdropFilter: 'blur(10px)',
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}
      initial={{ opacity: 0, y: 55, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 75, damping: 20, delay }}
      whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
    >
      <Corners />
      {children}
    </motion.div>
  );
};

// ── Panel header label ─────────────────────────────────────────────────────────
const PanelHeader = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="h-px flex-1 bg-gradient-to-r from-[rgba(0,212,255,0.5)] to-transparent" />
    <span className="font-mono text-[9px] tracking-[0.25em] text-[#00d4ff]/70 uppercase whitespace-nowrap">
      {label}
    </span>
    <span className="h-px w-6 bg-[rgba(0,212,255,0.3)]" />
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const About = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true });

  return (
    <section id="about" className="relative py-28 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div ref={titleRef} className="mb-16">
          <motion.div
            className="wd-badge mb-5 inline-flex"
            initial={{ opacity: 0, x: -40, filter: 'blur(6px)' }}
            animate={titleInView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
            SUBJECT PROFILE
          </motion.div>

          <motion.h2
            className="font-black uppercase text-[#cce8f4]"
            style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', letterSpacing: '-0.02em', lineHeight: 0.88 }}
            initial={{ opacity: 0, y: 70, filter: 'blur(12px)' }}
            animate={titleInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          >
            CREDENTIALS &amp;{' '}
            <span style={{ color: isDark ? '#00d4ff' : '#0099c8', textShadow: isDark ? '0 0 30px rgba(0,212,255,0.4)' : 'none' }}>
              DEPLOYMENT
            </span>
          </motion.h2>
        </div>

        {/* Main grid: Education + Achievements left, Experience right */}
        <div className="grid lg:grid-cols-12 gap-5 mb-5 items-start">

          {/* Left column: Education + Achievements stacked */}
          <div className="lg:col-span-4 flex flex-col gap-5">
          <Panel delay={0.1}>
            <PanelHeader label="DATABASE RECORDS" />
            <div className="space-y-6">
              {education.map((edu, i) => (
                <motion.div
                  key={edu.idx}
                  className="flex gap-4"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.7, delay: i * 0.13, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="font-mono text-[10px] text-[#00d4ff]/40 mt-0.5 shrink-0">[{edu.idx}]</span>
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.15em] text-[#00d4ff] mb-1">{edu.school}</p>
                    <p className="text-[#cce8f4] text-sm font-semibold mb-1">{edu.degree}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[9px] tracking-widest text-[#8ba9b8]/50">{edu.period}</p>
                      <span className="font-mono text-[9px] px-2 py-0.5" style={{ border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff' }}>
                        GPA {edu.gpa}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Panel>

          {/* Achievements */}
          <Panel delay={0.25}>
            <PanelHeader label="CITATIONS" />
            <div className="space-y-5">
              {achievements.map((a, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="text-[#00d4ff]/30 font-mono text-xs mt-0.5">●</span>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.12em] text-[#cce8f4] mb-1">{a.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[8px] px-2 py-0.5" style={{ border: '1px solid rgba(255,106,0,0.3)', color: '#ff8f3f', background: 'rgba(255,106,0,0.06)' }}>
                        {a.award}
                      </span>
                      <span className="font-mono text-[9px] text-[#8ba9b8]/40">{a.date}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Panel>
          </div>{/* end left column */}

          {/* Experience */}
          <Panel className="lg:col-span-8" delay={0.15}>
            <PanelHeader label="DEPLOYMENT HISTORY" />
            <div className="space-y-5">
              {experience.map((exp, i) => (
                <motion.div
                  key={i}
                  className="flex gap-4 pb-5 border-b border-[rgba(0,212,255,0.07)] last:border-0 last:pb-0"
                  initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.75, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="shrink-0 mt-0.5">
                    <span
                      className="font-mono text-[8px] tracking-widest px-1.5 py-0.5"
                      style={{ border: `1px solid ${exp.color}40`, color: exp.color, background: `${exp.color}08` }}
                    >
                      {exp.badge}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                      <p className="font-mono text-[9px] tracking-[0.15em]" style={{ color: exp.color }}>{exp.role}</p>
                      <p className="font-mono text-[9px] tracking-widest text-[#8ba9b8]/40">{exp.period}</p>
                    </div>
                    <p className="text-[#cce8f4]/75 text-sm mb-1.5">{exp.company} · {exp.location}</p>
                    <p className="text-[#8ba9b8]/65 text-sm leading-relaxed">{exp.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Technical skills — full width */}
        <Panel className="mb-5" delay={0.2}>
          <PanelHeader label="TECHNICAL ARSENAL" />
          <div className="space-y-4">
            {skillMatrix.map((row, ri) => (
              <div key={row.cat} className="flex flex-wrap items-start gap-x-5 gap-y-2 md:flex-nowrap">
                <span className="font-mono text-[9px] tracking-[0.18em] whitespace-nowrap pt-0.5 w-52 shrink-0 text-[#00d4ff]/60">
                  [{row.cat}]
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {row.skills.map((s, si) => (
                    <motion.span
                      key={s}
                      className="wd-tag"
                      initial={{ opacity: 0, y: 12, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ type: 'spring', stiffness: 220, damping: 20, delay: ri * 0.05 + si * 0.02 }}
                    >
                      {s}
                    </motion.span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Bio + Resume — full width */}
        <Panel delay={0.3}>
          <PanelHeader label="OPERATIVE BRIEF" />
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4">
              <motion.p
                className="flex gap-3 text-[#8ba9b8]/80 leading-relaxed"
                style={{ fontSize: '1rem' }}
                initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="font-mono text-[#00d4ff]/50 shrink-0 mt-0.5">&gt;</span>
                <span>
                  <span className="text-[#cce8f4] font-medium">Full-Stack &amp; Backend Engineer</span> specializing in
                  scalable systems, distributed architectures, and cloud-native applications.
                </span>
              </motion.p>
              <motion.p
                className="flex gap-3 text-[#8ba9b8]/70 leading-relaxed"
                style={{ fontSize: '0.95rem' }}
                initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="font-mono text-[#00d4ff]/40 shrink-0 mt-0.5">&gt;</span>
                <span>
                  M.S. Computer Science — Illinois Institute of Technology, 2026. Experience across Zoho Corporation
                  (3 roles) and NeuralSeek — from securing MDM infrastructure to engineering RAG-powered AI agents.
                </span>
              </motion.p>
            </div>
            <div className="shrink-0 md:pt-1">
              <a
                href="https://docs.google.com/document/d/1iXWJzeLECENQXcnyOjwzMGs5a50ip8P5_9nnBsSOXLE/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="wd-btn inline-flex"
              >
                DOWNLOAD RESUME
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </Panel>

      </div>
    </section>
  );
};

export default About;
