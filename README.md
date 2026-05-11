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
| 🗂️ **Kanban Pipeline** | Drag & drop — New → Applied → Interview → Offer → Rejected / Archived |
| ★ **AI Job Evaluation** | Score/5 + A-F structured evaluation (match, gaps, comp, interview plan, legitimacy) |
| ✦ **Interview Prep** | AI-generated questions + hints, shown when status = interview |
| 📖 **STAR+R Story Bank** | Accumulate reusable interview stories across evaluations |
| 📬 **Email Composer** | Send from your own SMTP — AI subject generation |
| 📊 **Activity Timeline** | Every action logged per job with timestamps |
| 🔔 **Follow-up Reminders** | Dashboard highlights overdue relances |
| 🚫 **Deal-breakers** | Define limits (no remote, no startup…) → auto-filtered in pipeline |
| 💰 **Negotiation Scripts** | AI-generated salary, equity, remote negotiation frameworks |
| 🔍 **Pipeline Health** | Dedup checker, anomaly detection, orphan cleanup |
| 🎨 **15 CV Templates** | A4 templates across 6 categories (Classic, Modern, Tech…) |
| 📤 **Export** | Download CV as `.docx`, `.pdf` and cover letter separately |
| 📦 **Batch Processing** | Create + evaluate up to 20 jobs at once |
| 🗺️ **Portal Scanner** | Scan Greenhouse boards for new openings (Anthropic, OpenAI, etc.) |
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
│   │   ├── onboarding/       # 6-step setup wizard
│   │   ├── cv/               # CV editor
│   │   ├── jobs/             # Kanban pipeline + job detail
│   │   ├── match/            # AI adapter
│   │   ├── compare/          # Multi-job comparison tool
│   │   ├── emails/           # Email history + composer
│   │   ├── templates/        # CV template gallery (15 templates)
│   │   ├── stories/          # STAR+R story bank
│   │   ├── batch/            # Batch job creation (up to 20 at once)
│   │   ├── scan/             # Portal scanner (Greenhouse, etc.)
│   │   └── settings/         # Profile, AI, SMTP config
│   └── api/                  # REST endpoints (jobs, cvs, emails, match, evaluate, scan, batch, integrity…)
├── components/               # Sidebar, CV editor, Kanban, EvaluationReport, cards…
├── lib/                      # AI client, DB, templates, export, prompts, portal-scanner, pipeline-integrity
└── types/                    # CV schema types
prisma/
└── schema.prisma             # Data model (SQLite)
```

---

## 🗺️ Roadmap

- [x] **AI Job Evaluation** — score/5 + A-F structured evaluation (archetype, match, gaps, comp, personalization, interview, legitimacy)
- [x] **Interview prep** — AI-generated questions + hints per job (for interview stage)
- [x] **STAR+R Story Bank** — accumulate reusable interview stories across evaluations
- [x] **Activity timeline** — every action logged per job (status change, email sent, CV created, parsed)
- [x] **Drag & drop Kanban** — move jobs between columns with optimistic updates
- [x] **Deal-breakers** — configurable limits (no remote, no startup…) with auto-filter
- [x] **Negotiation scripts** — AI-generated salary, equity, remote negotiation frameworks
- [x] **Pipeline health check** — dedup, anomaly detection, orphan cleanup
- [x] **Onboarding wizard** — 6-step guided setup (CV → infos → rôles → limites → narrative → review)
- [x] **Batch processing** — create and evaluate up to 20 jobs in parallel
- [x] **Portal scanner** — scan Greenhouse boards (Anthropic, OpenAI, Mistral, Hugging Face…)
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
