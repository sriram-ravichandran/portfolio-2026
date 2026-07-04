/**
 * Film-grain overlay — inline SVG noise, gently drifting.
 * Sits above content, below the cursor. Disabled by reduced-motion CSS.
 */
const NOISE =
  `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.15' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const Grain = () => (
  <div className="fixed inset-0 z-[90] pointer-events-none overflow-hidden" aria-hidden="true">
    <div
      className="grain-layer absolute -inset-[10%]"
      style={{
        backgroundImage: NOISE,
        backgroundRepeat: 'repeat',
        opacity: 0.09,
        animation: 'grain-shift 0.8s steps(8) infinite',
      }}
    />
  </div>
);

export default Grain;
