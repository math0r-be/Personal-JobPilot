# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# JobPilot — Agent Context

## Commands

```bash
npm run dev          # Start dev server (Next.js on port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Push Prisma schema to DB (no migration file)
npm run db:generate  # Regenerate Prisma client after schema change
```

## Architecture

JobPilot is a **100% local, open-source** job search management tool. No external auth, no payments, no third-party services required.

**Tech stack**: Next.js 14 App Router · SQLite (Prisma) · AI providers (OpenRouter/OpenAI/Ollama) · SMTP (Nodemailer)

**Data model** (SQLite, file: `prisma/local.db`):
- `Profile` — local user info (single row, id='local')
- `AiConfig` — AI provider settings (single row, id='active')
- `SmtpConfig` — SMTP server settings (single row, id='active')
- `Cv` — CV documents (content stored as JSON string); optionally linked to a `JobPosting`
- `CoverLetter` — cover letter body (text), always linked to a `Cv` via `cvId`, optionally to a `JobPosting`
- `JobPosting` — job listings with raw text, `parsedData` (JSON string), and status pipeline
- `Email` — email history (draft/sent/error), optionally linked to a `JobPosting`

**AI configuration**: Done via Settings UI. Providers: OpenRouter (default), OpenAI, Ollama (local), Custom endpoint. All use OpenAI SDK with dynamic baseURL.

**Email**: SMTP configurable via Settings UI (Gmail App Password, Outlook, etc.). No external service required.

**API routes** (no auth — local tool):
- `GET/POST /api/cvs` — list or create CVs
- `GET/PUT/DELETE /api/cvs/[id]` — single CV operations
- `POST /api/cvs/[id]/generate` — AI generate CV content
- `GET /api/cvs/[id]/export` — export CV as `.docx` (via `docx` library)
- `POST /api/cvs/import` — import CV from PDF (via `pdf-parse`)
- `POST /api/match` — AI-adapt a CV to a job posting; creates a new `Cv` and optionally a `CoverLetter`
- `GET /api/cover-letters/[id]/export` — get cover letter JSON by `cvId`
- `GET/POST /api/jobs` — list or create job postings
- `GET/PUT/DELETE /api/jobs/[id]` — single job operations
- `POST /api/jobs/[id]/parse` — AI parse job posting text
- `GET/POST /api/emails` — list or create emails
- `POST /api/emails/send` — send email via SMTP
- `GET/PUT /api/settings/profile` — profile CRUD
- `GET/PUT/POST /api/settings/ai` — AI config CRUD + connection test
- `GET/PUT/POST /api/settings/smtp` — SMTP config CRUD + test email
- `GET /api/templates` — list available CV templates

**Dashboard pages**:
- `/dashboard` — home (CV count, job stats, recent applications)
- `/dashboard/cv` — CV list
- `/dashboard/cv/[id]` — CV editor
- `/dashboard/cv/new?template=xxx` — create new CV with template
- `/dashboard/match` — paste job posting → AI-adapted CV
- `/dashboard/jobs` — Kanban pipeline (new/applied/interview/offer/rejected/archived)
- `/dashboard/jobs/[id]` — job detail with parsed data, linked CVs, emails
- `/dashboard/jobs/new` — add new job posting
- `/dashboard/emails` — email history
- `/dashboard/emails/new` — compose new email
- `/dashboard/templates` — template gallery
- `/dashboard/settings` — tabs: Profile, AI Config, SMTP Config

**Environment variables**:
Only `DATABASE_URL` required in `.env.local`:
```
DATABASE_URL="file:./local.db"
```

AI provider and SMTP credentials are stored in SQLite and configured via the Settings UI.

## Key patterns

**CV content**: `Cv.content` is stored as a JSON string in SQLite. Always `JSON.parse()` after reading and `JSON.stringify()` before writing. Strip markdown fences from AI responses with `stripJson()` in `src/lib/ai.ts` before parsing.

**CVContent type**: Defined in two places — `src/types/cv.ts` (canonical, no `coverLetter`) and `src/components/cv/CVEditor.tsx` (includes `coverLetter: string`). The editor's local type is the extended one; the API uses the canonical.

**AI client**: `getAiClient()` and `getModel()` in `src/lib/ai.ts` read from the DB each call. All AI functions (generate, adapt, parse, email) call these and use the OpenAI SDK with a dynamic `baseURL`.

**JobPosting statuses**: `new` → `applied` → `interview` → `offer` → `rejected` / `archived`

**Templates**: 4 templates defined as a `const` array in `src/lib/templates.ts` (`classic`, `modern`, `minimal`, `creative`). Template rendering is visual-only (inline styles, no CSS classes); `accent` color varies per template.
