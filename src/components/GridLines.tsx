/**
 * Site-wide editorial column guides — five ultra-faint vertical hairlines
 * aligned to the 1400px content container. Static by design: they give the
 * empty canvas structure without competing with content for attention.
 * Rendered as the first child of <main>, so sections paint on top.
 */
const GridLines = () => (
  <div className="absolute inset-0 pointer-events-none hidden md:block" aria-hidden="true">
    <div className="h-full max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-4">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className={`border-l border-ink/5 ${i === 3 ? 'border-r' : ''}`} />
      ))}
    </div>
  </div>
);

export default GridLines;
