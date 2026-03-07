import { GlassCard } from "@/components/ui/glass-card";

interface ProgressTrackerProps {
  day: number;
  totalDays: number;
  testersJoined: number;
  testersTarget: number;
}

export function ProgressTracker({
  day,
  totalDays,
  testersJoined,
  testersTarget
}: ProgressTrackerProps): JSX.Element {
  const dayProgress = Math.min((day / totalDays) * 100, 100);
  const testerProgress = Math.min((testersJoined / testersTarget) * 100, 100);

  return (
    <GlassCard>
      <h3 className="text-xl font-semibold text-white">14-Day Progress Tracker</h3>
      <div className="mt-5 space-y-5">
        <div>
          <p className="mb-1 text-sm text-slate-300">Time Progress ({day}/{totalDays} days)</p>
          <div className="h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" style={{ width: `${dayProgress}%` }} />
          </div>
        </div>
        <div>
          <p className="mb-1 text-sm text-slate-300">Testers Joined ({testersJoined}/{testersTarget})</p>
          <div className="h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" style={{ width: `${testerProgress}%` }} />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
