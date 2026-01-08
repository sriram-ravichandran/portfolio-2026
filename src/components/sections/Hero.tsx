import { motion } from "framer-motion";
import SplitText from "@/components/SplitText";
import { ArrowDown } from "lucide-react";
const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden text-foreground transition-colors duration-300">
      {" "}
      {/* Background subtle gradient */}{" "}
      <div className="absolute inset-0 from-transparent via-transparent to-background/50 pointer-events-none" />{" "}
      <div className="max-w-6xl mx-auto text-center relative z-10">
        {" "}
        {/* Label */}{" "}
        <motion.p
          className="label mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {" "}
          Full-Stack Developer{" "}
        </motion.p>{" "}
        {/* Headline */}{" "}
        {/* Added responsive text sizes: text-5xl (mobile) -> sm:text-7xl -> md:text-8xl (desktop) */}{" "}
        <h1 className="headline-xl text-4xl sm:text-6xl md:text-8xl mb-6 uppercase leading-[0.85] tracking-tighter">
          {" "}
          {/* SRIRAM – Adaptive Gradient */}{" "}
          <SplitText
            text="SRIRAM"
            delay={0.7}
            className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/40"
          />{" "}
          <br /> {/* RAVICHANDRAN – Adaptive Gradient */}{" "}
          <SplitText
            text="RAVICHANDRAN"
            delay={0.7}
            className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/40"
          />{" "}
        </h1>{" "}
        {/* Subheadline */}{" "}
        <motion.p
          className="body-lg text-muted-foreground max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {" "}
          Building scalable systems, LLM-powered agents, and cloud-native applications
          with precision and purpose.{" "}
        </motion.p>{" "}
        {/* Location */}{" "}
        <motion.p
          className="text-sm text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          {" "}
          Chicago, IL{" "}
        </motion.p>{" "}
      </div>{" "}
      {/* Scroll indicator */}{" "}
      <motion.div
        className="absolute bottom-12 left-0 right-0 flex justify-center items-center pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        {" "}
        <motion.a
          href="#about"
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors pointer-events-auto"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          {" "}
          <span className="text-xs uppercase tracking-[0.2em]">
            Scroll
          </span>{" "}
          <ArrowDown className="w-4 h-4" />{" "}
        </motion.a>{" "}
      </motion.div>{" "}
    </section>
  );
};
export default Hero;
