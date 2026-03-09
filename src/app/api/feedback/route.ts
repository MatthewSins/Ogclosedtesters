import { MediaType, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isErrorResponse, requireUser } from "@/lib/require-role";

const feedbackSchema = z.object({
  projectId: z.string().min(1),
  text: z.string().min(10).max(2000),
  screenshot: z.string().url().optional(),
  attachmentUrl: z.string().url().optional(),
  attachmentType: z.nativeEnum(MediaType).optional(),
  rating: z.coerce.number().int().min(1).max(5).default(5)
});

function dayBounds(input: Date): { start: Date; end: Date } {
  const start = new Date(input);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function GET(req: Request): Promise<Response> {
  const auth = await requireUser([Role.DEVELOPER, Role.TESTER, Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const whereClause = projectId ? { projectId } : {};
  const feedback = await db.feedback.findMany({
    where: whereClause,
    include: {
      user: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, appName: true, developerId: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const filtered = feedback.filter((item) => {
    if (auth.user.role === Role.ADMIN) return true;
    if (auth.user.role === Role.DEVELOPER) return item.project.developerId === auth.user.id;
    return item.userId === auth.user.id;
  });

  return NextResponse.json(filtered);
}

export async function POST(req: Request): Promise<Response> {
  const auth = await requireUser([Role.TESTER, Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  const ip = getClientIp(req);
  const rate = checkRateLimit(`feedback:${auth.user.id}:${ip}`, 20, 60_000);
  if (!rate.ok) {
    return NextResponse.json({ error: `Too many feedback requests. Try again in ${rate.retryAfter}s.` }, { status: 429 });
  }

  try {
    const payload = feedbackSchema.parse(await req.json());
    const project = await db.project.findUnique({ where: { id: payload.projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (auth.user.role === Role.TESTER) {
      const joined = await db.testerJoin.findUnique({
        where: {
          userId_projectId: {
            userId: auth.user.id,
            projectId: payload.projectId
          }
        }
      });

      if (!joined) {
        return NextResponse.json({ error: "You need admin-approved access before submitting feedback." }, { status: 403 });
      }

      const { start, end } = dayBounds(new Date());
      const duplicate = await db.feedback.findFirst({
        where: {
          projectId: payload.projectId,
          userId: auth.user.id,
          createdAt: {
            gte: start,
            lt: end
          }
        }
      });

      if (duplicate) {
        return NextResponse.json({ error: "Only one feedback submission per project per day is allowed." }, { status: 409 });
      }
    }

    const feedback = await db.feedback.create({
      data: {
        projectId: payload.projectId,
        text: payload.text,
        screenshot: payload.screenshot,
        attachmentUrl: payload.attachmentUrl,
        attachmentType: payload.attachmentType,
        rating: payload.rating,
        userId: auth.user.id
      }
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid feedback payload." }, { status: 400 });
  }
}
