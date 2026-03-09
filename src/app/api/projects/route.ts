import { ProjectStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isErrorResponse, requireUser } from "@/lib/require-role";

const projectSchema = z.object({
  appName: z.string().min(2),
  appLink: z.string().url(),
  groupLink: z.string().url().optional().or(z.literal("")),
  durationDays: z.coerce.number().int().min(1).max(30).default(14),
  targetTesters: z.coerce.number().int().min(1).max(200).default(12),
  testerInstructions: z.string().max(2000).optional()
});

function addDays(base: Date, days: number): Date {
  const end = new Date(base);
  end.setDate(end.getDate() + days);
  return end;
}

export async function GET(): Promise<Response> {
  const auth = await requireUser([Role.DEVELOPER, Role.TESTER, Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  const include: {
    developer: { select: { id: true; name: true; email: true } };
    _count: { select: { testerJoins: true; feedback: true; chats: true } };
    testerJoins: {
      where?: { userId: string };
      select: { id: true; userId: true; points: true; rating: true; joinedAt: true };
    };
    joinRequests?: {
      where: { testerId: string };
      select: { id: true; status: true; createdAt: true };
    };
  } = {
    developer: { select: { id: true, name: true, email: true } },
    _count: { select: { testerJoins: true, feedback: true, chats: true } },
    testerJoins: {
      where: auth.user.role === Role.TESTER ? { userId: auth.user.id } : undefined,
      select: { id: true, userId: true, points: true, rating: true, joinedAt: true }
    }
  };

  if (auth.user.role === Role.TESTER) {
    include.joinRequests = {
      where: { testerId: auth.user.id },
      select: { id: true, status: true, createdAt: true }
    };
  }

  if (auth.user.role === Role.DEVELOPER) {
    const projects = await db.project.findMany({
      where: { developerId: auth.user.id },
      include,
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(projects);
  }

  if (auth.user.role === Role.TESTER) {
    const projects = await db.project.findMany({
      where: { status: ProjectStatus.ACTIVE },
      include,
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(projects);
  }

  const projects = await db.project.findMany({
    include,
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request): Promise<Response> {
  const auth = await requireUser([Role.DEVELOPER, Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  try {
    const parsed = projectSchema.parse(await req.json());
    const startDate = new Date();
    const endDate = addDays(startDate, parsed.durationDays);

    const project = await db.project.create({
      data: {
        appName: parsed.appName,
        appLink: parsed.appLink,
        groupLink: parsed.groupLink || null,
        durationDays: parsed.durationDays,
        targetTesters: parsed.targetTesters,
        testerInstructions: parsed.testerInstructions,
        status: ProjectStatus.ACTIVE,
        startDate,
        endDate,
        developerId: auth.user.id
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid project payload." }, { status: 400 });
  }
}
