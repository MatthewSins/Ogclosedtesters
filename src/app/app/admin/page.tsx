"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { GlassCard } from "@/components/ui/glass-card";

type Overview = {
  totalUsers: number;
  activeProjects: number;
  developers: number;
  testers: number;
  completionRate: number;
  pendingReviews: number;
};

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: "DEVELOPER" | "TESTER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
};

type ProjectRow = {
  id: string;
  appName: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "PAUSED";
  _count: { testerJoins: number; feedback: number };
  developer: { name: string | null; email: string | null };
};

export default function AdminDashboard(): JSX.Element {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [error, setError] = useState("");

  async function loadData(): Promise<void> {
    setError("");
    const [overviewRes, usersRes, projectsRes] = await Promise.all([
      fetch("/api/admin/overview", { cache: "no-store" }),
      fetch("/api/admin/users", { cache: "no-store" }),
      fetch("/api/admin/projects", { cache: "no-store" })
    ]);

    if (!overviewRes.ok || !usersRes.ok || !projectsRes.ok) {
      setError("Could not load admin data. Ensure your account has ADMIN role.");
      return;
    }

    setOverview((await overviewRes.json()) as Overview);
    setUsers((await usersRes.json()) as UserRow[]);
    setProjects((await projectsRes.json()) as ProjectRow[]);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleStatusChange(userId: string, status: "ACTIVE" | "SUSPENDED"): Promise<void> {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status })
    });

    if (!res.ok) {
      setError("Failed to update user status.");
      return;
    }

    await loadData();
  }

  async function handleProjectStatusChange(projectId: string, status: ProjectRow["status"]): Promise<void> {
    const res = await fetch("/api/admin/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, status })
    });

    if (!res.ok) {
      setError("Failed to update project status.");
      return;
    }

    await loadData();
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-5 px-6 py-10 lg:grid-cols-[250px_1fr] lg:px-10">
      <DashboardSidebar />
      <section className="space-y-5">
        <GlassCard>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="mt-1 text-slate-300">Approve, suspend, and monitor all platform activity.</p>
          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        </GlassCard>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <GlassCard className="p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Active Projects</p>
            <p className="mt-2 text-3xl font-bold text-white">{overview?.activeProjects ?? 0}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Developers</p>
            <p className="mt-2 text-3xl font-bold text-white">{overview?.developers ?? 0}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Testers</p>
            <p className="mt-2 text-3xl font-bold text-white">{overview?.testers ?? 0}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Completion Rate</p>
            <p className="mt-2 text-3xl font-bold text-white">{overview?.completionRate ?? 0}%</p>
          </GlassCard>
        </div>

        <GlassCard>
          <h3 className="text-xl font-semibold text-white">User Management</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead>
                <tr className="border-b border-white/10 text-cyan-200">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/10">
                    <td className="px-3 py-2">{user.name ?? "-"}</td>
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">{user.role}</td>
                    <td className="px-3 py-2">{user.status}</td>
                    <td className="px-3 py-2">
                      {user.status === "ACTIVE" ? (
                        <button
                          onClick={() => void handleStatusChange(user.id, "SUSPENDED")}
                          className="rounded bg-rose-500 px-3 py-1 text-white"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => void handleStatusChange(user.id, "ACTIVE")}
                          className="rounded bg-emerald-500 px-3 py-1 text-white"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-xl font-semibold text-white">Project Management</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead>
                <tr className="border-b border-white/10 text-cyan-200">
                  <th className="px-3 py-2">App</th>
                  <th className="px-3 py-2">Developer</th>
                  <th className="px-3 py-2">Testers</th>
                  <th className="px-3 py-2">Feedback</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-white/10">
                    <td className="px-3 py-2">{project.appName}</td>
                    <td className="px-3 py-2">{project.developer.name ?? project.developer.email ?? "-"}</td>
                    <td className="px-3 py-2">{project._count.testerJoins}</td>
                    <td className="px-3 py-2">{project._count.feedback}</td>
                    <td className="px-3 py-2">
                      <select
                        value={project.status}
                        onChange={(event) => void handleProjectStatusChange(project.id, event.target.value as ProjectRow["status"])}
                        className="rounded bg-white/10 px-2 py-1"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="PAUSED">PAUSED</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </section>
    </main>
  );
}
