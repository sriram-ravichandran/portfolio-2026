import type { ReactNode } from 'react';

/**
 * Infinite marquee. Content is rendered twice; CSS translates the track -50%.
 * Pauses on hover. Reduced-motion CSS stops the animation entirely.
 */
const Marquee = ({
  children,
  duration = 30,
  reverse = false,
  className = '',
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
}) => (
  <div className={`overflow-hidden marquee-paused ${className}`}>
    <div
      className={`marquee-track ${reverse ? 'reverse' : ''}`}
      style={{ ['--marquee-duration' as string]: `${duration}s` }}
    >
      <div className="flex shrink-0 items-center">{children}</div>
      <div className="flex shrink-0 items-center" aria-hidden="true">{children}</div>
    </div>
  </div>
);

export default Marquee;
