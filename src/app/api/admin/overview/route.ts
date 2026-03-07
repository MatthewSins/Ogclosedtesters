import { ProjectStatus, Role, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isErrorResponse, requireUser } from "@/lib/require-role";

export async function GET(): Promise<Response> {
  const auth = await requireUser([Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  const [totalUsers, activeProjects, developers, testers, completedProjects, pendingReviews] = await Promise.all([
    db.user.count(),
    db.project.count({ where: { status: ProjectStatus.ACTIVE } }),
    db.user.count({ where: { role: Role.DEVELOPER } }),
    db.user.count({ where: { role: Role.TESTER } }),
    db.project.count({ where: { status: ProjectStatus.COMPLETED } }),
    db.user.count({ where: { status: UserStatus.SUSPENDED } })
  ]);

  const completionRate = activeProjects + completedProjects === 0
    ? 0
    : Math.round((completedProjects / (activeProjects + completedProjects)) * 100);

  return NextResponse.json({
    totalUsers,
    activeProjects,
    developers,
    testers,
    completionRate,
    pendingReviews
  });
}
