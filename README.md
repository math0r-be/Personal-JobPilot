<div align="center">

<br/>

```
 ╔══════════════════════════════╗
 ║   J O B P I L O T           ║
 ║   Your local job cockpit     ║
 ╚══════════════════════════════╝
```

**JobPilot** — open-source job search management. 100% local, no account, no cloud, no tracking.

[![Next.js](https://img.shields.io/badge/Next.js_14-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)](https://sqlite.org)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)](https://prisma.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

</div>

---

## ✦ What is it?

A self-hosted cockpit for your job search. Paste a job posting → get an AI-tailored CV and cover letter in seconds. Track every application through a Kanban pipeline. Send emails from your own SMTP. Everything stays on your machine.

No SaaS. No subscription. No data leaving your computer.

---

## ⚡ Features

| | |
|---|---|
| 🤖 **AI CV Adapter** | Paste any job posting → instant tailored CV + cover letter with match score |
| 📄 **CV Editor** | Rich editor with AI generation + 30s auto-save |
| 🗂️ **Kanban Pipeline** | Drag & drop — New → Applied → Interview → Offer |
| ✦ **Interview Prep** | AI-generated questions + hints, shown when status = interview |
| 📬 **Email Composer** | Send from your own SMTP — AI subject generation |
| 📊 **Activity Timeline** | Every action logged per job with timestamps |
| 🔔 **Follow-up Reminders** | Dashboard highlights overdue relances |
| 🎨 **15 CV Templates** | A4 templates across 6 categories (Classic, Modern, Tech…) |
| 📤 **Export** | Download CV as `.docx` and cover letter separately |
| 🦙 **Local AI support** | Works with Ollama, OpenRouter, OpenAI, or any custom endpoint |
| 🖥️ **Desktop app** | Electron wrapper for a native app feel |

---

## 🚀 Getting started

**Requirements:** Node.js 18+, npm

```bash
# Clone and install
git clone https://github.com/math0r-be/Personal-JobPilot.git
cd Personal-JobPilot
npm install

# Setup database
cp .env.local.example .env.local
npm run db:push

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — configure your AI provider and SMTP in **Settings**.

### Desktop (Electron)

```bash
npm run dev:desktop
```

---

## 🔧 AI Configuration

JobPilot works with any OpenAI-compatible provider. Set it up in **Settings → AI Config**.

| Provider | Base URL | Notes |
|---|---|---|
| **OpenRouter** | `https://openrouter.ai/api/v1` | Default — access 200+ models |
| **OpenAI** | `https://api.openai.com/v1` | GPT-4o, o1, etc. |
| **Ollama** | `http://localhost:11434/v1` | 100% local, no API key needed |
| **Custom** | anything | Any OpenAI-compatible endpoint |

---

## 🏗️ Stack

```
Next.js 14 (App Router)   →  frontend + API routes
SQLite + Prisma           →  local database (no server needed)
OpenAI SDK                →  AI adapter (dynamic baseURL)
Nodemailer                →  email via your SMTP
docx + pdf-parse          →  Word export + PDF import
Electron                  →  desktop wrapper
```

---

## 📁 Project structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx          # Mission Control home
│   │   ├── cv/               # CV editor
│   │   ├── jobs/             # Kanban pipeline
│   │   ├── match/            # AI adapter
│   │   ├── emails/           # Email history + composer
│   │   ├── templates/        # CV template gallery (15 templates)
│   │   └── settings/         # Profile, AI, SMTP config
│   └── api/                  # REST endpoints
├── components/               # Sidebar, CV editor, cards…
├── lib/                      # AI client, DB, templates, export
└── types/                    # CV schema types
prisma/
└── schema.prisma             # Data model (SQLite)
```

---

## 🗺️ Roadmap

- [x] **Interview prep** — AI-generated questions + hints per job (for interview stage)
- [x] **Activity timeline** — every action logged per job (status change, email sent, CV created, parsed)
- [x] **Drag & drop Kanban** — move jobs between columns with optimistic updates
- [x] **Follow-up reminders** — dashboard shows jobs with overdue follow-up dates
- [x] **Auto-save CV editor** — 30s debounce, no manual save needed
- [x] **AI email subject** — one-click subject generation when composing emails
- [x] **Source & salary tracking** — per-job source (LinkedIn, Indeed, Referral…) and salary range
- [x] **Responsive UI** — mobile sidebar, horizontal Kanban scroll, responsive CV editor
- [ ] Application analytics & conversion stats
- [ ] LinkedIn job import
- [ ] One-click Windows / macOS installer (Electron)

---

## 📄 License

MIT — do whatever you want with it.
