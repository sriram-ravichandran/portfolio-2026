import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
type Point = { x: number; y: number };

const ThemeContext = createContext<{ theme: Theme; toggleTheme: (origin?: Point) => void }>({
  theme: 'dark',
  toggleTheme: () => {},
});

/** Reads the class the inline <head> script already applied (no flash). */
const getInitialTheme = (): Theme =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('light')
    ? 'light'
    : 'dark';

const applyThemeClass = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle('light', theme === 'light');
  root.classList.toggle('dark', theme === 'dark');
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyThemeClass(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch { /* storage unavailable */ }
  }, [theme]);

  const toggleTheme = useCallback((origin?: Point) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      applyThemeClass(next); // synchronous: the view-transition snapshot needs the new colors now
      setTheme(next);
    };

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!doc.startViewTransition || reduced) {
      // Fallback: brief global color transitions
      const root = document.documentElement;
      root.classList.add('theme-anim');
      window.setTimeout(() => root.classList.remove('theme-anim'), 650);
      apply();
      return;
    }

    // Circular reveal sweeping out from the toggle button
    const x = origin?.x ?? window.innerWidth - 48;
    const y = origin?.y ?? 40;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const vt = doc.startViewTransition(apply);
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        {
          duration: 700,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
