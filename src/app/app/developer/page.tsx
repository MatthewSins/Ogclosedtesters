"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressTracker } from "@/components/ui/progress-tracker";

type Project = {
  id: string;
  appName: string;
  appLink: string;
  durationDays: number;
  targetTesters: number;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "PAUSED";
  startDate: string;
  _count: {
    testerJoins: number;
    feedback: number;
  };
};

type ChatMessage = {
  id: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentType?: "IMAGE" | "VIDEO" | null;
  mentionHandles: string[];
  user: { name: string | null; email: string | null };
};

function daysElapsed(startDate: string): number {
  const start = new Date(startDate).getTime();
  const now = Date.now();
  return Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
}

function parseMentions(input: string): string[] {
  const matches = input.match(/@[a-zA-Z0-9_.-]+/g) ?? [];
  return Array.from(new Set(matches.map((item) => item.slice(1).toLowerCase())));
}

export default function DeveloperDashboard(): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatAttachmentUrl, setChatAttachmentUrl] = useState("");
  const [chatAttachmentType, setChatAttachmentType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadProjects(): Promise<void> {
    setLoading(true);
    setError("");
    const res = await fetch("/api/projects", { cache: "no-store" });
    if (!res.ok) {
      setError("Failed to load projects.");
      setLoading(false);
      return;
    }

    const data = (await res.json()) as Project[];
    setProjects(data);
    setSelectedProjectId((prev) => prev || data[0]?.id || "");
    setLoading(false);
  }

  async function loadChat(projectId: string): Promise<void> {
    if (!projectId) {
      setChatMessages([]);
      return;
    }

    const res = await fetch(`/api/chat?projectId=${projectId}`, { cache: "no-store" });
    if (!res.ok) {
      setChatMessages([]);
      return;
    }

    setChatMessages((await res.json()) as ChatMessage[]);
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  useEffect(() => {
    void loadChat(selectedProjectId);
  }, [selectedProjectId]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId]
  );

  const totals = useMemo(() => {
    return projects.reduce(
      (acc, project) => {
        acc.testers += project._count.testerJoins;
        acc.feedback += project._count.feedback;
        return acc;
      },
      { testers: 0, feedback: 0 }
    );
  }, [projects]);

  async function handleCreateProject(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      appName: String(formData.get("appName") ?? ""),
      appLink: String(formData.get("appLink") ?? ""),
      groupLink: String(formData.get("groupLink") ?? ""),
      durationDays: Number(formData.get("durationDays") ?? 14),
      targetTesters: Number(formData.get("targetTesters") ?? 12),
      testerInstructions: String(formData.get("testerInstructions") ?? "")
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      setError("Could not create project.");
      setFormLoading(false);
      return;
    }

    event.currentTarget.reset();
    await loadProjects();
    setFormLoading(false);
  }

  async function handleSendMessage(): Promise<void> {
    if (!selectedProjectId || !chatInput.trim()) return;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: selectedProjectId,
        content: chatInput.trim(),
        attachmentUrl: chatAttachmentUrl || undefined,
        attachmentType: chatAttachmentUrl ? chatAttachmentType : undefined,
        mentionHandles: parseMentions(chatInput)
      })
    });

    if (!res.ok) {
      setError("Failed to send message.");
      return;
    }

    setChatInput("");
    setChatAttachmentUrl("");
    await loadChat(selectedProjectId);
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-5 px-6 py-10 lg:grid-cols-[250px_1fr] lg:px-10">
      <DashboardSidebar />
      <section className="space-y-5">
        <GlassCard>
          <h1 className="text-2xl font-bold text-white">Developer Dashboard</h1>
          <p className="mt-1 text-slate-300">Create projects and monitor admin-approved tester activity.</p>
          <form onSubmit={handleCreateProject} className="mt-6 grid gap-3 md:grid-cols-2">
            <input name="appName" required className="rounded-lg bg-white/5 p-3 text-white" placeholder="App name" />
            <input name="appLink" required className="rounded-lg bg-white/5 p-3 text-white" placeholder="Google Play testing link" />
            <input name="groupLink" className="rounded-lg bg-white/5 p-3 text-white" placeholder="Google group link (optional)" />
            <input name="durationDays" type="number" min={1} max={30} className="rounded-lg bg-white/5 p-3 text-white" defaultValue={14} />
            <input name="targetTesters" type="number" min={1} max={200} className="rounded-lg bg-white/5 p-3 text-white" defaultValue={12} />
            <textarea name="testerInstructions" className="rounded-lg bg-white/5 p-3 text-white md:col-span-2" rows={4} placeholder="Instructions for testers" />
            <button disabled={formLoading} className="rounded-lg bg-cyan-500 px-5 py-2 font-medium text-white md:col-span-2">
              {formLoading ? "Creating..." : "Create Project"}
            </button>
          </form>
          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        </GlassCard>

        <GlassCard>
          <h3 className="text-xl font-semibold text-white">Your Projects</h3>
          {loading ? (
            <p className="mt-3 text-slate-300">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="mt-3 text-slate-300">No projects yet.</p>
          ) : (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`rounded-lg border p-4 text-left ${selectedProjectId === project.id ? "border-cyan-300/50 bg-cyan-400/10" : "border-white/15 bg-white/5"}`}
                >
                  <p className="font-semibold text-white">{project.appName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.15em] text-cyan-200">{project.status}</p>
                  <p className="mt-2 text-sm text-slate-300">{project._count.testerJoins}/{project.targetTesters} testers | {project._count.feedback} feedback</p>
                </button>
              ))}
            </div>
          )}
        </GlassCard>

        {selectedProject ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <ProgressTracker
              day={Math.min(daysElapsed(selectedProject.startDate), selectedProject.durationDays)}
              totalDays={selectedProject.durationDays}
              testersJoined={selectedProject._count.testerJoins}
              testersTarget={selectedProject.targetTesters}
            />
            <GlassCard>
              <h3 className="text-xl font-semibold text-white">Portfolio Stats</h3>
              <ul className="mt-4 space-y-2 text-slate-300">
                <li>Total projects: {projects.length}</li>
                <li>Total testers joined: {totals.testers}</li>
                <li>Total feedback submissions: {totals.feedback}</li>
                <li>Selected project status: {selectedProject.status}</li>
              </ul>
            </GlassCard>
          </div>
        ) : null}

        <GlassCard>
          <h3 className="text-xl font-semibold text-white">Testing Group Chat</h3>
          <div className="mt-4 h-64 space-y-2 overflow-y-auto rounded-lg bg-white/5 p-3 text-sm text-slate-200">
            {chatMessages.length === 0 ? (
              <p className="text-slate-400">No messages yet.</p>
            ) : (
              chatMessages.map((message) => (
                <div key={message.id} className="rounded-lg bg-white/10 p-2">
                  <p className="text-xs text-cyan-200">{message.user.name ?? message.user.email ?? "User"}</p>
                  <p className="mt-1 whitespace-pre-wrap">{message.content}</p>
                  {message.attachmentUrl ? (
                    message.attachmentType === "VIDEO" ? (
                      <video controls className="mt-2 max-h-44 w-full rounded" src={message.attachmentUrl} />
                    ) : (
                      <img className="mt-2 max-h-44 w-full rounded object-cover" src={message.attachmentUrl} alt="Chat attachment" />
                    )
                  ) : null}
                </div>
              ))
            )}
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_180px_130px]">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="rounded-lg bg-white/5 p-3 text-white" placeholder="Message (use @username to tag)" />
            <input value={chatAttachmentUrl} onChange={(e) => setChatAttachmentUrl(e.target.value)} className="rounded-lg bg-white/5 p-3 text-white" placeholder="Attachment URL" />
            <select value={chatAttachmentType} onChange={(e) => setChatAttachmentType(e.target.value as "IMAGE" | "VIDEO")} className="rounded-lg bg-white/5 p-3 text-white">
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>
          <button onClick={() => void handleSendMessage()} className="mt-3 rounded-lg bg-violet-500 px-5 py-2 text-white">Send</button>
        </GlassCard>
      </section>
    </main>
  );
}
