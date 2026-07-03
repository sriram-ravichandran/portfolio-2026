import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Node positions in SVG viewBox 0 0 1200 88
const NP: [number, number][] = [
  [28,  44], [138, 18], [248, 70], [370, 38],
  [600, 44],             // centre (index 4) — label lives here
  [740, 62], [862, 20], [978, 68], [1172, 44],
];

// Edges [from, to]
const NE: [number, number][] = [
  [0,1],[1,3],[2,3],[3,4],
  [4,5],[4,6],[5,7],[6,7],[7,8],
];

// Packet route through the graph
const ROUTE = [0, 1, 3, 4, 6, 7, 8];

const SectionDivider = ({ label }: { label?: string }) => {
  const ref    = useRef<HTMLDivElement>(null);
  const pktRef = useRef<SVGCircleElement>(null);
  const glwRef = useRef<SVGCircleElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  // rAF packet travel
  useEffect(() => {
    if (!inView) return;
    let animId: number;
    let t = 0;
    const SPEED = 0.003;
    const total = ROUTE.length - 1;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      t = (t + SPEED) % 1;
      const sf   = t * total;
      const si   = Math.min(Math.floor(sf), total - 1);
      const sp   = sf - si;
      const from = NP[ROUTE[si]];
      const to   = NP[ROUTE[si + 1]];
      const px   = from[0] + (to[0] - from[0]) * sp;
      const py   = from[1] + (to[1] - from[1]) * sp;
      if (pktRef.current) { pktRef.current.setAttribute('cx', String(px)); pktRef.current.setAttribute('cy', String(py)); }
      if (glwRef.current) { glwRef.current.setAttribute('cx', String(px)); glwRef.current.setAttribute('cy', String(py)); }
    };

    // Start after edges finish drawing
    const id = setTimeout(() => { tick(); }, 800);
    return () => { cancelAnimationFrame(animId); clearTimeout(id); };
  }, [inView]);

  return (
    <div ref={ref} className="relative w-full px-4 py-1 select-none" style={{ height: 88 }}>
      <svg
        viewBox="0 0 1200 88"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id="pkt-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="node-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Edges — draw-in animation */}
        {NE.map(([a, b], i) => {
          const [x1, y1] = NP[a];
          const [x2, y2] = NP[b];
          const len = Math.hypot(x2 - x1, y2 - y1);
          return (
            <motion.line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(0,212,255,0.28)"
              strokeWidth={0.9}
              style={{ strokeDasharray: len }}
              initial={{ strokeDashoffset: len }}
              animate={inView ? { strokeDashoffset: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.07, ease: 'easeOut' }}
            />
          );
        })}

        {/* Nodes */}
        {NP.map(([x, y], i) => {
          const isCentre = i === 4;
          return (
            <g key={i}>
              {!isCentre && (
                <motion.circle
                  cx={x} cy={y}
                  fill="rgba(0,212,255,0.07)"
                  stroke="rgba(0,212,255,0.4)"
                  strokeWidth={0.8}
                  filter="url(#node-glow)"
                  initial={{ r: 0 } as never}
                  animate={inView ? { r: 3.8 } as never : {}}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.05, ease: 'backOut' }}
                />
              )}
              {/* Centre label */}
              {isCentre && label && (
                <motion.text
                  x={x} y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(0,212,255,0.55)"
                  fontSize={7}
                  fontFamily='"Share Tech Mono",monospace'
                  letterSpacing="2.5"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.85, duration: 0.4 }}
                >
                  {label}
                </motion.text>
              )}
            </g>
          );
        })}

        {/* Packet glow halo — moved via rAF */}
        <circle ref={glwRef} r={11} fill="rgba(0,212,255,0.13)" cx={-60} cy={-60} />
        {/* Packet core */}
        <circle
          ref={pktRef}
          r={3.5}
          fill="#00d4ff"
          cx={-60} cy={-60}
          filter="url(#pkt-glow)"
        />
      </svg>
    </div>
  );
};

export default SectionDivider;
