import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
}

const AnimatedParticles = ({ weatherCondition }: { weatherCondition: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: Particle[] = [];

    const createParticles = (count: number, createParticle: () => Particle) => {
      for (let i = 0; i < count; i++) {
        particles.push(createParticle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.speed;
        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    switch (weatherCondition) {
      case 'Rain':
        createParticles(100, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: Math.random() * 2 + 1,
          size: Math.random() * 2 + 1
        }));
        break;
      case 'Snow':
        createParticles(100, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: Math.random() * 1 + 0.5,
          size: Math.random() * 3 + 1
        }));
        break;
      case 'Clear':
        createParticles(150, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: 0,
          size: Math.random() * 1.5
        }));
        break;
      default:
        break;
    }

    if (particles.length > 0) {
      animate();
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [weatherCondition]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 -z-10" />;
};

export default AnimatedParticles;