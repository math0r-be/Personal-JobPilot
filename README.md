# JobPilot

Open-source, 100% local job search management tool. No account, no cloud, no tracking.

## Features

- **CV editor** with AI generation (OpenRouter / OpenAI / Ollama)
- **Job posting pipeline** — Kanban board (new → applied → interview → offer)
- **CV adapter** — paste a job posting, get an AI-tailored CV + cover letter
- **PDF & Word export** for CV and cover letter separately
- **Email composer** via your own SMTP (Gmail, Outlook, etc.)
- **Templates** — Classic, Modern, Minimal, Creative

## Stack

- Next.js 14 (App Router)
- SQLite via Prisma
- OpenAI-compatible SDK (works with any provider)
- Nodemailer for email
- @react-pdf/renderer + docx for exports

## Getting started

```bash
npm install
cp .env.local.example .env.local
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Configure your AI provider and SMTP in **Settings**.

## Roadmap

- Tauri / Electron desktop app for one-click install
- More CV templates
- Interview prep notes
