"use client";

import { motion, useInView } from "framer-motion";
import { useMemo, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  label: string;
  suffix?: string;
}

export function AnimatedCounter({ value, label, suffix }: AnimatedCounterProps): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref, { once: true, margin: "-100px" });
  const display = useMemo(() => (visible ? value : 0), [visible, value]);

  return (
    <div ref={ref} className="rounded-xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur-md">
      <motion.p
        className="text-3xl font-bold text-white"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {display}
        {suffix}
      </motion.p>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-300">{label}</p>
    </div>
  );
}
