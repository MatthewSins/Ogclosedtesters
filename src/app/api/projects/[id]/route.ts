import { ProjectStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isErrorResponse, requireUser } from "@/lib/require-role";

const updateSchema = z.object({
  status: z.nativeEnum(ProjectStatus).optional(),
  testerInstructions: z.string().max(2000).optional(),
  durationDays: z.coerce.number().int().min(1).max(30).optional(),
  targetTesters: z.coerce.number().int().min(1).max(200).optional()
});

function addDays(base: Date, days: number): Date {
  const end = new Date(base);
  end.setDate(end.getDate() + days);
  return end;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await requireUser([Role.DEVELOPER, Role.TESTER, Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  const { id } = await context.params;
  const project = await db.project.findUnique({
    where: { id },
    include: {
      developer: { select: { id: true, name: true, email: true } },
      testerJoins: {
        select: {
          id: true,
          userId: true,
          points: true,
          daysActive: true,
          rating: true,
          joinedAt: true,
          user: { select: { id: true, name: true, email: true } }
        }
      },
      feedback: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, email: true } } }
      },
      chats: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, email: true } } }
      },
      _count: { select: { testerJoins: true, feedback: true } }
    }
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (auth.user.role === Role.DEVELOPER && project.developerId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (auth.user.role === Role.TESTER) {
    const joined = project.testerJoins.some((join) => join.userId === auth.user.id);
    if (!joined) {
      return NextResponse.json({ error: "Join this project to access details." }, { status: 403 });
    }
  }

  return NextResponse.json(project);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await requireUser([Role.DEVELOPER, Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  const { id } = await context.params;
  const existing = await db.project.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (auth.user.role === Role.DEVELOPER && existing.developerId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const payload = updateSchema.parse(await req.json());
    const durationDays = payload.durationDays ?? existing.durationDays;
    const project = await db.project.update({
      where: { id },
      data: {
        status: payload.status,
        testerInstructions: payload.testerInstructions,
        targetTesters: payload.targetTesters,
        durationDays,
        endDate: payload.durationDays ? addDays(existing.startDate, durationDays) : undefined
      }
    });

    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Could not update project." }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await requireUser([Role.DEVELOPER, Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  const { id } = await context.params;
  const existing = await db.project.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (auth.user.role === Role.DEVELOPER && existing.developerId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
