import { Activity, BadgeCheck, Bot, Clock3, Smartphone, Users } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

const features = [
  { icon: Users, title: "Real Android Testers", text: "Verified users from real devices and regions." },
  { icon: Clock3, title: "14 Day Requirement Support", text: "Built for Play Console closed testing compliance." },
  { icon: Activity, title: "Active Daily Testing", text: "Track installation and daily engagement signals." },
  { icon: Smartphone, title: "Real Device Coverage", text: "Coverage across Android versions and OEMs." },
  { icon: Bot, title: "Developer + Tester Dashboards", text: "Separate workflows for project owners and testers." },
  { icon: BadgeCheck, title: "Live Progress Tracking", text: "Monitor completion velocity with live analytics." }
];

export function FeatureGrid(): JSX.Element {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Platform Features</p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Everything Needed to Pass Closed Testing</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <GlassCard key={feature.title} className="transition hover:-translate-y-1 hover:border-cyan-300/40">
            <feature.icon className="h-9 w-9 text-cyan-300" />
            <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{feature.text}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
