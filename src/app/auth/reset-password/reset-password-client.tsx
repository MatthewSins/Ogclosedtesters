"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";

export function ResetPasswordClient(): JSX.Element {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatus("submitting");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });

    setStatus(res.ok ? "done" : "failed");
  }

  return (
    <main className="grid min-h-screen place-items-center px-6 py-14">
      <GlassCard className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white"
          />
          <GlowButton type="submit" className="w-full">Reset Password</GlowButton>
        </form>
        {status === "done" ? <p className="mt-3 text-sm text-emerald-300">Password updated. You can sign in now.</p> : null}
        {status === "failed" ? <p className="mt-3 text-sm text-rose-300">Invalid or expired reset token.</p> : null}
        <Link href="/auth/login" className="mt-5 inline-block text-sm text-cyan-300">Back to login</Link>
      </GlassCard>
    </main>
  );
}
