"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Gauge, MessageCircle, Sparkles, Users } from "lucide-react";
import { AnimatedHero } from "@/components/ui/animated-hero";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { FeatureGrid } from "@/components/ui/feature-grid";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { ParallaxSection } from "@/components/ui/parallax-section";
import { PricingCard } from "@/components/ui/pricing-card";

const steps = [
  "Submit your app link",
  "Add our testers via Google Group or email list",
  "Testers install and use the app",
  "Complete 14-day testing requirement",
  "Publish your app on Play Store"
];

const competitorRows = [
  ["Typical Market", "$10-$49", "12-20", "Varies", "Limited"],
  ["OG Beta Testers Starter", "$25", "12", "Yes (14 days)", "Basic"],
  ["OG Beta Testers Professional", "$45", "20", "Yes (14 days)", "Advanced + Tracking"],
  ["OG Beta Testers Pro Developer", "$80", "30", "Yes (14 days)", "Priority + Bug Reports"]
];

export default function HomePage(): JSX.Element {
  return (
    <main className="relative overflow-x-hidden pb-20">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            OG Beta Testers
          </Link>
          <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#features">Features</a>
          </div>
          <Link href="/auth/login" className="text-sm text-cyan-100">
            Sign In
          </Link>
        </div>
      </header>

      <AnimatedHero />

      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 lg:grid-cols-4 lg:px-10">
        <AnimatedCounter value={1200} suffix="+" label="Projects Tested" />
        <AnimatedCounter value={97} suffix="%" label="Completion Rate" />
        <AnimatedCounter value={14} suffix="d" label="Typical Duration" />
        <AnimatedCounter value={4.9} suffix="/5" label="Average Rating" />
      </section>

      <ParallaxSection>
        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">How It Works</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Fast, Structured Closed Testing Workflow</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <GlassCard className="h-full">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-cyan-200">Step {index + 1}</p>
                  <p className="mt-3 text-sm text-slate-100">{step}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>
      </ParallaxSection>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">High-Conversion Plans for Every Stage</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <PricingCard
            title="Starter"
            price="$25"
            features={["12 testers", "14 days testing", "Basic feedback"]}
          />
          <PricingCard
            title="Professional"
            price="$45"
            highlighted
            features={["20 testers", "14 days testing", "Active testers", "Progress tracking"]}
          />
          <PricingCard
            title="Pro Developer"
            price="$80"
            features={["30 testers", "14 days testing", "Bug reports", "Priority support"]}
          />
        </div>

        <GlassCard className="mt-10 overflow-x-auto">
          <h3 className="text-xl font-semibold text-white">Competitor Comparison</h3>
          <table className="mt-5 min-w-full text-left text-sm text-slate-200">
            <thead>
              <tr className="text-cyan-200">
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Testers</th>
                <th className="px-4 py-3">14-Day Compliance</th>
                <th className="px-4 py-3">Support</th>
              </tr>
            </thead>
            <tbody>
              {competitorRows.map((row) => (
                <tr key={row[0]} className="border-t border-white/10">
                  {row.map((cell) => (
                    <td key={cell} className="px-4 py-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </section>

      <FeatureGrid />

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <GlassCard className="grid gap-6 lg:grid-cols-4">
          <div>
            <Gauge className="h-7 w-7 text-cyan-300" />
            <h3 className="mt-3 font-semibold text-white">Live Notifications</h3>
            <p className="mt-2 text-sm text-slate-300">Real-time alerts for tester joins, feedback drops, and milestones.</p>
          </div>
          <div>
            <MessageCircle className="h-7 w-7 text-cyan-300" />
            <h3 className="mt-3 font-semibold text-white">Discord / WhatsApp Ready</h3>
            <p className="mt-2 text-sm text-slate-300">Integrate team communication where your testers already are.</p>
          </div>
          <div>
            <Users className="h-7 w-7 text-cyan-300" />
            <h3 className="mt-3 font-semibold text-white">Automated Tester Assignment</h3>
            <p className="mt-2 text-sm text-slate-300">Use API routes to add testers to projects programmatically.</p>
          </div>
          <div>
            <Sparkles className="h-7 w-7 text-cyan-300" />
            <h3 className="mt-3 font-semibold text-white">SaaS Dashboard</h3>
            <p className="mt-2 text-sm text-slate-300">Developer, tester, and admin portals in one unified platform.</p>
          </div>
        </GlassCard>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 text-center lg:px-10">
        <CheckCircle2 className="mx-auto h-10 w-10 text-cyan-300" />
        <h2 className="mt-5 text-3xl font-bold text-white">Ready to clear Play Console testing requirements?</h2>
        <p className="mt-3 text-slate-300">Start your first closed testing campaign in minutes.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/auth/register">
            <GlowButton>
              Start Testing
              <ArrowRight className="ml-2 h-4 w-4" />
            </GlowButton>
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center rounded-xl border border-white/20 px-6 py-3 text-sm text-white hover:bg-white/10"
          >
            Open Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
