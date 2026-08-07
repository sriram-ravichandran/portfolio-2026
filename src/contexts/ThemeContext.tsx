import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
type Point = { x: number; y: number };

const ThemeContext = createContext<{ theme: Theme; toggleTheme: (origin?: Point) => void }>({
  theme: 'dark',
  toggleTheme: () => {},
});

/** Canvas colour per theme, mirrored to <meta name="theme-color">.
 *  Mobile browsers paint their status/address bar from this — leave it stale
 *  and the chrome stays dark for a beat after the page has gone light, which
 *  reads as the switch "catching up". Desktop has no such surface. */
const THEME_COLOR: Record<Theme, string> = {
  dark:  '#0A0A09',
  light: '#F3F0E9',
};

/** Reads the class the inline <head> script already applied (no flash). */
const getInitialTheme = (): Theme =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('light')
    ? 'light'
    : 'dark';

const applyThemeClass = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle('light', theme === 'light');
  root.classList.toggle('dark', theme === 'dark');

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLOR[theme]);
};

/** Phones and tablets — coarse pointer, or simply a narrow viewport. */
const isTouchLike = () =>
  window.matchMedia('(hover: none), (pointer: coarse)').matches || window.innerWidth < 768;

/** @property support; without it the palette triplets can't interpolate. */
const canInterpolateTokens = () =>
  typeof CSS !== 'undefined' && typeof (CSS as { registerProperty?: unknown }).registerProperty === 'function';

type VTDocument = Document & {
  startViewTransition?: (cb: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // A switch already in flight. Tapping again mid-sweep would start a second
  // view transition over the first — on mobile that's the classic "it jumped"
  // stutter, since taps are easy to double-fire.
  const switching = useRef(false);

  useEffect(() => {
    applyThemeClass(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch { /* storage unavailable */ }
  }, [theme]);

  const toggleTheme = useCallback((origin?: Point) => {
    if (switching.current) return;
    switching.current = true;

    const root = document.documentElement;
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      applyThemeClass(next); // synchronous: the view-transition snapshot needs the new colors now
      setTheme(next);
    };

    // Quiets the grain loop, marquees and backdrop blur on touch devices.
    root.classList.add('theme-switching');

    const doc = document as VTDocument;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!doc.startViewTransition || reduced) {
      // Fallback: morph the palette tokens (or blanket-transition on browsers
      // that can't interpolate them).
      root.classList.add(canInterpolateTokens() ? 'theme-anim' : 'theme-anim-legacy');
      apply();
      window.setTimeout(() => {
        root.classList.remove('theme-switching', 'theme-anim', 'theme-anim-legacy');
        switching.current = false;
      }, reduced ? 60 : 520);
      return;
    }

    // Circular reveal sweeping out from the toggle button. Shorter on phones —
    // the sweep covers a smaller viewport, so the desktop duration only leaves
    // more time for a mid-flight frame drop to show.
    const duration = isTouchLike() ? 460 : 700;

    const x = origin?.x ?? window.innerWidth - 48;
    const y = origin?.y ?? 40;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const vt = doc.startViewTransition(apply);

    vt.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          {
            duration,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      })
      .catch(() => { /* transition skipped — cleanup still runs below */ });

    // Release on completion, with a timeout backstop in case the transition is
    // abandoned (background tab, interrupted navigation) and never settles.
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      root.classList.remove('theme-switching');
      switching.current = false;
    };
    vt.finished.then(release).catch(release);
    window.setTimeout(release, duration + 600);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
