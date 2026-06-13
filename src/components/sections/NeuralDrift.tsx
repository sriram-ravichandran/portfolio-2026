import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import MagneticReveal from '@/components/MagneticReveal';

// ─── TYPES ────────────────────────────────────────────────────────────────────
type NodeType = 'project' | 'experience' | 'skill';

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  color: string;
  size: number;
  description?: string;
  meta?: string;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const NODES: GraphNode[] = [
  // Projects — gold
  {
    id: 'smarthomes', label: 'SmartHomes', type: 'project', color: '#F59E0B', size: 0.55,
    description: 'Scalable e-commerce platform with AI-powered shopping assistant, real-time support, and containerized microservices.',
    meta: 'React · MySQL · MongoDB · ElasticSearch · Docker',
  },
  {
    id: 'mediabridge', label: 'MediaBridge', type: 'project', color: '#F59E0B', size: 0.55,
    description: 'Two-node Android media sync with P2P transfers, SHA-256 deduplication, and Google Photos integration.',
    meta: 'Kotlin · Ktor · Jetpack Compose',
  },
  {
    id: 'connect_cli', label: 'Connect', type: 'project', color: '#F59E0B', size: 0.55,
    description: 'Cross-platform Go CLI tool for scanning and snapshotting developer environment configs with drift-checking.',
    meta: 'Go · YAML · JSON · Concurrency',
  },

  // Experience — coral
  {
    id: 'neuralseek', label: 'NeuralSeek', type: 'experience', color: '#FB7185', size: 0.46,
    description: 'AI Agent Developer Intern — Built RAG-powered agents with verifiable data lineage, prompt engineering, and ethical guardrails.',
    meta: 'Oct 2025 – Nov 2025 · Miami, FL (Remote)',
  },
  {
    id: 'zoho', label: 'Zoho Corp', type: 'experience', color: '#FB7185', size: 0.46,
    description: 'Member Technical Staff — Resolved critical MDM security issues affecting 10,000+ Apple devices and drove REST API integration.',
    meta: 'May 2022 – Jul 2023 · Chennai, India',
  },

  // Languages — blue
  { id: 'python',     label: 'Python',     type: 'skill', color: '#60A5FA', size: 0.28 },
  { id: 'java',       label: 'Java',       type: 'skill', color: '#60A5FA', size: 0.26 },
  { id: 'javascript', label: 'JavaScript', type: 'skill', color: '#60A5FA', size: 0.28 },
  { id: 'go',         label: 'Go',         type: 'skill', color: '#60A5FA', size: 0.26 },
  { id: 'kotlin',     label: 'Kotlin',     type: 'skill', color: '#60A5FA', size: 0.26 },
  { id: 'cpp',        label: 'C++',        type: 'skill', color: '#60A5FA', size: 0.22 },

  // Frameworks & AI — purple
  { id: 'react',      label: 'React',           type: 'skill', color: '#C084FC', size: 0.28 },
  { id: 'langgraph',  label: 'LangGraph',        type: 'skill', color: '#C084FC', size: 0.28 },
  { id: 'autogen',    label: 'AutoGen',           type: 'skill', color: '#C084FC', size: 0.26 },
  { id: 'rag',        label: 'RAG',               type: 'skill', color: '#C084FC', size: 0.26 },
  { id: 'ktor',       label: 'Ktor',              type: 'skill', color: '#C084FC', size: 0.22 },
  { id: 'jetpack',    label: 'Jetpack Compose',   type: 'skill', color: '#C084FC', size: 0.22 },
  { id: 'servlets',   label: 'Servlets',          type: 'skill', color: '#C084FC', size: 0.22 },

  // Databases — teal
  { id: 'postgresql',   label: 'PostgreSQL',   type: 'skill', color: '#34D399', size: 0.26 },
  { id: 'mysql',        label: 'MySQL',        type: 'skill', color: '#34D399', size: 0.26 },
  { id: 'mongodb',      label: 'MongoDB',      type: 'skill', color: '#34D399', size: 0.26 },
  { id: 'elasticsearch',label: 'ElasticSearch',type: 'skill', color: '#34D399', size: 0.24 },

  // Cloud & DevOps — amber
  { id: 'docker',     label: 'Docker',     type: 'skill', color: '#FBBF24', size: 0.28 },
  { id: 'kubernetes', label: 'Kubernetes', type: 'skill', color: '#FBBF24', size: 0.26 },
  { id: 'aws',        label: 'AWS',        type: 'skill', color: '#FBBF24', size: 0.28 },
  { id: 'kafka',      label: 'Kafka',      type: 'skill', color: '#FBBF24', size: 0.22 },
  { id: 'azure',      label: 'Azure',      type: 'skill', color: '#FBBF24', size: 0.22 },
];

const EDGES = [
  { from: 'smarthomes',  to: 'react' },
  { from: 'smarthomes',  to: 'servlets' },
  { from: 'smarthomes',  to: 'mysql' },
  { from: 'smarthomes',  to: 'mongodb' },
  { from: 'smarthomes',  to: 'elasticsearch' },
  { from: 'smarthomes',  to: 'docker' },
  { from: 'mediabridge', to: 'kotlin' },
  { from: 'mediabridge', to: 'ktor' },
  { from: 'mediabridge', to: 'jetpack' },
  { from: 'connect_cli', to: 'go' },
  { from: 'neuralseek',  to: 'langgraph' },
  { from: 'neuralseek',  to: 'autogen' },
  { from: 'neuralseek',  to: 'rag' },
  { from: 'neuralseek',  to: 'python' },
  { from: 'zoho',        to: 'java' },
  { from: 'zoho',        to: 'postgresql' },
  { from: 'langgraph',   to: 'python' },
  { from: 'autogen',     to: 'python' },
  { from: 'rag',         to: 'elasticsearch' },
  { from: 'docker',      to: 'kubernetes' },
  { from: 'aws',         to: 'docker' },
  { from: 'docker',      to: 'kafka' },
  { from: 'smarthomes',  to: 'neuralseek' },
  { from: 'javascript',  to: 'react' },
];

const LEGEND = [
  { color: '#F59E0B', label: 'Projects' },
  { color: '#FB7185', label: 'Experience' },
  { color: '#60A5FA', label: 'Languages' },
  { color: '#C084FC', label: 'Frameworks & AI' },
  { color: '#34D399', label: 'Databases' },
  { color: '#FBBF24', label: 'Cloud & DevOps' },
];

const NODE_TYPE_COLOR: Record<NodeType, string> = {
  project: '#F59E0B',
  experience: '#FB7185',
  skill: '#60A5FA',
};

const NODE_TYPE_LABEL: Record<NodeType, string> = {
  project: 'Project',
  experience: 'Experience',
  skill: 'Skill',
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
  }
  return pts;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
const NeuralDrift = () => {
  const containerRef  = useRef<HTMLDivElement>(null);
  const tooltipRef    = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const W = () => container.clientWidth;
    const H = () => container.clientHeight;

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#04040a');
    scene.fog = new THREE.FogExp2('#04040a', 0.018);

    // ── Camera ───────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(60, W() / H(), 0.1, 300);
    camera.position.set(0, 2, 22);

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(W(), H());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // ── Post-processing (bloom) ───────────────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(W(), H()), 1.5, 0.45, 0.0);
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // ── Controls ─────────────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping   = true;
    controls.dampingFactor   = 0.055;
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 0.35;
    controls.minDistance     = 6;
    controls.maxDistance     = 45;
    controls.enablePan       = false;
    controls.addEventListener('start', () => { controls.autoRotate = false; });

    // ── Ambient light ────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x111122, 0.8));

    // ── Starfield ────────────────────────────────────────────────────────────
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) starPositions[i] = (Math.random() - 0.5) * 260;
    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x3b4a6b, size: 0.12, sizeAttenuation: true });
    scene.add(new THREE.Points(starGeom, starMat));

    // ── Node positions (layered fibonacci spheres) ────────────────────────────
    const projects    = NODES.filter(n => n.type === 'project');
    const experiences = NODES.filter(n => n.type === 'experience');
    const skills      = NODES.filter(n => n.type === 'skill');

    const projectPos    = fibonacciSphere(projects.length,    2.8);
    const experiencePos = fibonacciSphere(experiences.length, 5.0);
    const skillPos      = fibonacciSphere(skills.length,      8.2);

    const posMap = new Map<string, THREE.Vector3>();
    projects.forEach((n, i)    => posMap.set(n.id, projectPos[i]));
    experiences.forEach((n, i) => posMap.set(n.id, experiencePos[i]));
    skills.forEach((n, i)      => posMap.set(n.id, skillPos[i]));

    // ── Nodes ─────────────────────────────────────────────────────────────────
    const nodeMeshMap = new Map<string, THREE.Mesh>();
    const toDispose: (THREE.BufferGeometry | THREE.Material)[] = [];

    NODES.forEach((node) => {
      const pos  = posMap.get(node.id)!;
      const geom = new THREE.SphereGeometry(node.size, 32, 32);
      const mat  = new THREE.MeshStandardMaterial({
        color:             new THREE.Color(node.color),
        emissive:          new THREE.Color(node.color),
        emissiveIntensity: node.type === 'project' ? 1.6 : node.type === 'experience' ? 1.3 : 0.85,
        roughness: 0.15,
        metalness: 0.85,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      mesh.userData = { id: node.id };
      scene.add(mesh);
      nodeMeshMap.set(node.id, mesh);
      toDispose.push(geom, mat);
    });

    const nodeMeshes = Array.from(nodeMeshMap.values());

    // ── Edges ─────────────────────────────────────────────────────────────────
    const edgeObjects: THREE.Line[] = [];
    EDGES.forEach((edge) => {
      const a = posMap.get(edge.from);
      const b = posMap.get(edge.to);
      if (!a || !b) return;
      const geom = new THREE.BufferGeometry().setFromPoints([a, b]);
      const mat  = new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.5 });
      const line = new THREE.Line(geom, mat);
      scene.add(line);
      edgeObjects.push(line);
      toDispose.push(geom, mat);
    });

    // ── Pulse particles (InstancedMesh) ───────────────────────────────────────
    const pulseGeom = new THREE.SphereGeometry(0.07, 8, 8);
    const pulseMat  = new THREE.MeshStandardMaterial({ roughness: 0, metalness: 1, emissiveIntensity: 4 });
    const pulseInst = new THREE.InstancedMesh(pulseGeom, pulseMat, EDGES.length);
    pulseInst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(pulseInst);
    toDispose.push(pulseGeom, pulseMat);

    const pulseStates = EDGES.map(() => ({
      progress: Math.random(),
      speed:    0.0018 + Math.random() * 0.0028,
    }));

    const pulseColor = new THREE.Color();
    EDGES.forEach((edge, i) => {
      const fromNode = NODES.find(n => n.id === edge.from);
      pulseColor.set(fromNode?.color ?? '#ffffff');
      pulseInst.setColorAt(i, pulseColor);
    });
    if (pulseInst.instanceColor) pulseInst.instanceColor.needsUpdate = true;

    // ── Raycaster & mouse ─────────────────────────────────────────────────────
    const raycaster  = new THREE.Raycaster();
    const mouse      = new THREE.Vector2(-9999, -9999);
    let hoveredId: string | null = null;

    // Camera look-at target for fly-to
    const lookTarget = new THREE.Vector3();

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    };

    const onClickCanvas = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const cm = new THREE.Vector2(
         ((e.clientX - rect.left) / rect.width)  * 2 - 1,
        -((e.clientY - rect.top)  / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(cm, camera);
      const hits = raycaster.intersectObjects(nodeMeshes);

      if (hits.length > 0) {
        const id   = hits[0].object.userData.id as string;
        const node = NODES.find(n => n.id === id);
        if (node) {
          setSelectedNode(node);
          const connected = new Set<string>();
          EDGES.forEach(edge => {
            if (edge.from === id) connected.add(edge.to);
            if (edge.to   === id) connected.add(edge.from);
          });
          setConnectedIds(connected);
          // Fly camera toward the node
          lookTarget.copy(hits[0].object.position);
        }
      } else {
        setSelectedNode(null);
        setConnectedIds(new Set());
        lookTarget.set(0, 0, 0);
      }
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClickCanvas);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
      composer.setSize(W(), H());
      bloomPass.resolution.set(W(), H());
    };
    window.addEventListener('resize', onResize);

    // ── Animation loop ────────────────────────────────────────────────────────
    let animId: number;
    let t = 0;
    const dummy   = new THREE.Object3D();
    const tempPos = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.01;
      controls.update();

      // Smooth look-at for fly-to
      controls.target.lerp(lookTarget, 0.04);

      // Hover detection
      raycaster.setFromCamera(mouse, camera);
      const hits      = raycaster.intersectObjects(nodeMeshes);
      const newHover  = hits.length > 0 ? (hits[0].object.userData.id as string) : null;

      if (newHover !== hoveredId) {
        hoveredId = newHover;
        container.style.cursor = hoveredId ? 'pointer' : 'default';
      }

      // Tooltip label (direct DOM, no re-render)
      if (tooltipRef.current) {
        if (hoveredId) {
          const mesh = nodeMeshMap.get(hoveredId);
          if (mesh) {
            const sp = mesh.position.clone().project(camera);
            const tx = ((sp.x + 1) / 2) * W();
            const ty = ((-sp.y + 1) / 2) * H();
            tooltipRef.current.style.left    = `${tx}px`;
            tooltipRef.current.style.top     = `${ty - mesh.geometry.parameters.radius * 60 - 18}px`;
            tooltipRef.current.style.opacity = '1';
            tooltipRef.current.textContent   = NODES.find(n => n.id === hoveredId)?.label ?? '';
          }
        } else {
          tooltipRef.current.style.opacity = '0';
        }
      }

      // Animate nodes: pulse scale + emissive
      NODES.forEach((node, i) => {
        const mesh = nodeMeshMap.get(node.id);
        if (!mesh) return;
        const mat    = mesh.material as THREE.MeshStandardMaterial;
        const phase  = i * 0.42;
        const pulse  = 1 + Math.sin(t + phase) * 0.07;
        mesh.scale.setScalar(pulse);

        const isHovered = hoveredId === node.id;
        const targetEI  = isHovered ? 5.0
          : node.type === 'project'    ? 1.6
          : node.type === 'experience' ? 1.3
          : 0.85;
        mat.emissiveIntensity += (targetEI - mat.emissiveIntensity) * 0.12;
      });

      // Edge pulse highlight
      edgeObjects.forEach((line, i) => {
        const mat = line.material as THREE.LineBasicMaterial;
        mat.opacity += (0.5 - mat.opacity) * 0.08;
      });

      // Animate pulse particles along edges
      EDGES.forEach((edge, i) => {
        const state = pulseStates[i];
        state.progress += state.speed;
        if (state.progress > 1) state.progress = 0;

        const fromMesh = nodeMeshMap.get(edge.from);
        const toMesh   = nodeMeshMap.get(edge.to);
        if (!fromMesh || !toMesh) return;

        tempPos.lerpVectors(fromMesh.position, toMesh.position, state.progress);
        dummy.position.copy(tempPos);
        dummy.updateMatrix();
        pulseInst.setMatrixAt(i, dummy.matrix);
      });
      pulseInst.instanceMatrix.needsUpdate = true;

      composer.render();
    };

    animate();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      controls.dispose();
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onClickCanvas);
      window.removeEventListener('resize', onResize);
      toDispose.forEach(o => o.dispose());
      starGeom.dispose();
      starMat.dispose();
      renderer.dispose();
      composer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section id="network" className="relative py-32 px-6 overflow-hidden text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <MagneticReveal className="mb-16 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 backdrop-blur-sm mb-6 dark:border-white/10 dark:bg-white/5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Neural Drift
            </span>
          </div>
          <h2 className="headline-lg mt-2 uppercase leading-[0.85] tracking-tighter text-foreground">
            SKILL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/40">
              NETWORK.
            </span>
          </h2>
          <p className="mt-6 text-muted-foreground text-sm max-w-md">
            Every node is a skill, project, or role. Every edge is a real connection. Explore how it all fits together.
          </p>
        </MagneticReveal>

        {/* Canvas wrapper */}
        <div className="relative rounded-3xl overflow-hidden border border-white/5" style={{ height: '82vh' }}>

          {/* Three.js canvas mount */}
          <div ref={containerRef} className="w-full h-full" />

          {/* Hover tooltip (direct DOM, zero re-renders) */}
          <div
            ref={tooltipRef}
            className="pointer-events-none absolute -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white bg-black/70 backdrop-blur-sm border border-white/10 whitespace-nowrap transition-opacity duration-150"
            style={{ opacity: 0 }}
          />

          {/* Legend */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-2 pointer-events-none select-none">
            {LEGEND.map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
                />
                <span className="text-[11px] text-white/40">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="absolute bottom-6 right-6 text-right pointer-events-none select-none">
            <p className="text-[11px] text-white/25">Drag to rotate · Scroll to zoom</p>
            <p className="text-[11px] text-white/25">Click a node to explore</p>
          </div>

          {/* Info panel */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 30, scale: 0.97 }}
                animate={{ opacity: 1, x: 0,  scale: 1 }}
                exit={{   opacity: 0, x: 30,  scale: 0.97 }}
                transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute top-6 right-6 w-[300px] rounded-2xl border border-white/10 bg-black/65 backdrop-blur-2xl p-6 shadow-2xl"
              >
                {/* Close */}
                <button
                  onClick={() => { setSelectedNode(null); setConnectedIds(new Set()); }}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white/50" />
                </button>

                {/* Type badge */}
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-3 uppercase tracking-wide"
                  style={{
                    backgroundColor: `${NODE_TYPE_COLOR[selectedNode.type]}18`,
                    color:           NODE_TYPE_COLOR[selectedNode.type],
                    border:          `1px solid ${NODE_TYPE_COLOR[selectedNode.type]}35`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: NODE_TYPE_COLOR[selectedNode.type] }}
                  />
                  {NODE_TYPE_LABEL[selectedNode.type]}
                </div>

                {/* Name */}
                <h3 className="text-[1.15rem] font-bold text-white mb-2 pr-6 leading-snug">
                  {selectedNode.label}
                </h3>

                {/* Description */}
                {selectedNode.description && (
                  <p className="text-[13px] text-white/55 leading-relaxed mb-3">
                    {selectedNode.description}
                  </p>
                )}

                {/* Meta */}
                {selectedNode.meta && (
                  <p className="text-[11px] text-white/30 font-mono leading-relaxed">
                    {selectedNode.meta}
                  </p>
                )}

                {/* Connected nodes */}
                {connectedIds.size > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/8">
                    <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2.5">
                      Connected To
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(connectedIds).map(id => {
                        const n = NODES.find(x => x.id === id);
                        if (!n) return null;
                        return (
                          <span
                            key={id}
                            className="text-[11px] px-2 py-0.5 rounded-full border"
                            style={{
                              borderColor:     `${n.color}35`,
                              color:           n.color,
                              backgroundColor: `${n.color}10`,
                            }}
                          >
                            {n.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default NeuralDrift;
