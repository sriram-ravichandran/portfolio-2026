import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Constants ──────────────────────────────────────────────────────────────────
const WORLD_W  = 4400;
const ROAD_H   = 136;
const HUD_H    = 40;
export const STRIP_H = ROAD_H + HUD_H;
const CAR_W    = 48;
const CAR_H    = 28;
const MAX_SPD  = 11;
const ACCEL    = 0.55;
const FRICTION = 0.80;
const COLL_R   = 28;

type ItemType = 'skill' | 'xp' | 'project' | 'achievement';

interface Item {
  id: string; wx: number; wy: number;
  color: string; type: ItemType;
  label: string; sub: string;
}

const ITEMS: Item[] = [
  { id: 's1', wx: 310,  wy: 52, color: '#00d4ff', type: 'skill',       label: 'PYTHON',      sub: 'Backend Language'   },
  { id: 's2', wx: 580,  wy: 84, color: '#00d4ff', type: 'skill',       label: 'JAVA',         sub: 'Backend Language'   },
  { id: 's3', wx: 850,  wy: 48, color: '#00d4ff', type: 'skill',       label: 'REACT',        sub: 'Frontend Framework' },
  { id: 's4', wx: 1110, wy: 90, color: '#00d4ff', type: 'skill',       label: 'DOCKER',       sub: 'DevOps Tool'        },
  { id: 'e1', wx: 1540, wy: 64, color: '#ff6a00', type: 'xp',          label: 'NEURALSEEK',   sub: 'AI Agent Developer' },
  { id: 'e2', wx: 1840, wy: 48, color: '#ff6a00', type: 'xp',          label: 'ZOHO CORP',    sub: 'Member Tech Staff'  },
  { id: 'e3', wx: 2140, wy: 90, color: '#ff6a00', type: 'xp',          label: 'ZOHO CORP',    sub: 'Project Trainee'    },
  { id: 'p1', wx: 2640, wy: 60, color: '#4ade80', type: 'project',     label: 'SMARTHOMES',   sub: 'E-commerce + AI'    },
  { id: 'p2', wx: 2940, wy: 86, color: '#4ade80', type: 'project',     label: 'MEDIABRIDGE',  sub: 'P2P Media Sync'     },
  { id: 'p3', wx: 3240, wy: 52, color: '#4ade80', type: 'project',     label: 'CONNECT',      sub: 'Go CLI Tool'        },
  { id: 'a1', wx: 3740, wy: 68, color: '#a855f7', type: 'achievement', label: 'HACKATHON',    sub: 'Interizon — Winner' },
  { id: 'a2', wx: 4080, wy: 84, color: '#a855f7', type: 'achievement', label: 'JURY PANEL',   sub: 'Freshathon 2024'    },
];

const DISTRICTS = [
  { wx: 0,    label: 'DISTRICT 01  IDENTITY'      },
  { wx: 1200, label: 'DISTRICT 02  PROFILE VAULT' },
  { wx: 2400, label: 'DISTRICT 03  OPS ARCHIVE'   },
  { wx: 3400, label: 'DISTRICT 04  COMM NODE'     },
];

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; color: string; size: number;
}

interface PopupState { label: string; sub: string; color: string; }

// ── Round-rect path helper ────────────────────────────────────────────────────
function rr(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

// ── Component ─────────────────────────────────────────────────────────────────
const GameStrip = () => {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const carXRef        = useRef(0);
  const carVXRef       = useRef(0);
  const keysRef        = useRef(new Set<string>());
  const collectedRef   = useRef(new Set<string>());
  const particlesRef   = useRef<Particle[]>([]);
  const animIdRef      = useRef(0);
  const t0Ref          = useRef(performance.now());
  const prevDistRef    = useRef('');
  const frameRef       = useRef(0);
  const popupTimerRef  = useRef<ReturnType<typeof setTimeout>>();

  const [collectedCount, setCollectedCount] = useState(0);
  const [popup,    setPopup]    = useState<PopupState | null>(null);
  const [district, setDistrict] = useState(DISTRICTS[0].label);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = ROAD_H;
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Input ─────────────────────────────────────────────────────────────────
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);

    // ── Helpers inside effect ─────────────────────────────────────────────────
    const spawnParticles = (sx: number, sy: number, color: string) => {
      for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2;
        const spd   = 1.8 + Math.random() * 3.2;
        particlesRef.current.push({
          x: sx, y: sy,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 1.8,
          life: 1,
          color,
          size: 2 + Math.random() * 3,
        });
      }
    };

    const triggerPopup = (item: Item) => {
      setPopup({ label: item.label, sub: item.sub, color: item.color });
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = setTimeout(() => setPopup(null), 3000);
    };

    // ── Game loop ─────────────────────────────────────────────────────────────
    const tick = () => {
      animIdRef.current = requestAnimationFrame(tick);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const W = canvas.width;
      const t = (performance.now() - t0Ref.current) * 0.001;
      frameRef.current++;

      // Physics
      let vx = carVXRef.current;
      if (keysRef.current.has('ArrowRight')) vx = Math.min(vx + ACCEL, MAX_SPD);
      else if (keysRef.current.has('ArrowLeft')) vx = Math.max(vx - ACCEL, -MAX_SPD);
      vx *= FRICTION;
      if (Math.abs(vx) < 0.04) vx = 0;
      carVXRef.current = vx;

      const newCarX = Math.max(0, Math.min(WORLD_W, carXRef.current + vx));
      carXRef.current = newCarX;

      // Scroll sync — instant, bypasses CSS smooth-scroll
      const maxScroll = Math.max(0, document.body.scrollHeight - window.innerHeight);
      document.documentElement.scrollTop = (newCarX / WORLD_W) * maxScroll;

      // Camera: car sits at 35% from left
      const camX  = newCarX - W * 0.35;
      const carSX = newCarX - camX;
      const carSY = ROAD_H * 0.5;

      // Collision
      for (const item of ITEMS) {
        if (collectedRef.current.has(item.id)) continue;
        const isx = item.wx - camX;
        const isy = item.wy;
        if (Math.hypot(carSX - isx, carSY - isy) < COLL_R) {
          collectedRef.current.add(item.id);
          const newCount = collectedRef.current.size;
          setCollectedCount(newCount);
          spawnParticles(isx, isy, item.color);
          triggerPopup(item);
          if (newCount === ITEMS.length) {
            setTimeout(() => setComplete(true), 400);
          }
        }
      }

      // Throttled UI state updates
      if (frameRef.current % 4 === 0) {
        let distLabel = DISTRICTS[0].label;
        for (const d of DISTRICTS) { if (newCarX >= d.wx) distLabel = d.label; }
        if (distLabel !== prevDistRef.current) {
          prevDistRef.current = distLabel;
          setDistrict(distLabel);
        }
        setSpeedKmh(Math.abs(vx) * 18);
      }

      // Update particles
      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          x: p.x + p.vx, y: p.y + p.vy,
          vy: p.vy - 0.14,
          life: p.life - 0.026,
        }))
        .filter(p => p.life > 0);

      // ── Draw ──────────────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, ROAD_H);

      // Road background
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, W, ROAD_H);

      // Asphalt surface
      ctx.fillStyle = '#07090f';
      ctx.fillRect(0, 12, W, ROAD_H - 24);

      // Circuit board grid (subtle)
      ctx.strokeStyle = 'rgba(0,212,255,0.032)';
      ctx.lineWidth = 0.5;
      const G = 40;
      const gox = ((-camX % G) + G) % G;
      for (let x = gox - G; x < W + G; x += G) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ROAD_H); ctx.stroke();
      }
      for (let y = 0; y < ROAD_H; y += G) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Center lane dashes
      const dashLen = 30, gapLen = 22, cycle = dashLen + gapLen;
      ctx.setLineDash([dashLen, gapLen]);
      ctx.lineDashOffset = -(((- camX) % cycle + cycle) % cycle);
      ctx.strokeStyle = 'rgba(255,255,255,0.09)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, ROAD_H / 2);
      ctx.lineTo(W, ROAD_H / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top neon edge line + inner glow
      ctx.strokeStyle = 'rgba(0,212,255,0.72)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(W, 12); ctx.stroke();
      const tg = ctx.createLinearGradient(0, 12, 0, 36);
      tg.addColorStop(0, 'rgba(0,212,255,0.08)');
      tg.addColorStop(1, 'rgba(0,212,255,0)');
      ctx.fillStyle = tg;
      ctx.fillRect(0, 12, W, 24);

      // Bottom edge line
      ctx.strokeStyle = 'rgba(0,212,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, ROAD_H - 12); ctx.lineTo(W, ROAD_H - 12); ctx.stroke();

      // Distance markers
      const MARK = 500;
      const firstMark = Math.ceil(camX / MARK) * MARK;
      ctx.fillStyle = 'rgba(0,212,255,0.2)';
      ctx.font = '7px "Share Tech Mono",monospace';
      ctx.textAlign = 'center';
      for (let wx = firstMark; wx < camX + W + MARK; wx += MARK) {
        const sx = wx - camX;
        ctx.strokeStyle = 'rgba(0,212,255,0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(sx, ROAD_H - 12); ctx.lineTo(sx, ROAD_H - 18); ctx.stroke();
        ctx.fillText(`${wx}m`, sx, ROAD_H - 20);
      }

      // ── Collectibles ─────────────────────────────────────────────────────────
      for (let i = 0; i < ITEMS.length; i++) {
        const item = ITEMS[i];
        if (collectedRef.current.has(item.id)) continue;
        const isx = item.wx - camX;
        if (isx < -50 || isx > W + 50) continue;
        const bob = Math.sin(t * 2.2 + i * 0.75) * 4.5;
        const rot = t * 1.5 + i * 0.55;

        ctx.save();
        ctx.translate(isx, item.wy + bob);
        ctx.rotate(rot);

        // Outer glow
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 24);
        grd.addColorStop(0, item.color + '55');
        grd.addColorStop(1, item.color + '00');
        ctx.fillStyle = grd;
        ctx.fillRect(-24, -24, 48, 48);

        // Diamond body
        const r = 10;
        ctx.beginPath();
        ctx.moveTo(0, -r); ctx.lineTo(r, 0);
        ctx.lineTo(0,  r); ctx.lineTo(-r, 0);
        ctx.closePath();
        ctx.fillStyle = item.color + '28';
        ctx.fill();
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Inner diamond
        const ir = r * 0.44;
        ctx.beginPath();
        ctx.moveTo(0, -ir); ctx.lineTo(ir, 0);
        ctx.lineTo(0,  ir); ctx.lineTo(-ir, 0);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();

        ctx.restore();

        // Label beneath collectible (world-space, no rotation)
        ctx.fillStyle = item.color + 'bb';
        ctx.font = '7px "Share Tech Mono",monospace';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, isx, item.wy + bob + 20);
      }

      // ── Particles ────────────────────────────────────────────────────────────
      for (const p of particlesRef.current) {
        ctx.globalAlpha = p.life * 0.9;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ── Car ──────────────────────────────────────────────────────────────────
      const hw = CAR_W / 2, hh = CAR_H / 2;
      const dir = vx < -0.3 ? -1 : 1; // 1 = facing right

      // Underglow
      const ug = ctx.createRadialGradient(carSX, carSY + 6, 0, carSX, carSY + 6, 46);
      ug.addColorStop(0, 'rgba(0,212,255,0.28)');
      ug.addColorStop(1, 'rgba(0,212,255,0)');
      ctx.fillStyle = ug;
      ctx.fillRect(carSX - 46, carSY - 20, 92, 52);

      // Speed lines
      const spd = Math.abs(vx);
      if (spd > 1.5) {
        ctx.globalAlpha = Math.min(spd / MAX_SPD, 0.65);
        const lineCount = Math.floor(spd * 1.6);
        for (let i = 0; i < lineCount; i++) {
          const ly  = carSY - hh + (i / lineCount) * CAR_H;
          const len = spd * 10 + Math.random() * 14;
          const x0  = dir > 0 ? carSX - hw - len : carSX + hw;
          ctx.strokeStyle = `rgba(0,212,255,${0.22 + Math.random() * 0.38})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(x0, ly);
          ctx.lineTo(x0 + dir * len, ly);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // Body shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      rr(ctx, carSX - hw + 2, carSY - hh + 3, CAR_W, CAR_H, 5);
      ctx.fill();

      // Body
      rr(ctx, carSX - hw, carSY - hh, CAR_W, CAR_H, 5);
      ctx.fillStyle = '#0c1828';
      ctx.fill();
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Roof/cabin inset
      rr(ctx, carSX - hw + 11, carSY - hh + 5, CAR_W - 22, CAR_H - 10, 3);
      ctx.fillStyle = 'rgba(0,18,38,0.88)';
      ctx.fill();

      // Windshield (front side)
      const wsX = dir > 0 ? carSX + hw - 17 : carSX - hw + 5;
      rr(ctx, wsX, carSY - hh + 5, 12, CAR_H - 10, 2);
      ctx.fillStyle = 'rgba(0,212,255,0.22)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,212,255,0.55)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Rear window
      const rwX = dir > 0 ? carSX - hw + 5 : carSX + hw - 17;
      rr(ctx, rwX, carSY - hh + 5, 12, CAR_H - 10, 2);
      ctx.fillStyle = 'rgba(0,212,255,0.07)';
      ctx.fill();

      // Wheels (4 corners, top-down)
      const wheelCols: number[] = [carSX - hw - 3, carSX + hw - 3];
      const wheelRows: number[] = [carSY - hh,     carSY + hh - 5];
      for (const wx_ of wheelCols) {
        for (const wy_ of wheelRows) {
          ctx.fillStyle = '#0e1822';
          ctx.fillRect(wx_, wy_, 6, 5);
          ctx.strokeStyle = 'rgba(139,169,184,0.55)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(wx_, wy_, 6, 5);
          // Hubcap dot
          ctx.fillStyle = 'rgba(0,212,255,0.3)';
          ctx.fillRect(wx_ + 2, wy_ + 1.5, 2, 2);
        }
      }

      // Headlight beams
      const hlX = dir > 0 ? carSX + hw : carSX - hw;
      const hlGrd = ctx.createLinearGradient(hlX, carSY, hlX + dir * 60, carSY);
      hlGrd.addColorStop(0, 'rgba(255,251,200,0.28)');
      hlGrd.addColorStop(1, 'rgba(255,251,200,0)');
      ctx.fillStyle = hlGrd;
      ctx.beginPath();
      ctx.moveTo(hlX,            carSY - hh + 5);
      ctx.lineTo(hlX + dir * 60, carSY - hh - 7);
      ctx.lineTo(hlX + dir * 60, carSY + hh + 7);
      ctx.lineTo(hlX,            carSY + hh - 5);
      ctx.closePath();
      ctx.fill();

      // Headlight dots
      ctx.fillStyle = '#fffbe8';
      ctx.beginPath(); ctx.arc(hlX, carSY - hh + 7,  2.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(hlX, carSY + hh - 7,  2.2, 0, Math.PI * 2); ctx.fill();

      // Taillight glow (red)
      const tlX = dir > 0 ? carSX - hw : carSX + hw;
      const tlGrd = ctx.createRadialGradient(tlX, carSY, 0, tlX, carSY, 22);
      tlGrd.addColorStop(0, 'rgba(255,42,42,0.55)');
      tlGrd.addColorStop(1, 'rgba(255,42,42,0)');
      ctx.fillStyle = tlGrd;
      ctx.fillRect(tlX - 14, carSY - 14, 28, 28);

      // Cyan accent stripe on car body
      ctx.strokeStyle = 'rgba(0,212,255,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(carSX - hw + 11, carSY);
      ctx.lineTo(carSX + hw - 11, carSY);
      ctx.stroke();
    };

    tick();

    return () => {
      cancelAnimationFrame(animIdRef.current);
      clearTimeout(popupTimerRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
    };
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────
  const filledBars = collectedCount;

  return (
    <>
      {/* Collection popup */}
      <AnimatePresence>
        {popup && (
          <motion.div
            key={popup.label + popup.sub}
            className="fixed left-1/2 z-50 flex items-center gap-3 px-4 py-2.5"
            style={{
              bottom: STRIP_H + 12,
              transform: 'translateX(-50%)',
              background: 'rgba(4,8,18,0.96)',
              border: `1px solid ${popup.color}55`,
              backdropFilter: 'blur(14px)',
              boxShadow: `0 0 28px ${popup.color}22`,
              whiteSpace: 'nowrap',
            }}
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          >
            <span
              className="w-5 h-5 flex items-center justify-center font-mono text-[9px] shrink-0"
              style={{ color: popup.color, border: `1px solid ${popup.color}50` }}
            >
              ◆
            </span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.22em]" style={{ color: popup.color }}>
                FILE ACQUIRED — {popup.label}
              </p>
              <p className="font-mono text-[8px] tracking-[0.14em] text-[#8ba9b8]/50 mt-0.5">
                {popup.sub}
              </p>
            </div>
            <span className="font-mono text-[8px] tracking-widest text-[#4ade80]/65 ml-1">✓</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mission complete banner */}
      <AnimatePresence>
        {complete && (
          <motion.div
            className="fixed left-1/2 z-50 flex flex-col items-center gap-1 px-8 py-4"
            style={{
              bottom: STRIP_H + 60,
              transform: 'translateX(-50%)',
              background: 'rgba(4,8,18,0.97)',
              border: '1px solid rgba(74,222,128,0.5)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 0 40px rgba(74,222,128,0.2)',
              whiteSpace: 'nowrap',
            }}
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <p className="font-mono text-[11px] tracking-[0.3em] text-[#4ade80]">
              FULL ACCESS GRANTED
            </p>
            <p className="font-mono text-[8px] tracking-[0.2em] text-[#8ba9b8]/45 mt-0.5">
              ALL {ITEMS.length} FILES COLLECTED — ctOS PROFILE UNLOCKED
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Road strip */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 select-none"
        style={{ height: STRIP_H }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: ROAD_H }}
        />

        {/* HUD bar */}
        <div
          className="flex items-center justify-between gap-4 px-4"
          style={{
            height: HUD_H,
            background: 'rgba(3,5,10,0.98)',
            borderTop: '1px solid rgba(0,212,255,0.18)',
          }}
        >
          {/* District label */}
          <span className="font-mono text-[8px] tracking-[0.2em] text-[#00d4ff]/50 shrink-0 hidden sm:block">
            {district}
          </span>

          {/* File progress bars */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            <span className="font-mono text-[7px] tracking-[0.18em] text-[#8ba9b8]/30 shrink-0">
              FILES
            </span>
            <div className="flex gap-[3px]">
              {ITEMS.map((item, i) => (
                <div
                  key={item.id}
                  className="transition-all duration-500"
                  style={{
                    width:      6,
                    height:     10,
                    background: i < filledBars ? item.color : 'rgba(0,212,255,0.1)',
                    boxShadow:  i < filledBars ? `0 0 6px ${item.color}80` : 'none',
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-[8px] tracking-[0.12em] shrink-0"
              style={{ color: collectedCount === ITEMS.length ? '#4ade80' : 'rgba(0,212,255,0.45)' }}>
              {collectedCount}/{ITEMS.length}
            </span>
          </div>

          {/* Speed + hint */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-[8px] tabular-nums text-[#8ba9b8]/30">
              {Math.round(speedKmh)}<span className="text-[6px] ml-0.5">km/h</span>
            </span>
            <span className="font-mono text-[7px] tracking-[0.16em] text-[#8ba9b8]/18 hidden lg:block">
              ← → TO DRIVE
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameStrip;
