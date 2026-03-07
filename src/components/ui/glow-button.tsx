"use client";

import { motion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlowButtonProps = Omit<ComponentProps<typeof motion.button>, "children"> & {
  children?: ReactNode;
};

export function GlowButton({ className, children, ...props }: GlowButtonProps): JSX.Element {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl border border-cyan-300/40",
        "bg-gradient-to-r from-cyan-500 to-indigo-500 px-6 py-3 font-semibold text-white",
        "shadow-neon transition-all duration-300 hover:shadow-violet",
        className
      )}
      {...props}
    >
      <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 blur-md transition-opacity hover:opacity-100" />
      <span className="relative">{children}</span>
    </motion.button>
  );
}
