import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isErrorResponse, requireUser } from "@/lib/require-role";

export async function GET(): Promise<Response> {
  const auth = await requireUser([Role.DEVELOPER, Role.TESTER, Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  if (auth.user.role === Role.DEVELOPER) {
    const [projects, recentFeedback] = await Promise.all([
      db.project.count({ where: { developerId: auth.user.id } }),
      db.feedback.count({
        where: {
          project: {
            is: {
              developerId: auth.user.id
            }
          },
          createdAt: {
            gte: new Date(Date.now() - 86400000)
          }
        }
      })
    ]);

    return NextResponse.json([
      { id: "d1", text: `${projects} projects currently tracked.`, type: "project" },
      { id: "d2", text: `${recentFeedback} feedback submissions in the last 24 hours.`, type: "feedback" }
    ]);
  }

  if (auth.user.role === Role.TESTER) {
    const joined = await db.testerJoin.count({ where: { userId: auth.user.id } });
    return NextResponse.json([
      { id: "t1", text: `You are active in ${joined} projects.`, type: "project" },
      { id: "t2", text: "Submit one feedback per app daily to improve your rating.", type: "tip" }
    ]);
  }

  const [users, projects] = await Promise.all([db.user.count(), db.project.count()]);
  return NextResponse.json([
    { id: "a1", text: `${users} total users on platform.`, type: "metric" },
    { id: "a2", text: `${projects} total projects across all statuses.`, type: "metric" }
  ]);
}
