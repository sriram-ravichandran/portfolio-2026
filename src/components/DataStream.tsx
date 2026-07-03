import { useMemo } from 'react';

const COLS = 2;
const ROWS = 80;

function makeColumn(seed: number) {
  const chars = '0123456789ABCDEF·∇∆ΨΦØΔ';
  const r = (n: number) => (seed * 9301 + n * 49297 + 233) % chars.length;
  return Array.from({ length: ROWS }, (_, i) => chars[r(i)]).join('\n');
}

const DataStream = () => {
  const cols = useMemo(() => Array.from({ length: COLS }, (_, i) => makeColumn(i + 7)), []);

  return (
    <>
      {/* Left edge */}
      <div
        className="fixed left-0 top-0 bottom-0 pointer-events-none overflow-hidden hidden xl:flex gap-2 pl-1"
        style={{ zIndex: 5, width: 32 }}
      >
        {cols.map((col, ci) => (
          <div
            key={ci}
            className="font-mono text-[7px] leading-[1.35rem] text-[#00d4ff] whitespace-pre overflow-hidden"
            style={{
              opacity: ci === 0 ? 0.065 : 0.04,
              animation: `wd-stream-up ${18 + ci * 4}s linear infinite`,
              animationDelay: `${-ci * 6}s`,
            }}
          >
            {col + col + col}
          </div>
        ))}
      </div>

      {/* Right edge */}
      <div
        className="fixed right-0 top-0 bottom-0 pointer-events-none overflow-hidden hidden xl:flex gap-2 pr-1 flex-row-reverse"
        style={{ zIndex: 5, width: 32 }}
      >
        {cols.map((col, ci) => (
          <div
            key={ci}
            className="font-mono text-[7px] leading-[1.35rem] text-[#00d4ff] whitespace-pre overflow-hidden"
            style={{
              opacity: ci === 0 ? 0.065 : 0.04,
              animation: `wd-stream-up ${22 + ci * 5}s linear infinite`,
              animationDelay: `${-ci * 8}s`,
            }}
          >
            {col + col + col}
          </div>
        ))}
      </div>
    </>
  );
};

export default DataStream;
