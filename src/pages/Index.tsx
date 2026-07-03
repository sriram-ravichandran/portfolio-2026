import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import Preloader from '@/components/Preloader';
import Cursor from '@/components/Cursor';
import Grain from '@/components/Grain';
import GridLines from '@/components/GridLines';
import DotField from '@/components/DotField';
import ScrollProgress from '@/components/ScrollProgress';
import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Contact from '@/components/sections/Contact';

const Index = () => {
  const [booted, setBooted] = useState(false);
  useSmoothScroll();

  const siteTitle       = 'Sriram Ravichandran | Full-Stack & Backend Engineer';
  const siteDescription = 'Portfolio of Sriram Ravichandran — Full-Stack & Backend Engineer specializing in scalable systems, LLM-powered AI agents, and cloud-native applications.';
  const siteUrl         = 'https://sriramravichandran.in';
  const siteImage       = 'https://sriramravichandran.in/og-image.png';

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
    <MotionConfig reducedMotion="user">
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

      <Preloader onComplete={() => setBooted(true)} />
      <Cursor />
      <Grain />
      <ScrollProgress />
      <Navbar booted={booted} />

      <main className="relative" style={{ background: 'var(--bg)' }}>
        <GridLines />
        <DotField />
        <Hero booted={booted} />
        <About />
        <Projects />
        <Contact />
      </main>
    </MotionConfig>
    </ThemeProvider>
  );
};

export default Index;
