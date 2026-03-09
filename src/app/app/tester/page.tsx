"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { GlassCard } from "@/components/ui/glass-card";

type RequestState = "PENDING" | "APPROVED" | "REJECTED";

type Project = {
  id: string;
  appName: string;
  appLink: string;
  endDate: string;
  _count: { testerJoins: number; feedback: number };
  testerJoins: Array<{ id: string; userId: string; points: number; rating: number }>;
  joinRequests?: Array<{ id: string; status: RequestState }>;
};

type Feedback = { id: string; projectId: string; rating: number };

type ChatMessage = {
  id: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentType?: "IMAGE" | "VIDEO" | null;
  user: { name: string | null; email: string | null };
};

function daysRemaining(endDate: string): number {
  const ms = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function parseMentions(input: string): string[] {
  const matches = input.match(/@[a-zA-Z0-9_.-]+/g) ?? [];
  return Array.from(new Set(matches.map((item) => item.slice(1).toLowerCase())));
}

export default function TesterDashboard(): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackAttachmentUrl, setFeedbackAttachmentUrl] = useState("");
  const [feedbackAttachmentType, setFeedbackAttachmentType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatAttachmentUrl, setChatAttachmentUrl] = useState("");
  const [chatAttachmentType, setChatAttachmentType] = useState<"IMAGE" | "VIDEO">("IMAGE");
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

    const approved = projectData.find((project) => project.testerJoins.length > 0);
    setSelectedProjectId((prev) => prev || approved?.id || "");

    if (feedbackRes.ok) {
      setFeedback((await feedbackRes.json()) as Feedback[]);
    }

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
    void loadData();
  }, []);

  useEffect(() => {
    void loadChat(selectedProjectId);
  }, [selectedProjectId]);

  const approvedProjects = useMemo(
    () => projects.filter((project) => project.testerJoins.length > 0),
    [projects]
  );

  const selectedProject = useMemo(
    () => approvedProjects.find((project) => project.id === selectedProjectId) ?? approvedProjects[0],
    [approvedProjects, selectedProjectId]
  );

  const joinedStats = useMemo(() => {
    const appsJoined = approvedProjects.length;
    const feedbackSubmitted = feedback.length;
    const points = approvedProjects.reduce((acc, project) => acc + (project.testerJoins[0]?.points ?? 0), 0);
    const ratings = approvedProjects.map((project) => project.testerJoins[0]?.rating ?? 5);
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "0.0";
    return { appsJoined, feedbackSubmitted, points, avgRating };
  }, [feedback.length, approvedProjects]);

  async function requestAccess(projectId: string): Promise<void> {
    const res = await fetch("/api/testing-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId })
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Could not submit request.");
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
        rating: feedbackRating,
        attachmentUrl: feedbackAttachmentUrl || undefined,
        attachmentType: feedbackAttachmentUrl ? feedbackAttachmentType : undefined
      })
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Could not submit feedback.");
      return;
    }

    setFeedbackText("");
    setFeedbackRating(5);
    setFeedbackAttachmentUrl("");
    await loadData();
  }

  async function sendChatMessage(): Promise<void> {
    if (!selectedProject || !chatInput.trim()) return;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: selectedProject.id,
        content: chatInput,
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
    await loadChat(selectedProject.id);
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-5 px-6 py-10 lg:grid-cols-[250px_1fr] lg:px-10">
      <DashboardSidebar />
      <section className="space-y-5">
        <GlassCard>
          <h1 className="text-2xl font-bold text-white">Tester Dashboard</h1>
          <p className="mt-1 text-slate-300">Request access to projects. Admin approval is required before testing.</p>
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
                  const approved = project.testerJoins.length > 0;
                  const request = project.joinRequests?.[0];
                  return (
                    <div key={project.id} className="rounded-lg bg-white/5 p-3">
                      <p className="font-medium">{project.appName}</p>
                      <p className="text-slate-300">{project._count.testerJoins} testers approved</p>
                      <a href={project.appLink} target="_blank" rel="noreferrer" className="text-cyan-300">Open install link</a>
                      <div className="mt-2">
                        {approved ? (
                          <span className="rounded bg-emerald-500/20 px-2 py-1 text-emerald-200">Approved</span>
                        ) : request?.status === "PENDING" ? (
                          <span className="rounded bg-amber-500/20 px-2 py-1 text-amber-200">Request Pending</span>
                        ) : request?.status === "REJECTED" ? (
                          <button onClick={() => void requestAccess(project.id)} className="rounded bg-cyan-500 px-3 py-1 text-white">Re-request Access</button>
                        ) : (
                          <button onClick={() => void requestAccess(project.id)} className="rounded bg-cyan-500 px-3 py-1 text-white">Request Access</button>
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
              <li>Approved apps: {joinedStats.appsJoined}</li>
              <li>Feedback submitted: {joinedStats.feedbackSubmitted}</li>
              <li>Points earned: {joinedStats.points}</li>
              <li>Tester rating: {joinedStats.avgRating}/5</li>
              <li>Nearest project end: {selectedProject ? daysRemaining(selectedProject.endDate) : 0} days</li>
            </ul>
          </GlassCard>
        </div>

        <GlassCard>
          <h3 className="text-xl font-semibold text-white">Submit Daily Feedback</h3>
          {approvedProjects.length === 0 ? (
            <p className="mt-3 text-slate-300">No approved projects yet.</p>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-3">
              <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full rounded-lg bg-white/5 p-3 text-white">
                {approvedProjects.map((project) => (
                  <option key={project.id} value={project.id}>{project.appName}</option>
                ))}
              </select>
              <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} required minLength={10} rows={4} className="w-full rounded-lg bg-white/5 p-3 text-white" placeholder="Share bugs, UX friction, reproduction steps" />
              <div className="grid gap-2 md:grid-cols-[120px_1fr_120px]">
                <input type="number" min={1} max={5} value={feedbackRating} onChange={(e) => setFeedbackRating(Number(e.target.value))} className="rounded-lg bg-white/5 p-3 text-white" />
                <input value={feedbackAttachmentUrl} onChange={(e) => setFeedbackAttachmentUrl(e.target.value)} placeholder="Image/video URL (optional)" className="rounded-lg bg-white/5 p-3 text-white" />
                <select value={feedbackAttachmentType} onChange={(e) => setFeedbackAttachmentType(e.target.value as "IMAGE" | "VIDEO")} className="rounded-lg bg-white/5 p-3 text-white">
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>
              <button className="rounded-lg bg-violet-500 px-5 py-2 text-white">Submit Feedback</button>
            </form>
          )}
        </GlassCard>

        <GlassCard>
          <h3 className="text-xl font-semibold text-white">Testing Group Chat</h3>
          {selectedProject ? (
            <>
              <div className="mt-4 h-56 space-y-2 overflow-y-auto rounded-lg bg-white/5 p-3 text-sm text-slate-200">
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
                          <img className="mt-2 max-h-44 w-full rounded object-cover" src={message.attachmentUrl} alt="attachment" />
                        )
                      ) : null}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_180px_120px]">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="rounded-lg bg-white/5 p-3 text-white" placeholder="Message (tag with @username)" />
                <input value={chatAttachmentUrl} onChange={(e) => setChatAttachmentUrl(e.target.value)} className="rounded-lg bg-white/5 p-3 text-white" placeholder="Attachment URL" />
                <select value={chatAttachmentType} onChange={(e) => setChatAttachmentType(e.target.value as "IMAGE" | "VIDEO")} className="rounded-lg bg-white/5 p-3 text-white">
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>
              <button onClick={() => void sendChatMessage()} className="mt-3 rounded-lg bg-cyan-500 px-5 py-2 text-white">Send</button>
            </>
          ) : (
            <p className="mt-3 text-slate-300">Chat unlocks when a project access request is approved.</p>
          )}
        </GlassCard>
      </section>
    </main>
  );
}
