import { Check } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";

interface PricingCardProps {
  title: string;
  price: string;
  highlighted?: boolean;
  features: string[];
}

export function PricingCard({ title, price, highlighted, features }: PricingCardProps): JSX.Element {
  return (
    <GlassCard
      className={highlighted ? "border-cyan-300/50 bg-gradient-to-b from-cyan-400/15 to-indigo-500/10" : ""}
    >
      <p className="text-sm uppercase tracking-[0.2em] text-slate-300">{title}</p>
      <p className="mt-3 text-4xl font-bold text-white">{price}</p>
      <ul className="mt-5 space-y-3 text-sm text-slate-200">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 text-cyan-300" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <GlowButton className="mt-6 w-full">Choose Plan</GlowButton>
    </GlassCard>
  );
}
