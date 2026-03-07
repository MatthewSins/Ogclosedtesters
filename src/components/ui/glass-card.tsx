import { cn } from "@/lib/utils";

interface GlassCardProps {
  className?: string;
  children: React.ReactNode;
}

export function GlassCard({ className, children }: GlassCardProps): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl shadow-glass",
        className
      )}
    >
      {children}
    </div>
  );
}
