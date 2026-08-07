import { useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Github } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import { Chars, FadeUp } from '@/lib/anim';

/* ── Data ─────────────────────────────────────────────────────────────────── */
const PROJECTS = [
  {
    idx: '01',
    title: 'HelpNest',
    status: 'Deployed',
    desc: 'Open-source AI-first customer support platform: a conversational agent answers from a knowledge base via Qdrant vector search, cites its sources, and escalates low-confidence questions to a human inbox. Model-agnostic, so teams swap LLM providers without touching retrieval or escalation logic.',
    stack: ['Next.js', 'PostgreSQL', 'Turborepo', 'Qdrant', 'Anthropic', 'OpenAI', 'Gemini', 'Mistral'],
    hue: '#C79BFF',
  },
  {
    idx: '02',
    title: 'MediaBridge',
    status: 'Deployed',
    desc: 'Two-node Android media sync app with a Ktor embedded server for direct peer-to-peer transfer, automatic device discovery, and chunked resumable uploads that survive network drops. SHA-256 content deduplication cuts redundant transfers, routing final synced media to Google Photos.',
    stack: ['Kotlin', 'Jetpack Compose', 'Ktor', 'P2P', 'SHA-256', 'Google Photos'],
    hue: '#5AC8FA',
  },
  {
    idx: '03',
    title: 'StackGet',
    status: 'Deployed',
    desc: 'Cross-platform Go CLI published on npm that scans a machine to detect installed tools and versions via native OS registry and GUI-app discovery, with concurrent execution for fast scans. YAML/JSON environment snapshots with drift-checking let teams diff a toolchain against a known-good baseline.',
    stack: ['Go', 'CLI', 'npm', 'YAML', 'Concurrency', 'OS Registry'],
    hue: '#7BE06B',
  },
  {
    idx: '04',
    title: 'ResearchGraph',
    status: 'Deployed',
    desc: 'Knowledge graph platform integrating Semantic Scholar and OpenAlex, with PDF ingestion for user-uploaded papers, tracing citations, concepts and metadata across a research field. A deterministic validation pipeline maps LLM citation tags against the RAG context window, flagging hallucinated sources without a second model.',
    stack: ['Next.js', 'Neo4j', 'FastAPI', 'LLM APIs', 'PDF Parsing', 'Semantic Scholar'],
    hue: '#FF4D1C',
  },
];

/* ── Sticky stacking card ─────────────────────────────────────────────────── */
const ProjectCard = ({
  project,
  index,
  total,
  progress,
}: {
  project: typeof PROJECTS[number];
  index: number;
  total: number;
  progress: MotionValue<number>;
}) => {
  // As later cards arrive, earlier ones recede: scale down + dim slightly.
  // Desktop only — on mobile the cards aren't pinned (they flow normally,
  // since differing card heights make a pinned deck eject them unevenly),
  // so the recede would just shrink cards mid-scroll for no reason.
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
  const targetScale = isDesktop ? 1 - (total - 1 - index) * 0.045 : 1;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

  // Ghost number drifts against the card's own scroll for inner parallax.
  const articleRef = useRef<HTMLElement>(null);
  const { scrollYProgress: cardProgress } = useScroll({
    target: articleRef,
    offset: ['start end', 'end start'],
  });
  const ghostY      = useTransform(cardProgress, [0, 1], [90, -90]);
  const ghostRotate = useTransform(cardProgress, [0, 1], [4, -4]);

  // Hue spotlight follows the pointer.
  const [spot, setSpot] = useState({ x: -999, y: -999, on: false });
  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = articleRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSpot({ x: e.clientX - rect.left, y: e.clientY - rect.top, on: true });
  }, []);

  return (
    <div
      className="md:sticky flex items-start justify-center"
      style={{ top: `calc(10vh + ${index * 22}px)` }}
    >
      <motion.article
        ref={articleRef}
        className="relative w-full overflow-hidden rounded-3xl border border-line bg-surface origin-top"
        style={{ scale }}
        onMouseMove={onMove}
        onMouseLeave={() => setSpot(s => ({ ...s, on: false }))}
        aria-label={`Project: ${project.title}`}
      >
        {/* Hue wash + pointer spotlight + ghost number */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(120% 100% at 85% -10%, ${project.hue}14 0%, transparent 55%)`,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            opacity: spot.on ? 1 : 0,
            background: `radial-gradient(420px circle at ${spot.x}px ${spot.y}px, ${project.hue}1E 0%, transparent 65%)`,
          }}
        />
        <motion.span
          className="display absolute -right-4 -bottom-10 md:-bottom-16 select-none pointer-events-none leading-none"
          style={{
            fontSize: 'clamp(9rem, 24vw, 22rem)',
            color: 'transparent',
            WebkitTextStroke: `1px ${project.hue}45`,
            y: ghostY,
            rotate: ghostRotate,
          }}
          aria-hidden="true"
        >
          {project.idx}
        </motion.span>

        <div className="relative p-7 md:p-14 min-h-[62vh] md:min-h-[68vh] flex flex-col">
          {/* Header row */}
          <div className="flex items-center justify-between mb-10 md:mb-14">
            <span className="font-mono text-xs" style={{ color: project.hue }}>
              {project.idx} / {String(PROJECTS.length).padStart(2, '0')}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: project.hue, animation: 'pulse-dot 2.4s ease-in-out infinite' }}
              />
              <span className="label-mono !text-ink/70">{project.status}</span>
            </span>
          </div>

          {/* Title */}
          <h3
            className="display text-ink mb-6 md:mb-8 whitespace-nowrap text-[min(5.7vw,2.4rem)] md:text-[clamp(2.4rem,7vw,5.5rem)]"
            data-cursor="hover"
          >
            <Chars text={project.title} interactive stagger={0.04} />
          </h3>

          {/* Description */}
          <p className="text-inkmuted text-base md:text-lg leading-relaxed max-w-xl mb-auto">
            {project.desc}
          </p>

          {/* Stack chips */}
          <div className="mt-10 pt-8 hairline-t flex flex-wrap items-center gap-2.5">
            <span className="label-mono mr-3">Stack</span>
            {project.stack.map(tech => (
              <span key={tech} className="chip !py-1.5 !px-3.5 !text-[0.78rem]">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </motion.article>
    </div>
  );
};

/* ── Main ─────────────────────────────────────────────────────────────────── */
const Projects = () => {
  const stackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section id="projects" className="relative px-6 md:px-12 pt-20 md:pt-28 pb-24 md:pb-32" aria-label="Projects">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeader
          index="02"
          label="Works"
          meta={`${PROJECTS.length} selected projects`}
          titleLines={[
            { text: 'SELECTED' },
            { text: 'WORKS', outline: true },
          ]}
        />

        {/* Sticky stack */}
        <div ref={stackRef} className="space-y-10 md:space-y-16 pb-[8vh]">
          {PROJECTS.map((project, i) => (
            <ProjectCard
              key={project.idx}
              project={project}
              index={i}
              total={PROJECTS.length}
              progress={scrollYProgress}
            />
          ))}
        </div>

        {/* Footer link */}
        <FadeUp className="mt-6 flex items-center justify-between">
          <span className="label-mono">
            {PROJECTS.length} / {PROJECTS.length} deployed · all systems operational
          </span>
          <a
            href="https://github.com/sriram-ravichandran"
            target="_blank"
            rel="noopener noreferrer"
            className="link-sweep inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-ink"
          >
            <Github className="w-4 h-4" />
            More on GitHub
          </a>
        </FadeUp>
      </div>
    </section>
  );
};

export default Projects;
