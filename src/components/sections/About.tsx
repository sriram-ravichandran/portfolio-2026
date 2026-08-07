import { useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValueEvent, type MotionValue } from 'framer-motion';
import { ArrowUpRight, Award } from 'lucide-react';
import { EASE_OUT, FadeUp } from '@/lib/anim';
import SectionHeader from '@/components/SectionHeader';
import Magnetic from '@/components/Magnetic';

/* ── Data ─────────────────────────────────────────────────────────────────── */
const BIO =
  'Full-Stack & AI Engineer shipping production-grade agentic systems end-to-end — RAG pipelines, multi-agent orchestration, and knowledge graphs, from architecture through deployment. M.S. Computer Science at Illinois Institute of Technology, with experience across Zoho Corporation and NeuralSeek: from securing MDM infrastructure for 10,000+ devices to engineering RAG agents whose every answer traces back to a verifiable source.';

const EXPERIENCE = [
  {
    role: 'AI Agent Developer Intern',
    company: 'NeuralSeek',
    location: 'Miami, FL — Remote',
    period: 'Oct — Nov 2025',
    desc: 'Built a Retrieval-Augmented Generation agent with automated data-lineage tracking, so every generated answer traced back to a verifiable source citation. Hardened it with prompt-level guardrails against unsafe and low-confidence responses, meeting the team\u2019s bar for production deployment.',
  },
  {
    role: 'Member Technical Staff',
    company: 'Zoho Corporation',
    location: 'Chennai, India',
    period: 'Jun — Jul 2023',
    desc: 'Diagnosed and shipped fixes for high-severity production issues affecting a fleet of 10,000+ Apple devices, improving system stability. Owned REST API contracts consumed by front-end teams, resolving integration issues end-to-end.',
  },
  {
    role: 'Project Trainee',
    company: 'Zoho Corporation',
    location: 'Chennai, India',
    period: 'Aug 2022 — May 2023',
    desc: 'Found and closed security gaps in the MDM system that let users bypass device restrictions, cutting policy-violation cases by ~10%. Wrote feature documentation adopted as onboarding material for new developers.',
  },
  {
    role: 'Summer Intern',
    company: 'Zoho Corporation',
    location: 'Chennai, India',
    period: 'May — Jun 2022',
    desc: 'Delivered backend features across multiple languages and frameworks, with code reviewed and merged into production codebases under senior engineer mentorship.',
  },
];

const EDUCATION = [
  {
    school: 'Illinois Institute of Technology',
    degree: 'M.S. Computer Science',
    period: '2024 — 2026',
    gpa: '3.50',
  },
  {
    school: 'Sri Eshwar College of Engineering',
    degree: 'B.E. Computer Science',
    period: '2019 — 2023',
    gpa: '3.66',
  },
];

const ACHIEVEMENTS = [
  { title: 'Interizon Hackathon',     award: 'Winner',     date: 'Jan 2023'  },
  { title: 'Freshathon Project Expo', award: 'Jury Panel', date: 'June 2024' },
];

const SKILLS = [
  {
    cat: 'Languages',
    skills: ['Python', 'Java', 'TypeScript', 'JavaScript (ES6+)', 'Go (Golang)', 'Kotlin', 'C++', 'Rust', 'SQL'],
  },
  {
    cat: 'AI & Agentic Systems',
    skills: ['LangGraph', 'LangChain', 'LlamaIndex', 'AutoGen', 'Model Context Protocol (MCP)', 'Multi-Agent Orchestration', 'RAG Architecture', 'Prompt Engineering', 'Vector Embeddings', 'Hugging Face', 'Fine-Tuning (LoRA)', 'LLM Evaluation & Observability (LangSmith)', 'LLM APIs (OpenAI, Anthropic Claude, Gemini, Mistral)'],
  },
  {
    cat: 'Backend & Web',
    skills: ['FastAPI', 'Node.js', 'Next.js', 'React.js', 'GraphQL', 'gRPC', 'RESTful APIs', 'WebSockets', 'Microservices Architecture', 'System Design', 'PDF Parsing'],
  },
  {
    cat: 'Databases & Search',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'ElasticSearch', 'Qdrant', 'Pinecone (Vector Search)', 'Neo4j (Graph Database)'],
  },
  {
    cat: 'Cloud & DevOps',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform (IaC)', 'Apache Kafka', 'MLOps', 'GitHub Actions', 'CI/CD', 'Linux'],
  },
  {
    cat: 'Engineering Practices',
    skills: ['Agile/Scrum', 'Code Reviews', 'Unit & E2E Testing (Playwright)', 'Debugging & Performance Troubleshooting'],
  },
];

const RESUME_URL =
  'https://drive.google.com/file/d/1KCkhjmh1rAO-th2CxP3jQnzjNagiJWHS/view?usp=sharing';

/* ── Scroll-scrubbed word reveal ──────────────────────────────────────────── */
const ScrubWord = ({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) => {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.28em]">
      {word}
    </motion.span>
  );
};

const BioScrub = () => {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.28'],
  });
  const words = BIO.split(' ');

  return (
    <p
      ref={ref}
      className="text-ink font-light leading-snug max-w-4xl"
      style={{ fontSize: 'clamp(1.35rem, 3.1vw, 2.4rem)' }}
    >
      {words.map((word, i) => (
        <ScrubWord
          key={i}
          word={word}
          progress={scrollYProgress}
          range={[i / words.length, Math.min(1, (i + 1) / words.length)]}
        />
      ))}
    </p>
  );
};

/* ── Experience row ───────────────────────────────────────────────────────── */
const ExperienceRow = ({ exp, index }: { exp: typeof EXPERIENCE[number]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <motion.div
      ref={ref}
      className="group hairline-t py-8 md:py-10 grid md:grid-cols-12 gap-3 md:gap-6 items-baseline transition-colors duration-500 hover:bg-surface/80 md:px-4 md:-mx-4"
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: EASE_OUT, delay: index * 0.08 }}
      data-cursor="hover"
    >
      <span className="font-mono text-xs text-signal md:col-span-1">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="md:col-span-5">
        <h4 className="display text-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-2"
            style={{ fontSize: 'clamp(1.25rem, 2.4vw, 1.9rem)' }}>
          {exp.role}
        </h4>
        <p className="text-inkmuted text-sm mt-1.5">
          {exp.company} · {exp.location}
        </p>
      </div>

      <p className="text-inkmuted/90 text-sm leading-relaxed md:col-span-4">
        {exp.desc}
      </p>

      <div className="md:col-span-2 flex items-center md:justify-end gap-3">
        <span className="label-mono whitespace-nowrap">{exp.period}</span>
        <ArrowUpRight className="w-4 h-4 text-signal opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500" />
      </div>
    </motion.div>
  );
};

/* ── Education card — pointer-tracked spotlight, same language as Projects ── */
const EduCard = ({ edu }: { edu: typeof EDUCATION[number] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: -999, y: -999, on: false });

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setSpot({ x: e.clientX - rect.left, y: e.clientY - rect.top, on: true });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setSpot(s => ({ ...s, on: false }))}
      className="group relative h-full overflow-hidden rounded-2xl border border-line bg-surface p-8 md:p-10 flex flex-col justify-between gap-10 transition-all duration-500 ease-out-expo hover:-translate-y-1.5 hover:border-signal/40"
      data-cursor="hover"
    >
      {/* Vermilion spotlight following the pointer */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: spot.on ? 1 : 0,
          background: `radial-gradient(320px circle at ${spot.x}px ${spot.y}px, rgb(var(--signal-rgb) / 0.09) 0%, transparent 65%)`,
        }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <span className="label-mono">Education</span>
        <span className="label-mono">{edu.period}</span>
      </div>
      <div className="relative">
        <h4
          className="display text-ink mb-2 transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5"
          style={{ fontSize: 'clamp(1.4rem, 2.6vw, 2.1rem)' }}
        >
          {edu.degree}
        </h4>
        <p className="text-inkmuted text-sm">{edu.school}</p>
        <p className="font-mono text-signal text-sm mt-4">GPA {edu.gpa} / 4.0</p>
      </div>
    </div>
  );
};

/* ── Arsenal — scroll-driven tabbed index ─────────────────────────────────
   The section pins while a tall runway scrolls beneath it; each stretch of
   scroll reveals the next category, chips cascading in one by one.          */
const Arsenal = () => {
  const [active, setActive] = useState(0);
  const group = SKILLS[active];

  const runwayRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ['start 0.5', 'end 1'],
  });

  useMotionValueEvent(scrollYProgress, 'change', v => {
    // Scroll drives the sequence on desktop; mobile keeps tap-to-switch.
    if (window.innerWidth < 768) return;
    const idx = Math.max(0, Math.min(SKILLS.length - 1, Math.floor(v * SKILLS.length)));
    setActive(idx);
  });

  return (
    <div ref={runwayRef} className="md:h-[128vh]">
      <div className="md:sticky md:top-[16vh]">
      <FadeUp className="flex items-baseline justify-between mb-8">
        <h3 className="label-mono !text-ink">Technical arsenal</h3>
        <span className="label-mono hidden sm:block">
          ({SKILLS.reduce((n, g) => n + g.skills.length, 0)} tools — keep scrolling)
        </span>
      </FadeUp>

      <FadeUp>
        <div className="grid md:grid-cols-12 gap-8 md:gap-14 hairline-t pt-8 md:pt-10">
          {/* Category tabs */}
          <div className="md:col-span-4 flex flex-col" role="tablist" aria-label="Skill categories">
            {SKILLS.map((g, i) => {
              const isActive = active === i;
              return (
                <button
                  key={g.cat}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className="relative group flex items-baseline gap-3.5 py-3 pl-5 text-left"
                >
                  {isActive && (
                    <motion.span
                      layoutId="arsenal-pip"
                      className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-full bg-signal"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`font-mono text-[10px] transition-colors duration-300 ${isActive ? 'text-signal' : 'text-inkmuted/50'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`display transition-all duration-300 ease-out-expo ${
                      isActive ? 'text-ink translate-x-1' : 'text-inkmuted/60 group-hover:text-ink/80'
                    }`}
                    style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.2rem)' }}
                  >
                    {g.cat}
                  </span>
                  <span className={`label-mono ml-auto transition-opacity duration-300 ${isActive ? 'opacity-100 !text-signal' : 'opacity-40'}`}>
                    {g.skills.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active category skills */}
          <div className="md:col-span-8 min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="flex flex-wrap content-start gap-2"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
              >
                {group.skills.map((skill, si) => (
                  <motion.span
                    key={skill}
                    className="chip !text-[13px] !py-1.5 !px-3.5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: EASE_OUT, delay: si * 0.022 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </FadeUp>
      </div>
    </div>
  );
};

/* ── Main ─────────────────────────────────────────────────────────────────── */
const About = () => (
  <section id="about" className="relative px-6 md:px-12 pt-28 md:pt-40 pb-20 md:pb-28" aria-label="About">
    <div className="max-w-[1400px] mx-auto">
      <SectionHeader
        index="01"
        label="Profile"
        meta="Credentials & deployment"
        titleLines={[
          { text: 'CREDENTIALS' },
          { text: '& deployment', serif: true },
        ]}
      />

      {/* Bio — words ink themselves in as you scroll */}
      <div className="mb-10">
        <BioScrub />
      </div>

      {/* Resume CTA */}
      <FadeUp delay={0.1} className="mb-24 md:mb-32">
        <Magnetic strength={0.25}>
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-full border border-line px-7 py-4 text-sm font-medium tracking-wide uppercase transition-colors duration-500 hover:bg-ink hover:text-canvas hover:border-ink"
          >
            Download résumé
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </Magnetic>
      </FadeUp>

      {/* Experience */}
      <div className="mb-24 md:mb-32">
        <FadeUp className="flex items-baseline justify-between mb-8">
          <h3 className="label-mono !text-ink">Experience</h3>
          <span className="label-mono">({EXPERIENCE.length})</span>
        </FadeUp>
        <div className="hairline-b">
          {EXPERIENCE.map((exp, i) => (
            <ExperienceRow key={`${exp.company}-${exp.period}`} exp={exp} index={i} />
          ))}
        </div>
      </div>

      {/* Education + honors */}
      <div className="grid md:grid-cols-2 gap-5 mb-24 md:mb-32">
        {EDUCATION.map((edu, i) => (
          <FadeUp key={edu.school} delay={i * 0.1} className="h-full">
            <EduCard edu={edu} />
          </FadeUp>
        ))}
      </div>

      {/* Honors */}
      <div className="mb-24 md:mb-32">
        <FadeUp className="mb-8">
          <h3 className="label-mono !text-ink">Honors</h3>
        </FadeUp>
        <div className="hairline-b">
          {ACHIEVEMENTS.map((a, i) => (
            <FadeUp key={a.title} delay={i * 0.08}>
              <div
                className="group hairline-t py-6 md:px-4 md:-mx-4 flex flex-wrap items-center justify-between gap-3 transition-colors duration-500 hover:bg-surface/80"
                data-cursor="hover"
              >
                <div className="flex items-center gap-4">
                  <Award className="w-4 h-4 text-signal transition-transform duration-500 ease-out-expo group-hover:-rotate-12 group-hover:scale-125" />
                  <span className="text-ink font-medium transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
                    {a.title}
                  </span>
                  <span className="rounded-full border border-line px-3 py-1 label-mono !text-signal transition-colors duration-500 group-hover:border-signal group-hover:bg-signal/10">
                    {a.award}
                  </span>
                </div>
                <span className="label-mono transition-colors duration-500 group-hover:!text-ink">{a.date}</span>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>

      {/* Technical arsenal — compact tabbed index */}
      <Arsenal />
    </div>
  </section>
);

export default About;
