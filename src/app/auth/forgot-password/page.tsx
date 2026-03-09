"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";

export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatus("sending");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    setStatus(res.ok ? "sent" : "failed");
  }

  return (
    <main className="grid min-h-screen place-items-center px-6 py-14">
      <GlassCard className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white"
          />
          <GlowButton type="submit" className="w-full">Send Reset Link</GlowButton>
        </form>
        {status === "sent" ? <p className="mt-3 text-sm text-emerald-300">If account exists, reset link was sent.</p> : null}
        {status === "failed" ? <p className="mt-3 text-sm text-rose-300">Failed to send reset link.</p> : null}
        <Link href="/auth/login" className="mt-5 inline-block text-sm text-cyan-300">Back to login</Link>
      </GlassCard>
    </main>
  );
}
