"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Shield, TestTube2 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app/developer", icon: BarChart3, label: "Developer" },
  { href: "/app/tester", icon: TestTube2, label: "Tester" },
  { href: "/app/admin", icon: Shield, label: "Admin" }
];

export function DashboardSidebar(): JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="h-full rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
      <p className="mb-5 px-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">OG Beta Testers</p>
      <nav className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-200 transition",
                active ? "bg-cyan-400/20 text-cyan-100" : "hover:bg-white/10"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
