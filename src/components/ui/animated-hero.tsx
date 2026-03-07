"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Rocket, ShieldCheck } from "lucide-react";
import { BackgroundParticles } from "@/components/ui/background-particles";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";

export function AnimatedHero(): JSX.Element {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-28 lg:px-10">
      <BackgroundParticles />
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
            <Rocket className="h-4 w-4" />
            Google Play Closed Testing
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Launch Your App on Google Play Faster
            </h1>
            <p className="max-w-xl text-lg text-slate-300">
              Get real testers for Google Play Closed Testing and meet the 14-day requirement with ease.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth/register">
              <GlowButton>
                Start Testing
                <ArrowRight className="ml-2 h-4 w-4" />
              </GlowButton>
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              View Pricing
            </Link>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-300">
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
              Verified tester network
            </div>
            <span>14-day compliance workflow</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute -left-8 top-10 h-36 w-36 rounded-full bg-cyan-500/30 blur-3xl" />
          <div className="absolute -right-10 bottom-10 h-44 w-44 rounded-full bg-violet-500/30 blur-3xl" />

          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5, ease: "easeInOut" }}
            className="absolute -left-3 top-16 z-10 h-56 w-28 rounded-[2rem] border border-cyan-200/40 bg-slate-900/70 p-2 shadow-neon backdrop-blur-lg"
          >
            <div className="h-full rounded-[1.5rem] border border-white/15 bg-gradient-to-b from-cyan-300/20 to-indigo-500/20 p-2">
              <div className="mb-2 h-2 w-10 rounded-full bg-white/20" />
              <div className="space-y-2">
                <div className="h-10 rounded-lg bg-white/10" />
                <div className="h-16 rounded-lg bg-cyan-300/20" />
                <div className="h-8 rounded-lg bg-white/10" />
              </div>
            </div>
          </motion.div>

          <div className="relative ml-10 grid gap-4">
            <GlassCard className="animate-float">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-cyan-200">Live Project</p>
              <h3 className="text-lg font-semibold text-white">AI Budget Planner</h3>
              <div className="mt-5 h-2 rounded-full bg-white/10">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
              </div>
              <p className="mt-2 text-sm text-slate-300">15/20 testers joined | Day 9/14</p>
            </GlassCard>
            <GlassCard className="ml-8 border-violet-300/30">
              <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Dashboard Preview</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-white/10 p-3 text-center text-sm text-cyan-100">
                  <p className="text-2xl font-bold">97%</p>
                  <p>Active testers</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3 text-center text-sm text-cyan-100">
                  <p className="text-2xl font-bold">14d</p>
                  <p>Countdown</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3 text-center text-sm text-cyan-100">
                  <p className="text-2xl font-bold">42</p>
                  <p>Feedback</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
