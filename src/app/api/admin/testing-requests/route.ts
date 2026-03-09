import { JoinRequestStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isErrorResponse, requireUser } from "@/lib/require-role";

const reviewSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"])
});

export async function GET(): Promise<Response> {
  const auth = await requireUser([Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  const requests = await db.joinRequest.findMany({
    include: {
      project: { select: { id: true, appName: true, status: true } },
      tester: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(requests);
}

export async function PATCH(req: Request): Promise<Response> {
  const auth = await requireUser([Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  try {
    const payload = reviewSchema.parse(await req.json());
    const requestRecord = await db.joinRequest.findUnique({ where: { id: payload.requestId } });

    if (!requestRecord) {
      return NextResponse.json({ error: "Testing request not found." }, { status: 404 });
    }

    const updated = await db.joinRequest.update({
      where: { id: payload.requestId },
      data: {
        status: payload.status as JoinRequestStatus,
        reviewedById: auth.user.id,
        reviewedAt: new Date()
      }
    });

    if (payload.status === "APPROVED") {
      await db.testerJoin.upsert({
        where: {
          userId_projectId: {
            userId: requestRecord.testerId,
            projectId: requestRecord.projectId
          }
        },
        update: {
          lastActive: new Date()
        },
        create: {
          userId: requestRecord.testerId,
          projectId: requestRecord.projectId,
          lastActive: new Date()
        }
      });
    }

    await db.adminAudit.create({
      data: {
        adminId: auth.user.id,
        action: "REVIEW_TESTER_REQUEST",
        targetType: "JOIN_REQUEST",
        targetId: payload.requestId,
        payload: { status: payload.status }
      }
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid review payload." }, { status: 400 });
  }
}
