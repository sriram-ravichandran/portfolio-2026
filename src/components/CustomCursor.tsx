import { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const hovered = useRef(false);
  const visible = useRef(false);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    const dot = dotRef.current!;
    const ringEl = ringRef.current!;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible.current) {
        visible.current = true;
        dot.style.opacity = '1';
        ringEl.style.opacity = '1';
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      hovered.current = !!(
        t.closest('a') || t.closest('button') || t.closest('[role="button"]') ||
        t.closest('input') || t.closest('textarea') || t.closest('select')
      );
    };

    const onLeave = () => {
      visible.current = false;
      dot.style.opacity = '0';
      ringEl.style.opacity = '0';
    };

    const loop = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.15;
      ring.current.y += (pos.current.y - ring.current.y) * 0.15;

      dot.style.transform = `translate(${pos.current.x - 3}px, ${pos.current.y - 3}px)`;

      const size = hovered.current ? 52 : 36;
      const half = size / 2;
      ringEl.style.width = `${size}px`;
      ringEl.style.height = `${size}px`;
      ringEl.style.transform = `translate(${ring.current.x - half}px, ${ring.current.y - half}px)`;
      ringEl.style.borderColor = hovered.current
        ? 'rgba(0,212,255,0.7)'
        : 'rgba(0,212,255,0.35)';

      raf = requestAnimationFrame(loop);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Inner dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#00d4ff',
          boxShadow: '0 0 8px rgba(0,212,255,0.8)',
          zIndex: 9998, opacity: 0,
          transition: 'opacity 0.2s',
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '1.5px solid rgba(0,212,255,0.35)',
          zIndex: 9998, opacity: 0,
          transition: 'width 0.25s ease, height 0.25s ease, border-color 0.25s ease, opacity 0.2s',
        }}
      />
    </>
  );
};

export default CustomCursor;
