import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import BootSequence from '@/components/BootSequence';
import CustomCursor from '@/components/CustomCursor';
import ScrollProgress from '@/components/ScrollProgress';
import SectionDivider from '@/components/SectionDivider';
import HUDAlert from '@/components/HUDAlert';
import DataStream from '@/components/DataStream';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import GameOverlay from '@/components/GameOverlay';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Contact from '@/components/sections/Contact';

const Index = () => {
  const [booted, setBooted] = useState(false);
  useSmoothScroll();

  const siteTitle       = 'Sriram Ravichandran | Full-Stack & Backend Engineer';
  const siteDescription = 'Portfolio of Sriram Ravichandran — Full-Stack & Backend Engineer specializing in scalable systems, LLM-powered AI agents, and cloud-native applications.';
  const siteUrl         = 'https://sriram.app';
  const siteImage       = 'https://sriram.app/og-image.png';

  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type':    'Person',
    name:       'Sriram Ravichandran',
    url:        siteUrl,
    sameAs: [
      'https://github.com/sriram-ravichandran',
      'https://linkedin.com/in/sriram-ravichandran',
    ],
    jobTitle: 'Full-Stack & Backend Software Engineer',
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'Illinois Institute of Technology' },
      { '@type': 'CollegeOrUniversity', name: 'Sri Eshwar College of Engineering' },
    ],
  };

  return (
    <ThemeProvider>
      <>
        <BootSequence onComplete={() => setBooted(true)} />
        <CustomCursor />
        <HUDAlert />
        <DataStream />
        <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--wd-bg)' }}>
          <ScrollProgress />

          {/* Ambient cyan glow orbs */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            <motion.div
              className="absolute rounded-full"
              style={{ width: 700, height: 700, background: 'radial-gradient(circle, rgba(0,212,255,0.028) 0%, transparent 65%)', top: '-10%', left: '-15%' }}
              animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,212,255,0.022) 0%, transparent 65%)', bottom: '5%', right: '-10%' }}
              animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
              transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(74,222,128,0.015) 0%, transparent 65%)', top: '40%', right: '20%' }}
              animate={{ x: [0, 20, -10, 0], y: [0, -20, 10, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            />
          </div>
          <Helmet>
            <title>{siteTitle}</title>
            <meta name="description" content={siteDescription} />
            <link rel="canonical" href={siteUrl} />
            <meta property="og:title"       content={siteTitle} />
            <meta property="og:description" content={siteDescription} />
            <meta property="og:image"       content={siteImage} />
            <meta property="og:url"         content={siteUrl} />
            <meta name="twitter:card"       content="summary_large_image" />
            <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
          </Helmet>

          {/* ctOS Neural Network Background */}
          <ParticleBackground />

          {/* Navigation */}
          <div className="relative z-20">
            <Navbar />
          </div>

          {/* ctOS Drive — full-screen car game, press G to start */}
          <GameOverlay />

          {/* Main content */}
          <main className="relative z-10 pt-14">
            <Hero booted={booted} />
            <SectionDivider label="SYS://PROFILE" />
            <About />
            <SectionDivider label="SYS://OPERATIONS" />
            <Projects />
            <SectionDivider label="SYS://CONNECT" />
            <Contact />
          </main>
        </div>
      </>
    </ThemeProvider>
  );
};

export default Index;
