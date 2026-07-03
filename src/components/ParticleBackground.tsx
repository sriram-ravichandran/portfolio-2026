import { useEffect, useRef } from 'react';

interface Node {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  phase: number;
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let animId: number;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width  = w;
      canvas.height = h;
    };
    resize();

    // ── Nodes ───────────────────────────────────────────────────────────────
    const NODE_COUNT = 65;
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x:     Math.random() * w,
      y:     Math.random() * h,
      vx:    (Math.random() - 0.5) * 0.38,
      vy:    (Math.random() - 0.5) * 0.38,
      size:  Math.random() * 1.8 + 1.2,
      phase: Math.random() * Math.PI * 2,
    }));

    // ── Scan line state ──────────────────────────────────────────────────────
    let scanY      = -60;
    let nextScan   = Date.now() + 4000;
    let scanActive = false;

    // ── Profile ring state ──────────────────────────────────────────────────
    let profileIdx    = -1;
    let profileRadius = 0;
    let nextProfile   = Date.now() + 6000;

    // ── Data packets ──────────────────────────────────────────────────────
    interface Packet { fromIdx: number; toIdx: number; progress: number; speed: number; }
    const packets: Packet[] = [];
    let nextPacket = Date.now() + 2000;
    const MAX_PACKETS = 8;

    // ── Scroll position + velocity for parallax ───────────────────────────
    let scrollY    = 0;
    let scrollVel  = 0;
    let lastScroll = 0;
    const onScroll = () => {
      const delta = window.scrollY - lastScroll;
      scrollVel   = Math.min(Math.abs(delta) * 0.15, 2.5);
      lastScroll  = window.scrollY;
      scrollY     = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Mouse ────────────────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      resize();
      nodes.forEach(n => {
        n.x = Math.min(n.x, w);
        n.y = Math.min(n.y, h);
      });
    };
    window.addEventListener('resize', onResize);

    // ── Draw loop ────────────────────────────────────────────────────────────
    const draw = () => {
      animId = requestAnimationFrame(draw);
      const now = Date.now();
      const t   = now * 0.001;

      // Background
      ctx.fillStyle = '#030507';
      ctx.fillRect(0, 0, w, h);

      // Subtle hex-grid background lines with scroll parallax
      const parallaxShift = scrollY * 0.08;
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.025)';
      ctx.lineWidth = 0.5;
      const grid = 80;
      for (let gx = 0; gx < w; gx += grid) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      const gridOffsetY = parallaxShift % grid;
      for (let gy = -grid + gridOffsetY; gy < h + grid; gy += grid) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }

      // Decay scroll velocity
      scrollVel *= 0.92;

      // Move nodes
      nodes.forEach(n => {
        const speed = 1 + scrollVel;
        n.x += n.vx * speed;
        n.y += n.vy * speed;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        // Mouse repulsion
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 9000 && d2 > 0) {
          const d   = Math.sqrt(d2);
          const f   = (95 - d) / 95;
          n.x += (dx / d) * f * 1.4;
          n.y += (dy / d) * f * 1.4;
        }
      });

      // Draw edges between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 185) {
            const alpha = (1 - dist / 185) * 0.28;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.lineWidth   = 0.5;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((n, i) => {
        const pulse       = 0.55 + Math.sin(t * 1.8 + n.phase) * 0.45;
        const isProfiled  = profileIdx === i;
        const nearMouse   = Math.sqrt((n.x - mouse.x) ** 2 + (n.y - mouse.y) ** 2) < 80;
        const glowR       = n.size * (isProfiled || nearMouse ? 10 : 5);
        const glowAlpha   = pulse * (isProfiled ? 1.0 : nearMouse ? 0.8 : 0.5);

        // Glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        grd.addColorStop(0, `rgba(0, 212, 255, ${glowAlpha})`);
        grd.addColorStop(1, 'rgba(0, 212, 255, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = isProfiled || nearMouse ? '#00d4ff' : `rgba(0, 180, 220, ${pulse * 0.85})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Scan line
      if (scanActive) {
        scanY += 4;
        const sg = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
        sg.addColorStop(0, 'rgba(0,212,255,0)');
        sg.addColorStop(0.5, 'rgba(0,212,255,0.065)');
        sg.addColorStop(1, 'rgba(0,212,255,0)');
        ctx.fillStyle = sg;
        ctx.fillRect(0, scanY - 50, w, 100);

        // Leading edge bright line
        ctx.fillStyle = 'rgba(0,212,255,0.18)';
        ctx.fillRect(0, scanY, w, 1);

        if (scanY > h + 60) {
          scanActive   = false;
          scanY        = -60;
          nextScan     = now + 9000;
        }
      } else if (now > nextScan) {
        scanActive = true;
        scanY      = -60;
      }

      // Profile ring
      if (profileIdx >= 0) {
        const n = nodes[profileIdx];
        profileRadius += 2.5;
        const fadeAlpha = Math.max(0, 1 - profileRadius / 110) * 0.9;

        // Expanding ring
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 212, 255, ${fadeAlpha})`;
        ctx.lineWidth   = 1.5;
        ctx.arc(n.x, n.y, profileRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner dashed ring
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 212, 255, ${Math.min(fadeAlpha * 0.7, 0.5)})`;
        ctx.lineWidth   = 1;
        ctx.arc(n.x, n.y, n.size * 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Corner tick marks
        const tickLen = 8;
        const tickR   = n.size * 6;
        [0, 90, 180, 270].forEach(angle => {
          const rad = (angle * Math.PI) / 180;
          const tx  = n.x + Math.cos(rad) * tickR;
          const ty  = n.y + Math.sin(rad) * tickR;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 212, 255, ${fadeAlpha})`;
          ctx.lineWidth   = 1.5;
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx + Math.cos(rad) * tickLen, ty + Math.sin(rad) * tickLen);
          ctx.stroke();
        });

        if (profileRadius > 120) {
          profileIdx    = -1;
          profileRadius = 0;
          nextProfile   = now + 8000;
        }
      } else if (now > nextProfile) {
        profileIdx    = Math.floor(Math.random() * NODE_COUNT);
        profileRadius = 0;
      }

      // ── Data packets ────────────────────────────────────────────────────
      // Spawn new packets along existing edges
      if (now > nextPacket && packets.length < MAX_PACKETS) {
        // Find a valid edge pair
        for (let attempt = 0; attempt < 10; attempt++) {
          const fi = Math.floor(Math.random() * NODE_COUNT);
          const ti = Math.floor(Math.random() * NODE_COUNT);
          if (fi === ti) continue;
          const pdx = nodes[fi].x - nodes[ti].x;
          const pdy = nodes[fi].y - nodes[ti].y;
          if (Math.sqrt(pdx * pdx + pdy * pdy) < 185) {
            packets.push({ fromIdx: fi, toIdx: ti, progress: 0, speed: 0.008 + Math.random() * 0.008 });
            break;
          }
        }
        nextPacket = now + 1200 + Math.random() * 800;
      }

      // Draw & update packets
      for (let pi = packets.length - 1; pi >= 0; pi--) {
        const pkt = packets[pi];
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1) { packets.splice(pi, 1); continue; }

        const nFrom = nodes[pkt.fromIdx];
        const nTo   = nodes[pkt.toIdx];
        const px    = nFrom.x + (nTo.x - nFrom.x) * pkt.progress;
        const py    = nFrom.y + (nTo.y - nFrom.y) * pkt.progress;

        // Trail
        const trailLen = 4;
        for (let ti = trailLen; ti >= 0; ti--) {
          const tp = Math.max(0, pkt.progress - ti * 0.025);
          const tx = nFrom.x + (nTo.x - nFrom.x) * tp;
          const ty = nFrom.y + (nTo.y - nFrom.y) * tp;
          const ta = (1 - ti / trailLen) * 0.7;
          ctx.fillStyle = `rgba(0, 212, 255, ${ta})`;
          ctx.beginPath();
          ctx.arc(tx, ty, 1.5 - ti * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bright head
        const pgrd = ctx.createRadialGradient(px, py, 0, px, py, 6);
        pgrd.addColorStop(0, 'rgba(0, 212, 255, 0.9)');
        pgrd.addColorStop(1, 'rgba(0, 212, 255, 0)');
        ctx.fillStyle = pgrd;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
};

export default ParticleBackground;
