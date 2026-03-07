"use client";

import { motion } from "framer-motion";

const particles = Array.from({ length: 32 }, (_, index) => ({
  id: index,
  width: Math.random() * 5 + 2,
  left: Math.random() * 100,
  delay: Math.random() * 6,
  duration: Math.random() * 10 + 8,
  blur: Math.random() * 2
}));

export function BackgroundParticles(): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute top-full rounded-full bg-cyan-400/70"
          style={{
            width: particle.width,
            height: particle.width,
            left: `${particle.left}%`,
            filter: `blur(${particle.blur}px)`
          }}
          animate={{ y: "-110vh", opacity: [0, 0.8, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            delay: particle.delay,
            duration: particle.duration,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}
