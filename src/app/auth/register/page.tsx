"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: String(formData.get("role") ?? "DEVELOPER")
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Registration failed.");
      setLoading(false);
      return;
    }

    router.push("/auth/login");
  }

  return (
    <main className="grid min-h-screen place-items-center px-6 py-14">
      <GlassCard className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Create Account</h1>
        <p className="mt-1 text-sm text-slate-300">Start your closed testing project in minutes.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            name="name"
            required
            placeholder="Full name"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300"
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Password"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300"
          />
          <select
            name="role"
            className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-300"
          >
            <option value="DEVELOPER">Developer</option>
            <option value="TESTER">Tester</option>
          </select>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <GlowButton type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </GlowButton>
        </form>
        <p className="mt-4 text-sm text-slate-300">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-cyan-300">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </main>
  );
}
