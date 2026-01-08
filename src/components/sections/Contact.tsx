import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github, ArrowUpRight, MapPin, Phone, Instagram } from 'lucide-react';
import MagneticButton from '@/components/MagneticButton';
import MagneticReveal from '@/components/MagneticReveal';
import { cn } from '@/lib/utils';

// --- DATA ---
const socials = [
  {
    label: 'Email',
    href: 'mailto:sriramravichandran02@gmail.com',
    icon: Mail,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/sriram-ravichandran',
    icon: Linkedin,
  },
  {
    label: 'Github',
    href: 'https://www.github.com/sriram-ravichandran',
    icon: Github,
  },
];

const contactDetails = [
  { icon: MapPin, label: 'Chicago, IL', value: 'Open to Relocation' },
  { icon: Phone, label: 'Phone', value: '+1 312 394 9647' },
];

// --- INTERNAL COMPONENT: SPOTLIGHT CARD ---
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setOpacity(1);
  };

  const handleBlur = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleFocus}
      onMouseLeave={handleBlur}
      className={cn(
        // Base styles
        "relative h-full w-full overflow-hidden rounded-3xl border p-8 transition-colors",
        // Light Mode: Semi-transparent white with backdrop blur (frosted glass)
        "border-[rgba(119,119,119,0.2)] bg-[rgba(255,255,255,0.15)] backdrop-blur-sm hover:border-[rgba(217,179,38,0.35)]",
        // Dark Mode: White/10 border, white/5 bg, white spotlight
        "dark:border-white/10 dark:bg-white/5 dark:hover:border-[rgba(217,179,38,0.35)]",
        // CSS Variable for spotlight color (Light = black/5%, Dark = white/6%)
        "[--spotlight-color:rgba(0,0,0,0.05)] dark:[--spotlight-color:rgba(255,255,255,0.06)]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, var(--spotlight-color), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const Contact = () => {
  return (
    <section id="contact" className="relative py-32 px-6 overflow-hidden text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <MagneticReveal className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 backdrop-blur-sm mb-6 dark:border-white/10 dark:bg-white/5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Contact</span>
          </div>
          
          <h2 className="headline-lg mt-2 uppercase leading-[0.85] tracking-tighter text-foreground">
            GET <br />
            {/* Gradient text adapts (Black->Gray in Light, White->Gray in Dark) */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/40">
              CONNECTED.
            </span>
          </h2>
        </MagneticReveal>

        {/* Main Content Card */}
        <div className="max-w-4xl mx-auto">
          <MagneticReveal delay={0.1}>
            <SpotlightCard className="p-12 md:p-16 text-center">
              
              <div className="flex flex-col items-center">
                <p className="text-xl md:text-2xl text-muted-foreground/80 font-light max-w-xl mx-auto mb-10 leading-relaxed">
                  Currently open to new opportunities. <br className="hidden md:block"/>
                  Let's build something remarkable together.
                </p>

                {/* Main CTA */}
                <MagneticButton
                  href="mailto:sriramravichandran02@gmail.com"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-foreground text-background font-semibold text-lg hover:bg-foreground/90 transition-all mb-16 shadow-lg hover:shadow-xl"
                >
                  Get in touch
                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </MagneticButton>

                {/* Divider Line */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-12 dark:via-white/10" />

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-2xl">
                  
                  {/* Left: Contact Info */}
                  <div className="flex flex-col items-start md:items-start gap-6">
                    {contactDetails.map((item) => (
                      <div key={item.label} className="flex items-center gap-4 text-muted-foreground w-full justify-start">
                        <div className="p-2 rounded-full bg-secondary/50 border border-border dark:bg-white/5 dark:border-white/5 flex-shrink-0">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs uppercase tracking-wider opacity-50">{item.label}</p>
                          <p className="text-sm font-medium text-foreground">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right: Social Icons */}
                  <div className="flex flex-col items-start md:items-end gap-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground opacity-50 mb-2">Socials</p>
                    <div className="flex gap-4">
                      {socials.map((social) => (
                        <MagneticButton
                          key={social.label}
                          href={social.href}
                          className="w-12 h-12 rounded-full bg-secondary/50 border border-border flex items-center justify-center hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white dark:hover:text-black dark:hover:border-white"
                        >
                          <social.icon className="w-5 h-5" />
                        </MagneticButton>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </SpotlightCard>
          </MagneticReveal>
        </div>

        {/* Footer */}
        <motion.footer
          className="mt-32 pt-8 border-t border-border dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground/60"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p>© {new Date().getFullYear()} Sriram Ravichandran. All rights reserved.</p>
          <p>Designed & Built with <span className="text-red-500/80">♥</span></p>
        </motion.footer>

      </div>
    </section>
  );
};

export default Contact;