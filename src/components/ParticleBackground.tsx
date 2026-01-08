import { useEffect, useRef, useState } from 'react';

// Local implementation of useTheme to replace the missing external import
// Now watches for class changes on document.documentElement for Tailwind compatibility
const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    // Initial check
    updateTheme();

    // Create an observer to watch for class changes on the html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return { theme };
};

const ParticleCanvas = ({ currentTheme }: { currentTheme: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const themeRef = useRef(currentTheme);

  // Keep theme ref in sync
  useEffect(() => {
    themeRef.current = currentTheme;
  }, [currentTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { 
      alpha: false, 
      antialias: false,
      powerPreference: 'high-performance'
    });
    if (!gl) return;

    let w = window.innerWidth;
    let h = window.innerHeight;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w;
      canvas!.height = h;
      gl!.viewport(0, 0, w, h);
    }
    resize();
    window.addEventListener('resize', resize);

    // Vertex Shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute float a_size;
      attribute float a_opacity;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      
      varying float v_opacity;
      
      void main() {
        vec2 pos = a_position / u_resolution * 2.0 - 1.0;
        pos.y = -pos.y;
        
        gl_Position = vec4(pos, 0.0, 1.0);
        gl_PointSize = a_size;
        v_opacity = a_opacity;
      }
    `;

    // Fragment Shader
    const fragmentShaderSource = `
      precision mediump float;
      
      uniform vec3 u_color;
      varying float v_opacity;
      
      void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        
        if (dist > 0.5) discard;
        
        float alpha = smoothstep(0.5, 0.0, dist) * v_opacity;
        gl_FragColor = vec4(u_color, alpha);
      }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    const sizeLoc = gl.getAttribLocation(program, 'a_size');
    const opacityLoc = gl.getAttribLocation(program, 'a_opacity');
    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const colorLoc = gl.getUniformLocation(program, 'u_color');

    const config = {
      particleCount: 400,
      baseSpeed: 0.2,
      focalLength: 600,
    };

    interface Particle {
      x: number;
      y: number;
      z: number;
      size: number;
      vx: number;
      vy: number;
      life: number;
      opacity: number;
    }

    const particles: Particle[] = [];

    function createParticle(): Particle {
      return {
        x: Math.random() * w - w / 2,
        y: Math.random() * h - h / 2,
        z: Math.random() * 2000 - 1000,
        size: Math.random() * 3 + 2.0,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.5 + 0.5,
      };
    }

    for (let i = 0; i < config.particleCount; i++) {
      particles.push(createParticle());
    }

    let mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX - w / 2;
      mouse.y = e.clientY - h / 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const positionBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();
    const opacityBuffer = gl.createBuffer();

    gl.enable(gl.BLEND);

    function draw() {
      const time = Date.now() * 0.001;
      
      // Get current theme dynamically from ref
      const isDark = themeRef.current === 'dark';
      
      // Recalculate theme-dependent values each frame
      const particleColor = isDark 
        ? [1.0, 0.88, 0.35]      // Gold RGB for dark mode
        : [0.90, 0.45, 0.10];   // Darker amber/orange RGB for light mode

      const bgColor = isDark
        ? [0.05, 0.05, 0.05]  // Very dark for dark mode
        : [0.94, 0.94, 0.94];    // Pure white for light mode

      // Update blending mode dynamically based on theme
      if (isDark) {
        gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE); // Additive for dark mode
      } else {
        gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA); // Normal for light mode
      }

      particles.forEach(p => {
        const noise = Math.sin(p.y * 0.002 + time) * Math.cos(p.x * 0.002 + time);
        
        p.x += p.vx + Math.cos(time * 0.5 + p.y * 0.005) * 0.5;
        p.y -= config.baseSpeed + Math.abs(noise) * 0.5;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 200 && dist > 0) {
            const force = (200 - dist) / 200;
            p.x += (dx/dist) * force * 2;
            p.y += (dy/dist) * force * 2;
        }

        if (p.y < -h / 1.5) p.y = h / 1.5;
        if (p.x > w / 1.5) p.x = -w / 1.5;
        if (p.x < -w / 1.5) p.x = w / 1.5;
        
        p.z -= 0.5;
        if(p.z < -1000) p.z = 1000;
      });

      particles.sort((a, b) => a.z - b.z);

      // Clear with dynamically calculated background color
      gl!.clearColor(bgColor[0], bgColor[1], bgColor[2], 1.0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      const positions: number[] = [];
      const sizes: number[] = [];
      const opacities: number[] = [];

      particles.forEach(p => {
        const scale = config.focalLength / (config.focalLength + p.z);
        const x2d = w / 2 + p.x * scale;
        const y2d = h / 2 + p.y * scale;
        const visualSize = p.size * scale;
        const sparkle = Math.sin(time * 3 + p.life) * 0.2 + 0.8;
        
        let opacity = p.opacity * sparkle;
        let size = visualSize;
        
        if (!isDark) {
          opacity *= 1.2;
          opacity = Math.min(opacity, 0.9);
        }
        
        if (p.z < -200) {
          size *= 1.5;
          opacity *= 0.6;
        } else if (p.z > 300) {
          size *= 2;
          opacity *= 0.5;
        }

        positions.push(x2d, y2d);
        sizes.push(size * 2);
        opacities.push(opacity);
      });

      gl!.bindBuffer(gl!.ARRAY_BUFFER, positionBuffer);
      gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array(positions), gl!.DYNAMIC_DRAW);
      gl!.enableVertexAttribArray(positionLoc);
      gl!.vertexAttribPointer(positionLoc, 2, gl!.FLOAT, false, 0, 0);

      gl!.bindBuffer(gl!.ARRAY_BUFFER, sizeBuffer);
      gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array(sizes), gl!.DYNAMIC_DRAW);
      gl!.enableVertexAttribArray(sizeLoc);
      gl!.vertexAttribPointer(sizeLoc, 1, gl!.FLOAT, false, 0, 0);

      gl!.bindBuffer(gl!.ARRAY_BUFFER, opacityBuffer);
      gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array(opacities), gl!.DYNAMIC_DRAW);
      gl!.enableVertexAttribArray(opacityLoc);
      gl!.vertexAttribPointer(opacityLoc, 1, gl!.FLOAT, false, 0, 0);

      gl!.uniform2f(resolutionLoc, w, h);
      gl!.uniform1f(timeLoc, time);
      gl!.uniform3fv(colorLoc, particleColor);

      gl!.drawArrays(gl!.POINTS, 0, particles.length);

      animationFrameRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentTheme]); // Added currentTheme to dependencies to force refresh on theme change

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ backgroundColor: currentTheme === 'dark' ? '#050505' : '#ffffff' }}
    />
  );
};

const ParticleBackground = () => {
  const { theme } = useTheme();

  return (
    <>
      <div 
        className="fixed inset-0 -z-10 pointer-events-none transition-colors duration-300"
        style={{ backgroundColor: theme === 'dark' ? '#050505' : '#ffffff' }}
      />
      <ParticleCanvas currentTheme={theme} />
    </>
  );
};

export default ParticleBackground;