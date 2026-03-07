import { ProjectStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isErrorResponse, requireUser } from "@/lib/require-role";

const joinSchema = z.object({
  projectId: z.string().min(1)
});

export async function POST(req: Request): Promise<Response> {
  const auth = await requireUser([Role.TESTER]);
  if (isErrorResponse(auth)) return auth;

  try {
    const payload = joinSchema.parse(await req.json());
    const project = await db.project.findUnique({ where: { id: payload.projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (project.status !== ProjectStatus.ACTIVE) {
      return NextResponse.json({ error: "Project is not open for tester joins." }, { status: 409 });
    }

    const joined = await db.testerJoin.upsert({
      where: {
        userId_projectId: {
          userId: auth.user.id,
          projectId: payload.projectId
        }
      },
      update: {
        lastActive: new Date()
      },
      create: {
        userId: auth.user.id,
        projectId: payload.projectId,
        lastActive: new Date()
      }
    });

    return NextResponse.json(joined, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid join payload." }, { status: 400 });
  }
}
