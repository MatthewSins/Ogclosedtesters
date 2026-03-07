"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { GlassCard } from "@/components/ui/glass-card";

type Project = {
  id: string;
  appName: string;
  appLink: string;
  durationDays: number;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "PAUSED";
  testerInstructions: string | null;
  _count: { testerJoins: number; feedback: number };
  testerJoins: Array<{ id: string; userId: string; points: number; rating: number }>;
};

type Feedback = {
  id: string;
  projectId: string;
  rating: number;
};

function daysRemaining(endDate: string): number {
  const ms = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function TesterDashboard(): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData(): Promise<void> {
    setLoading(true);
    setError("");

    const [projectsRes, feedbackRes] = await Promise.all([
      fetch("/api/projects", { cache: "no-store" }),
      fetch("/api/feedback", { cache: "no-store" })
    ]);

    if (!projectsRes.ok) {
      setError("Failed to load projects.");
      setLoading(false);
      return;
    }

    const projectData = (await projectsRes.json()) as Project[];
    setProjects(projectData);
    setSelectedProjectId((prev) => prev || projectData.find((project) => project.testerJoins.length > 0)?.id || "");

    if (feedbackRes.ok) {
      setFeedback((await feedbackRes.json()) as Feedback[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const joinedProjects = useMemo(
    () => projects.filter((project) => project.testerJoins.length > 0),
    [projects]
  );

  const selectedProject = useMemo(
    () => joinedProjects.find((project) => project.id === selectedProjectId) ?? joinedProjects[0],
    [joinedProjects, selectedProjectId]
  );

  const joinedStats = useMemo(() => {
    const appsJoined = joinedProjects.length;
    const feedbackSubmitted = feedback.length;
    const points = joinedProjects.reduce((acc, project) => acc + (project.testerJoins[0]?.points ?? 0), 0);
    const ratings = joinedProjects.map((project) => project.testerJoins[0]?.rating ?? 5);
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "0.0";
    return { appsJoined, feedbackSubmitted, points, avgRating };
  }, [feedback.length, joinedProjects]);

  async function handleJoin(projectId: string): Promise<void> {
    const res = await fetch("/api/testers/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId })
    });

    if (!res.ok) {
      setError("Could not join project.");
      return;
    }

    await loadData();
  }

  async function handleFeedbackSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedProject) return;

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: selectedProject.id,
        text: feedbackText,
        rating: feedbackRating
      })
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Could not submit feedback.");
      return;
    }

    setFeedbackText("");
    setFeedbackRating(5);
    await loadData();
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-5 px-6 py-10 lg:grid-cols-[250px_1fr] lg:px-10">
      <DashboardSidebar />
      <section className="space-y-5">
        <GlassCard>
          <h1 className="text-2xl font-bold text-white">Tester Dashboard</h1>
          <p className="mt-1 text-slate-300">Join active apps, submit feedback, and grow your tester score.</p>
          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        </GlassCard>

        <div className="grid gap-5 lg:grid-cols-2">
          <GlassCard>
            <h3 className="text-xl font-semibold text-white">Available Apps</h3>
            {loading ? (
              <p className="mt-3 text-slate-300">Loading projects...</p>
            ) : (
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                {projects.map((project) => {
                  const joined = project.testerJoins.length > 0;
                  return (
                    <div key={project.id} className="rounded-lg bg-white/5 p-3">
                      <p className="font-medium">{project.appName}</p>
                      <p className="text-slate-300">{project._count.testerJoins} testers joined</p>
                      <a href={project.appLink} target="_blank" rel="noreferrer" className="text-cyan-300">
                        Open install link
                      </a>
                      <div className="mt-2">
                        {joined ? (
                          <span className="rounded bg-emerald-500/20 px-2 py-1 text-emerald-200">Joined</span>
                        ) : (
                          <button onClick={() => void handleJoin(project.id)} className="rounded bg-cyan-500 px-3 py-1 text-white">
                            Join Project
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <h3 className="text-xl font-semibold text-white">Your Progress</h3>
            <ul className="mt-4 space-y-2 text-slate-300">
              <li>Apps joined: {joinedStats.appsJoined}</li>
              <li>Feedback submitted: {joinedStats.feedbackSubmitted}</li>
              <li>Points earned: {joinedStats.points}</li>
              <li>Tester rating: {joinedStats.avgRating}/5</li>
              <li>Nearest project end: {selectedProject ? daysRemaining(selectedProject.endDate) : 0} days</li>
            </ul>
          </GlassCard>
        </div>

        <GlassCard>
          <h3 className="text-xl font-semibold text-white">Submit Daily Feedback</h3>
          {joinedProjects.length === 0 ? (
            <p className="mt-3 text-slate-300">Join at least one project to submit feedback.</p>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-3">
              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                className="w-full rounded-lg bg-white/5 p-3 text-white"
              >
                {joinedProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.appName}
                  </option>
                ))}
              </select>
              <textarea
                value={feedbackText}
                onChange={(event) => setFeedbackText(event.target.value)}
                required
                minLength={10}
                rows={4}
                className="w-full rounded-lg bg-white/5 p-3 text-white"
                placeholder="Share bugs, UX friction, and reproduction details"
              />
              <input
                type="number"
                min={1}
                max={5}
                value={feedbackRating}
                onChange={(event) => setFeedbackRating(Number(event.target.value))}
                className="w-28 rounded-lg bg-white/5 p-3 text-white"
              />
              <button className="rounded-lg bg-violet-500 px-5 py-2 text-white">Submit Feedback</button>
            </form>
          )}
        </GlassCard>
      </section>
    </main>
  );
}
