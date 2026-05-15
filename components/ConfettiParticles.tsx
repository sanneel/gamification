"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  drag: number;
  life: number;
  maxLife: number;
  shape: "rect" | "circle" | "star";
}

const COLORS = [
  "#FF2D78", "#7C3AED", "#FFD700", "#FF6B35",
  "#00D9FF", "#10B981", "#FF99CC", "#C084FC",
  "#FDE68A", "#A78BFA",
];

function createParticle(x: number, y: number, angle: number, speed: number): Particle {
  const rad = (angle * Math.PI) / 180;
  const jitter = (Math.random() - 0.5) * 60;
  const actualAngle = angle + jitter;
  const actualRad = (actualAngle * Math.PI) / 180;
  const s = speed * (0.6 + Math.random() * 0.8);
  return {
    x, y,
    vx: Math.cos(actualRad) * s,
    vy: Math.sin(actualRad) * s,
    size: 4 + Math.random() * 7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 12,
    gravity: 0.25 + Math.random() * 0.15,
    drag: 0.97,
    life: 1,
    maxLife: 80 + Math.random() * 60,
    shape: ["rect", "circle", "star"][Math.floor(Math.random() * 3)] as Particle["shape"],
  };
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const b = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
    if (i === 0) ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
    else ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    ctx.lineTo(x + (r / 2.5) * Math.cos(b), y + (r / 2.5) * Math.sin(b));
  }
  ctx.closePath();
}

interface Props {
  trigger: boolean;
  origin?: { x: number; y: number };
  count?: number;
  spread?: number;
}

export default function ConfettiParticles({ trigger, origin, count = 140, spread = 360 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ox = origin?.x ?? window.innerWidth / 2;
    const oy = origin?.y ?? window.innerHeight * 0.45;

    // Burst in two waves for realism
    const particles: Particle[] = [];
    const baseAngle = -90; // upward
    for (let i = 0; i < count; i++) {
      const angle = spread === 360
        ? Math.random() * 360
        : baseAngle - spread / 2 + Math.random() * spread;
      particles.push(createParticle(ox, oy, angle, 12 + Math.random() * 8));
    }
    // Second burst slightly delayed
    setTimeout(() => {
      for (let i = 0; i < count * 0.4; i++) {
        const angle = spread === 360
          ? Math.random() * 360
          : baseAngle - spread * 0.4 + Math.random() * spread * 0.8;
        particles.push(createParticle(ox, oy, angle, 8 + Math.random() * 6));
      }
    }, 120);

    particlesRef.current = particles;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of particlesRef.current) {
        if (p.life <= 0) continue;
        alive = true;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.rotation += p.rotationSpeed;
        p.maxLife--;
        p.life = Math.max(0, p.maxLife / (80 + 60));

        const alpha = Math.min(1, p.maxLife / 20);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawStar(ctx, 0, 0, p.size / 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (alive) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animRef.current);
  }, [trigger, origin, count, spread]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[200]"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
