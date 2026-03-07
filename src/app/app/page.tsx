import Link from "next/link";
import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { GlassCard } from "@/components/ui/glass-card";

export default async function AppIndexPage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <GlassCard className="max-w-xl text-center">
          <h1 className="text-2xl font-bold text-white">Sign in required</h1>
          <p className="mt-2 text-slate-300">Please authenticate to access your dashboard workspace.</p>
          <Link href="/auth/login" className="mt-5 inline-block text-cyan-300">
            Go to Sign In
          </Link>
        </GlassCard>
      </main>
    );
  }

  const links = [
    { href: "/app/developer", label: "Developer", enabled: session.user.role === Role.DEVELOPER || session.user.role === Role.ADMIN },
    { href: "/app/tester", label: "Tester", enabled: session.user.role === Role.TESTER || session.user.role === Role.ADMIN },
    { href: "/app/admin", label: "Admin", enabled: session.user.role === Role.ADMIN }
  ] as const;

  return (
    <main className="grid min-h-screen place-items-center px-6 py-14">
      <GlassCard className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white">Welcome back, {session.user.name ?? "User"}</h1>
        <p className="mt-2 text-slate-300">Choose your dashboard based on your workflow role.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {links.map((link) =>
            link.enabled ? (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-white/20 bg-white/5 p-4 text-center text-white hover:bg-white/10"
              >
                {link.label}
              </Link>
            ) : (
              <div key={link.href} className="cursor-not-allowed rounded-xl border border-white/10 bg-white/5 p-4 text-center text-slate-500">
                {link.label}
              </div>
            )
          )}
        </div>
      </GlassCard>
    </main>
  );
}
