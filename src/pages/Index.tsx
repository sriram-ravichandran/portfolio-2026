import { Helmet } from 'react-helmet-async'; // <--- Import this
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import AmbientLight from '@/components/AmbientLight';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Contact from '@/components/sections/Contact';

const Index = () => {
  useSmoothScroll();

  // --- SEO CONFIGURATION ---
  const siteTitle = "Sriram Ravichandran | Full Stack Developer";
  const siteDescription = "Official portfolio of Sriram Ravichandran. Specialized in React, Node.js, and modern web technologies. View my projects and contact me.";
  const siteUrl = "https://sriramravichandran.in";
  const siteImage = "https://sriramravichandran.in/og-image.png"; 

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Sriram Ravichandran",
    "url": siteUrl,
    "sameAs": [
      "https://github.com/yourusername", // Update these links!
      "https://linkedin.com/in/yourusername"
    ],
    "jobTitle": "Full Stack Developer",
    "worksFor": {
      "@type": "Organization",
      "name": "Freelance"
    }
  };
  // -------------------------

  return (
    <div className="relative min-h-screen text-foreground overflow-x-hidden">
      
      {/* SEO HEAD TAGS */}
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <link rel="canonical" href={siteUrl} />
        
        {/* Social Media Previews */}
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={siteImage} />
        <meta property="og:url" content={siteUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* Google Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      </Helmet>

      {/* VISUAL CONTENT (Your original code) */}
      
      {/* Particle Background */}
      <ParticleBackground />

      {/* Ambient mouse-following light */}
      <AmbientLight />
      
      {/* Navigation */}
      <div className="relative z-20">
        <Navbar />
      </div>
      
      {/* Main content */}
      <main className="relative z-10">
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
    </div>
  );
};

export default Index;