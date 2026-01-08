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

  return (
    <div className="relative min-h-screen text-foreground overflow-x-hidden">
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