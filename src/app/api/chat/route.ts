import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isErrorResponse, requireUser } from "@/lib/require-role";

const chatSchema = z.object({
  projectId: z.string().min(1),
  content: z.string().min(1).max(1000)
});

async function canAccessProject(projectId: string, userId: string, role: Role): Promise<boolean> {
  if (role === Role.ADMIN) return true;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      testerJoins: {
        where: { userId },
        select: { id: true }
      }
    }
  });

  if (!project) return false;
  if (role === Role.DEVELOPER) return project.developerId === userId;
  if (role === Role.TESTER) return project.testerJoins.length > 0;
  return false;
}

export async function GET(req: Request): Promise<Response> {
  const auth = await requireUser([Role.DEVELOPER, Role.TESTER, Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId required." }, { status: 400 });
  }

  const access = await canAccessProject(projectId, auth.user.id, auth.user.role);
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const chats = await db.chatMessage.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });

  return NextResponse.json(chats);
}

export async function POST(req: Request): Promise<Response> {
  const auth = await requireUser([Role.DEVELOPER, Role.TESTER, Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  const ip = getClientIp(req);
  const rate = checkRateLimit(`chat:${auth.user.id}:${ip}`, 40, 60_000);
  if (!rate.ok) {
    return NextResponse.json({ error: `Too many chat messages. Try again in ${rate.retryAfter}s.` }, { status: 429 });
  }

  try {
    const payload = chatSchema.parse(await req.json());
    const access = await canAccessProject(payload.projectId, auth.user.id, auth.user.role);
    if (!access) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await db.chatMessage.create({
      data: {
        projectId: payload.projectId,
        content: payload.content,
        userId: auth.user.id
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid chat payload." }, { status: 400 });
  }
}
