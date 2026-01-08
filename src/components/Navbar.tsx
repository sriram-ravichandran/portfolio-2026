import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    toggleTheme(x, y);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-6 left-0 right-0 z-50 px-6"
      >
        {/* Glassmorphism Capsule 
            - Light Mode: White-ish background with blur
            - Dark Mode: Black-ish background with blur
        */}
        <div className="max-w-3xl mx-auto rounded-full border border-border/40 bg-background/20 dark:bg-black/20 backdrop-blur-lg px-6 py-3 flex items-center justify-between shadow-lg shadow-black/10 dark:shadow-white/10">
          
          {/* Logo */}
          <motion.a
            href="#"
            className="text-lg font-bold tracking-tighter text-foreground"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            SR<span className="text-muted-foreground">.</span>
          </motion.a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground transition-all duration-500 group-hover:w-full" />
              </motion.a>
            ))}
          </div>

          {/* Theme Toggle & Mobile Trigger */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleThemeToggle}
              className="relative w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-foreground/5 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun className="w-4 h-4 text-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon className="w-4 h-4 text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-foreground/5"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Menu className="w-4 h-4 text-foreground" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer (Enhanced Blur) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-md md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] z-[70] bg-background border-l border-border p-12 md:hidden flex flex-col shadow-2xl"
            >
              <div className="flex justify-end mb-16">
                <motion.button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-foreground/5"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-foreground" />
                </motion.button>
              </div>
              <nav className="flex flex-col gap-10">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-5xl font-black tracking-tighter text-foreground"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;