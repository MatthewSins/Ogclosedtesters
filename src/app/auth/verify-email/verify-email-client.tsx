"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";

export function VerifyEmailClient(): JSX.Element {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("idle");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function verify(): Promise<void> {
      if (!token) return;
      setStatus("verifying");
      const res = await fetch(`/api/auth/verify-email?token=${token}`);
      setStatus(res.ok ? "verified" : "failed");
    }

    void verify();
  }, [token]);

  async function resend(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/auth/request-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    setStatus(res.ok ? "sent" : "failed");
  }

  return (
    <main className="grid min-h-screen place-items-center px-6 py-14">
      <GlassCard className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Verify Email</h1>
        <p className="mt-2 text-sm text-slate-300">Use the verification link received by email.</p>

        {token ? (
          <p className="mt-4 text-sm text-slate-200">
            {status === "verifying" ? "Verifying token..." : status === "verified" ? "Email verified. You can sign in." : "Verification failed."}
          </p>
        ) : (
          <form onSubmit={resend} className="mt-5 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white"
            />
            <GlowButton type="submit" className="w-full">
              Send Verification Link
            </GlowButton>
            {status === "sent" ? <p className="text-sm text-emerald-300">If account exists, link sent.</p> : null}
          </form>
        )}

        <Link href="/auth/login" className="mt-6 inline-block text-sm text-cyan-300">
          Back to login
        </Link>
      </GlassCard>
    </main>
  );
}
