# OG Beta Testers

A futuristic SaaS-style platform for Google Play closed testing workflows.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS + Framer Motion
- NextAuth (email/password credentials)
- Prisma + PostgreSQL (Supabase compatible)

## Security + Access
- Email verification flow and password reset token flow are implemented.
- Role-gated dashboards:
  - Developer: own projects only
  - Tester: approved testing access only
  - Admin: full platform control

## Tester Approval Workflow
- Tester submits access request for project.
- Admin approves/rejects tester request.
- Only approved testers can test app, chat, and submit feedback.

## Media + Chat
- Group chat supports mentions (`@username`) and image/video URL attachments.
- Feedback supports rating + optional image/video attachment URL.

## Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure env:
   ```bash
   cp .env.example .env
   ```
3. Generate Prisma client + migrate:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Key Routes
- `/` Marketing site
- `/auth/login`
- `/auth/register`
- `/auth/verify-email`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/app/developer`
- `/app/tester`
- `/app/admin`

## Deployment
Set these env vars in Netlify/Vercel:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `REQUIRE_EMAIL_VERIFICATION` (`true` to enforce verified sign-in)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
