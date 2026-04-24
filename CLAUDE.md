# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# JobPilot — Agent Context

## Commands

```bash
npm run dev            # Start dev server (Next.js on port 3000)
npm run dev:desktop    # Next dev + Electron concurrently
npm run build          # Production build (Next.js)
npm run build:desktop  # Next build + electron-builder (Windows NSIS)
npm run lint           # ESLint
npm run db:push        # Push Prisma schema to DB (no migration file)
npm run db:generate    # Regenerate Prisma client after schema change
```

## Architecture

JobPilot is a **100% local, open-source** job search management tool. No external auth, no payments, no third-party services required. Ships as a Next.js web app and an Electron desktop app.

**Tech stack**: Next.js 14 App Router · SQLite (Prisma) · AI providers (OpenRouter/OpenAI/Ollama) · SMTP (Nodemailer) · Electron 28 · Zod

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

## Electron wrapper

- Entry point: `main.js` (root) — spawns standalone Next.js server, manages DB path via `app.getPath('userData')`
- Preload: `preload.js` — context isolation, exposes IPC to renderer
- Dev mode: runs Next dev server + Electron concurrently via `concurrently`
- Packaged: `npm run build:desktop` produces Windows NSIS installer via electron-builder
- DB in packaged build: copied from `resources/local.db` to userData on first launch

## Server Actions (settings)

Settings routes were replaced with Server Actions. No `/api/settings/*` routes exist.

- **File**: `src/actions/settings.ts` (`'use server'`)
- Functions: `getProfile`, `updateProfile`, `getAiConfig`, `updateAiConfig`, `testAiConnection`, `getSmtpConfig`, `updateSmtpConfig`, `testSmtpEmail`
- Settings page: `src/app/dashboard/settings/page.tsx` (server component, fetches via actions)
- Settings UI: `src/app/dashboard/settings/SettingsClient.tsx` (client component, tabs: Profile / AI / SMTP)

## Validation

All input validated with Zod schemas defined in `src/lib/schemas.ts`:
- `profileSchema`, `aiConfigSchema`, `smtpConfigSchema`, `testEmailSchema`
- `createJobSchema`, `createCvSchema`, `createEmailSchema`

## API routes (no auth — local tool)

- `GET/POST /api/cvs` — list or create CVs
- `GET/PUT/DELETE /api/cvs/[id]` — single CV operations
- `POST /api/cvs/[id]/generate` — AI generate CV content
- `GET /api/cvs/[id]/export` — export CV (generic)
- `GET /api/cvs/[id]/export/pdf` — export CV as PDF (`@react-pdf/renderer`)
- `GET /api/cvs/[id]/export/docx` — export CV as `.docx` (`docx` library)
- `GET /api/cvs/[id]/export/cover-letter-pdf` — export cover letter as PDF
- `POST /api/cvs/import` — import CV from PDF (`pdf-parse`)
- `POST /api/match` — AI-adapt a CV to a job posting; creates new `Cv` + optional `CoverLetter`
- `GET /api/cover-letters/[id]/export` — get cover letter JSON by `cvId`
- `GET/POST /api/jobs` — list or create job postings
- `GET/PUT/DELETE /api/jobs/[id]` — single job operations
- `POST /api/jobs/[id]/parse` — AI parse job posting text
- `GET/POST /api/emails` — list or create emails
- `POST /api/emails/send` — send email via SMTP
- `GET /api/templates` — list available CV templates

## Dashboard pages

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

## Environment variables

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

**Templates**: 4 templates defined in `src/lib/templates.ts` (`classic`, `modern`, `minimal`, `creative`). Rendering is visual-only (inline styles, no CSS classes); `accent` color varies per template.

**UI theme**: Dark command-center palette (OKLCH color space). Background near-black, text near-white, orange accent. Fonts: Fraunces (display), Inter Tight (body), JetBrains Mono (mono). Defined in `src/app/globals.css`.
