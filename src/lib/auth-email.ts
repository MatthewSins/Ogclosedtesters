import crypto from "node:crypto";
import { AuthTokenType, User } from "@prisma/client";
import { Resend } from "resend";
import { db } from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function baseUrl(): string {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function createToken(userId: string, type: AuthTokenType, expiresInMinutes: number): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  await db.authToken.create({
    data: {
      userId,
      token,
      type,
      expiresAt
    }
  });

  return token;
}

async function sendAuthEmail(subject: "VERIFY_EMAIL" | "RESET_PASSWORD", recipient: string, url: string): Promise<void> {
  if (!resend || !process.env.RESEND_FROM_EMAIL) {
    // Safe fallback for local development if Resend vars are missing.
    console.log(`[EMAIL:${subject}] to=${recipient} url=${url}`);
    return;
  }

  const subjectLine = subject === "VERIFY_EMAIL" ? "Verify your OG Beta Testers account" : "Reset your OG Beta Testers password";
  const heading = subject === "VERIFY_EMAIL" ? "Verify your email" : "Reset your password";

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: recipient,
    subject: subjectLine,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #e8ecff; background: #0b1020; padding: 24px; border-radius: 12px;">
        <h2 style="margin-top: 0; color: #79d7ff;">${heading}</h2>
        <p>Use the button below to continue:</p>
        <p>
          <a href="${url}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#3b82f6;color:#fff;text-decoration:none;font-weight:600;">
            Continue
          </a>
        </p>
        <p style="font-size: 13px; color: #b7bfdc;">If the button does not work, open this link:</p>
        <p style="font-size: 13px; color: #b7bfdc; word-break: break-all;">${url}</p>
      </div>
    `
  });
}

export async function issueVerificationToken(user: Pick<User, "id" | "email">): Promise<void> {
  const token = await createToken(user.id, AuthTokenType.VERIFY_EMAIL, 60 * 24);
  const url = `${baseUrl()}/auth/verify-email?token=${token}`;
  await sendAuthEmail("VERIFY_EMAIL", user.email, url);
}

export async function issueResetToken(user: Pick<User, "id" | "email">): Promise<void> {
  const token = await createToken(user.id, AuthTokenType.RESET_PASSWORD, 30);
  const url = `${baseUrl()}/auth/reset-password?token=${token}`;
  await sendAuthEmail("RESET_PASSWORD", user.email, url);
}

export async function consumeToken(token: string, type: AuthTokenType): Promise<{ userId: string } | null> {
  const now = new Date();
  const stored = await db.authToken.findFirst({
    where: {
      token,
      type,
      consumedAt: null,
      expiresAt: { gt: now }
    }
  });

  if (!stored) return null;

  await db.authToken.update({
    where: { id: stored.id },
    data: { consumedAt: now }
  });

  return { userId: stored.userId };
}
