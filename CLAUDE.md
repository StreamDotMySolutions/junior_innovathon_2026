# Junior Innovathon 2026 — Project Context

## What this is

A web system for **RTM (Radio Televisyen Malaysia / Jabatan Penyiaran Malaysia)**, the Malaysian government broadcaster, to run the **Junior Innovathon 2026** reality TV competition for school students. The system handles registration, multi-zone screening, studio judging, certificates, and reporting.

This is a **government tender response** (Sebut Harga). The code we write here becomes the proposed implementation; final source is fully handed over to RTM at end of contract.

**Public URL (target):** `https://juniorinnovathon.rtm.gov.my`

## Tender sources

Authoritative requirement documents live under `docs/`:

- `docs/Technical Proposal/SPESIFIKASI_JUNIOR_INNOVATHON_-_JADUAL_PEMATUHAN_2026.pdf` — full functional + non-functional spec (Sections 1.0–3.14). The most important file.
- `docs/Technical Proposal/Lampiran_1.pdf` — mandated 3-tier architecture diagram (Laravel + Apache/Nginx + MySQL + S3).
- `docs/Technical Proposal/SISTEM_DATA_-_GANTT_CHART_JR_INNOVATHON_2026.pdf` — project timeline (Apr 2026 contract start, Jun–Dec delivery).
- `docs/Technical Proposal/JADUAL_PERKHIDMATAN.pdf` — component pricing schedule (CMS, plugins, AI chatbot, SEO, analytics, server software).
- `docs/NGeP-QT-Documents/` — procurement documents (terms, specifications, compliance checklists).
- `docs/Financial Proposal/` — pricing.

**Read the spec PDF first** if you're new to the project. Documents are in **Bahasa Melayu**; understand BM or work from this summary.

## Chosen tech stack

| Layer | Tech |
|---|---|
| Frontend | **ReactJS 18** + **Bootstrap 5** (via npm, not CDN) + Vite + TypeScript |
| Backend | **Laravel** (latest) — API only, returns JSON |
| Database | **MySQL 8** |
| Object storage | S3-compatible (videos, slides, certificates) — mandated by tender |
| Auth | Laravel Sanctum, SPA cookie-based, same-domain |
| Roles | `spatie/laravel-permission` |
| Real-time (LED live scores) | Polling (MVP) → Laravel Reverb later |
| Queue / cache | Redis |

Laravel + Apache/Nginx + MySQL is **mandated by the tender** (Lampiran 1). React + Bootstrap 5 is our choice.

## Architecture

3-tier, separated frontend/backend per tender:

```
Presentation Tier (React SPA)
  ├── Guru (teacher / submitter)
  ├── Juri (judge)
  ├── Admin
  └── Awam (public)
            │
            ▼  HTTPS + JSON API + cookie session
Application Tier (Laravel)
            │
            ▼
Data Tier
  ├── MySQL (relational data)
  └── S3 / Object Storage (video, slides, certificate PDFs)
```

## Scale

- ~5,000 participants
- 5,000 concurrent users target
- Public-facing during live broadcasts

## Major modules (mapped to spec sections)

| # | Module | Spec ref | Key points |
|---|---|---|---|
| 1 | CMS | 3.2 | Customizable, manages public portal content |
| 2 | Registration (Pendaftaran) | 3.2.5 | School lookup from Pangkalan Data Sekolah; 3-min video + 5 slides per team |
| 3 | Screening (Saringan) | 3.6 | **5 zones**, parallel judging; vendor supplies 5 laptops on-site |
| 4 | Studio Judging (Penjurian) | 3.6.4 | **6 episodes**, real-time scores displayed on LED screen |
| 5 | Digital certificates | 3.2.5(c) | Auto-generated per participant |
| 6 | AI Chatbot | 3.4 | Web widget + WhatsApp/Telegram integration |
| 7 | Admin dashboard | 3.7 | Content mgmt, user mgmt, Google Analytics, AI chatbot mgmt |
| 8 | Helpdesk + reporting | 3.8 | 24/7 support, SLA-tracked tickets |
| 9 | Analytics | 3.3 | Demographics, school type, gender, innovation category |

## Hard requirements to remember

- **Source code** (frontend, backend, DB, all credentials) handed over to RTM at end of contract — section 3.14.
- **Development must happen in-country** (Malaysia) — section 3.12.7.
- **CMS must be customizable, local product / local developer**, built per agreed URS — section 3.2.1.
- **Latest versions** of all software — section 3.12.5.
- **SLA**:
  - Critical (system down, can't login): immediate response
  - Medium (function error): 3 hours
  - Light (typo, layout): 24 hours
- **Backups**: daily, weekly, monthly
- **Security**: SSL cert, DDoS protection, firewall, IDS, 24/7 monitoring
- **Staff vetting**: all developers go through CGSO E-Vetting; no Rohingya workers on gov premises.
- **Training**: 1 session for 4 SuperAdmins + 1 session for 50 judges/content users.
- **Deliverables**: Admin Manual + Technical Manual (2 hardcopies + softcopy each), UAT + FAT docs.

## Timeline anchors (from Gantt)

- Apr 2026 — procurement, evaluation, contract award
- 21 May 2026 — Surat Setuju Terima (SST) issued, contract begins
- 23 May 2026 — system development starts
- 30 May – 1 Nov 2026 — system live for registration, screening, judging
- 12 Sep – 1 Nov 2026 — studio recording of 6 episodes
- May – Dec 2026 — ongoing maintenance
- **90 days from SST** to deliver completed system in phases.

## Repository state

Currently **greenfield**: no source code yet, no git repo, no `package.json`, no `composer.json`. Only this CLAUDE.md, the `docs/` folder, and the costing zip.

Planned monorepo layout once scaffolding begins:

```
Junior Innovathon/
├── CLAUDE.md            ← you are here
├── README.md
├── .gitignore
├── docs/                ← tender PDFs (already exists)
├── backend/             ← Laravel API
└── frontend/            ← React SPA
```

## Working notes for Claude

- **Language**: project docs are in BM; user communicates in English with BM technical terms. Reply in English unless asked otherwise.
- **User role**: project lead / proposer, planning the response to the RTM tender.
- **Don't invent requirements** — anything not in the spec PDF should be flagged as an assumption.
- **Compliance mapping matters**: every feature should be traceable back to a spec section (e.g. `3.6.1`) since the tender uses a `Jadual Pematuhan` (compliance checklist).
- **URS sessions** with RTM will happen; the user may bring back Malay-language transcripts/recordings for requirement refinement.
- When designing UI, remember the audience is school children, teachers, and government judges — keep it accessible and Bootstrap-default-friendly rather than over-stylised.

## When you start work on the laptop

1. Read this file first.
2. If a specific module is being implemented, open the relevant section of `docs/Technical Proposal/SPESIFIKASI_JUNIOR_INNOVATHON_-_JADUAL_PEMATUHAN_2026.pdf` for the authoritative wording.
3. If scaffolding hasn't started, the implementation plan from the earlier planning session is in `C:\Users\iracing\.claude\plans\im-planning-to-use-agile-turing.md` (Windows path — won't transfer to another machine; consider copying its contents into this repo before syncing).
