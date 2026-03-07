# OG Beta Testers

A futuristic SaaS-style platform for Google Play closed testing workflows.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS + Framer Motion
- NextAuth (email/password credentials)
- Prisma + PostgreSQL

## Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Generate Prisma client + run migration:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Main Routes
- `/` Marketing site
- `/auth/login` Login
- `/auth/register` Signup
- `/app` Role gateway
- `/app/developer` Developer dashboard (real project creation + chat)
- `/app/tester` Tester dashboard (join projects + submit feedback)
- `/app/admin` Admin dashboard (user/project management)

## API Routes
- `POST /api/auth/register`
- `GET /api/me`
- `GET,POST /api/projects`
- `GET,PATCH,DELETE /api/projects/:id`
- `GET,POST /api/feedback`
- `GET,POST /api/chat`
- `GET /api/notifications`
- `POST /api/testers/join`
- `GET /api/admin/overview`
- `GET,PATCH /api/admin/users`
- `GET,PATCH /api/admin/projects`

## Production Checklist
- Add forgot/reset password flow and email verification.
- Add object storage (S3/Cloudinary/Supabase) for screenshot uploads.
- Add payment integration (Stripe) with plan enforcement.
- Add Sentry, analytics, and CI tests.

## Deployment
- Vercel: import repo and set env vars from `.env.example`.
- Netlify: use Next.js runtime and same environment variables.
