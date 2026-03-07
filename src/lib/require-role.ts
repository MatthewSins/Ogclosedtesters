import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export interface AuthorizedUser {
  id: string;
  role: Role;
  email?: string | null;
  name?: string | null;
}

export async function requireUser(allowedRoles?: Role[]): Promise<{ user: AuthorizedUser } | Response> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return {
    user: {
      id: session.user.id,
      role: session.user.role,
      email: session.user.email,
      name: session.user.name
    }
  };
}

export function isErrorResponse(value: Response | { user: AuthorizedUser }): value is Response {
  return value instanceof Response;
}
