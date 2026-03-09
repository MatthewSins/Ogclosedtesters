import { JoinRequestStatus, ProjectStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isErrorResponse, requireUser } from "@/lib/require-role";

const requestSchema = z.object({
  projectId: z.string().min(1),
  reason: z.string().max(400).optional()
});

export async function GET(): Promise<Response> {
  const auth = await requireUser([Role.TESTER, Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  const requests = await db.joinRequest.findMany({
    where: auth.user.role === Role.TESTER ? { testerId: auth.user.id } : undefined,
    include: {
      project: { select: { id: true, appName: true, status: true } },
      tester: { select: { id: true, name: true, email: true } },
      reviewer: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(requests);
}

export async function POST(req: Request): Promise<Response> {
  const auth = await requireUser([Role.TESTER]);
  if (isErrorResponse(auth)) return auth;

  try {
    const payload = requestSchema.parse(await req.json());
    const project = await db.project.findUnique({ where: { id: payload.projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (project.status !== ProjectStatus.ACTIVE) {
      return NextResponse.json({ error: "Project is not open for requests." }, { status: 409 });
    }

    const existingJoin = await db.testerJoin.findUnique({
      where: { userId_projectId: { userId: auth.user.id, projectId: payload.projectId } }
    });
    if (existingJoin) {
      return NextResponse.json({ error: "Already approved for this project." }, { status: 409 });
    }

    const requestRecord = await db.joinRequest.upsert({
      where: {
        testerId_projectId: {
          testerId: auth.user.id,
          projectId: payload.projectId
        }
      },
      update: {
        reason: payload.reason,
        status: JoinRequestStatus.PENDING,
        reviewedAt: null,
        reviewedById: null
      },
      create: {
        testerId: auth.user.id,
        projectId: payload.projectId,
        reason: payload.reason,
        status: JoinRequestStatus.PENDING
      }
    });

    return NextResponse.json(requestRecord, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid testing request payload." }, { status: 400 });
  }
}
