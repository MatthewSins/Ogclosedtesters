"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-6 py-14">
      <GlassCard className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Sign In</h1>
        <p className="mt-1 text-sm text-slate-300">Access your OG Beta Testers dashboard.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            placeholder="Password"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300"
          />
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <GlowButton type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </GlowButton>
        </form>
        <p className="mt-4 text-sm text-slate-300">
          New here?{" "}
          <Link href="/auth/register" className="text-cyan-300">
            Create account
          </Link>
        </p>
      </GlassCard>
    </main>
  );
}
