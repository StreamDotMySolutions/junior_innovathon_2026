# Junior Innovathon 2026 — Project Context

> **Last updated:** 2026-05-26
> **Repo:** github.com:StreamDotMySolutions/junior_innovathon_2026
> **Live mockup site:** https://juniorinnovathon.streamdotmy.com

## What this is

A web system for **RTM (Radio Televisyen Malaysia / Jabatan Penyiaran Malaysia)**, the Malaysian government broadcaster, to run the **Junior Innovathon 2026** reality TV competition for school students. The system handles registration, multi-zone screening, studio judging, certificates, AI chatbot, RTMP streaming, and reporting.

This is a **government tender response** (Sebut Harga). Stream.My is the vendor. Source code is fully handed over to RTM at end of contract.

**Production URL (target after award):** `https://juniorinnovathon.rtm.gov.my`

## Current status

**Phase:** Pre-SST — preparing technical proposal documents. **No application code yet.** Award expected ~21 May 2026.

**What's been produced so far** (all in `docs/proposal-drafts/`):

| File | Purpose |
|---|---|
| `cms-brochure.md` | Product brochure for "StreamDotMy CMS" — mandatory § 3.2.1 deliverable |
| `cms-usage.md` | Portfolio of 6 production projects with thumbnails (§ 3.12.1 evidence) |
| `aws-architecture.md` | Detailed AWS deployment blueprint (Well-Architected) |
| `diagram-sistem.md` | System architecture diagrams (Mermaid, two versions) |
| `jadual-perkhidmatan.md` | Service Schedule — 9-row component declaration |
| `jadual-pelaksanaan.md` | 90-day vendor execution plan (Mermaid Gantt + phases) |
| `jadual-pembinaan.md` | Concise module × man-days schedule (~164 MD total) |
| `gantt-chart-rtm.md` | Reproduction of RTM's official Gantt chart |
| `ai-chatbot-proposal.md` | WhatsApp + OpenAI chatbot technical proposal |
| `design-proposals/` | 9 Bootstrap 5 HTML mockup pages (user + admin UIs) |
| `design-proposals.zip` | Packaged zip artifact of the mockups |

## Tender source documents

Authoritative requirements live under `docs/Technical Proposal/`:

| File | Purpose |
|---|---|
| `SPESIFIKASI_JUNIOR_INNOVATHON_-_JADUAL_PEMATUHAN_2026.pdf` | Full functional + non-functional spec (§§ 1.0–3.14). **Most important file.** |
| `Lampiran_1.pdf` | Mandated 3-tier architecture diagram |
| `SISTEM_DATA_-_GANTT_CHART_JR_INNOVATHON_2026.pdf` | Project timeline |
| `JADUAL_PERKHIDMATAN.pdf` | Component pricing schedule |
| `Supplier Proposal - ePerolehan_TP.pdf` / `TP1.pdf` / `FP.pdf` | Our draft proposals |

Plus `docs/NGeP-QT-Documents/` (procurement terms, sample letters) and `docs/Financial Proposal/`.

**All documents are in Bahasa Melayu.**

## Tech stack (chosen + locked)

| Layer | Tech | Why |
|---|---|---|
| Frontend | **ReactJS 18 + TypeScript + Vite + Bootstrap 5** | Our choice; same as Stream.My's existing RTM portals |
| Backend | **Laravel** (latest) — API only | Mandated by tender Lampiran 1 |
| Database | **MySQL 8** (on RDS Multi-AZ) | Mandated by tender |
| Cache & queue | **Redis** (on ElastiCache Multi-AZ) | Our choice |
| Auth | **Laravel Sanctum** SPA cookie session | Same-domain SPA pattern |
| Roles | **Spatie laravel-permission** | 4 roles: Guru / Juri / Admin / Awam |
| Real-time | Polling (MVP) → Reverb later | Cheaper for studio LED scoring |
| AI chatbot | **OpenAI GPT-4o-mini** + RAG | User confirmed in earlier session |
| Streaming | **nginx-rtmp on EC2** + ffmpeg HLS → S3 → CDN | Studio live + participant VOD |
| Cloud | **AWS** region `ap-southeast-5` (Malaysia, KL) | Data residency for gov |
| Edge / DNS | **Route 53** (DNS) + **CloudFront** (CDN/WAF) | Pure AWS for design hosting; original plan included Cloudflare but Route 53 was confirmed as DNS provider |
| IaC | **Terraform** modules under `infrastructure/` | When production scaffolding starts |
| CI/CD | **GitHub Actions** → ECR → ECS (OIDC trust) | No long-lived AWS keys |

**Mobile app: DROPPED** — responsive web only (user decision).
**Product brand: "StreamDotMy CMS"** (renamed from earlier "InnovaCast").

## Architecture (3-tier, per Lampiran 1)

```
Presentation Tier (React SPA on S3 + CloudFront)
  ├── Guru (teacher / submitter)
  ├── Juri (judge)
  ├── Admin
  └── Awam (public)
            │
            ▼  HTTPS · JSON API · Cookie session
Application Tier (Laravel on ECS Fargate, Multi-AZ in ap-southeast-5)
  + Streaming Server (nginx-rtmp on EC2, Multi-AZ ASG)
            │
            ▼
Data Tier
  ├── RDS MySQL 8 Multi-AZ (KMS encrypted)
  ├── ElastiCache Redis Multi-AZ
  └── S3 (uploads + HLS + backup, KMS encrypted)
```

## AWS deployment state

**Account:** `576754064384` (Stream.My main account, IAM user `streamdotmy-cli`)
**Profile name:** `streamdotmy`
**Primary region:** `ap-southeast-5` (Malaysia)
**Secondary region:** `us-east-1` (only for ACM certs that CloudFront requires)

**Live resources (design-proposals hosting):**

| Resource | ID / Name | Region |
|---|---|---|
| S3 bucket | `juniorinnovathon-streamdotmy-com` | ap-southeast-5 |
| ACM certificate | `7646d9af-596a-4e79-a96e-95a724ca5713` (for `juniorinnovathon.streamdotmy.com`) | us-east-1 |
| CloudFront distribution | `ETTFYVJNQE52L` (domain `dgpfz1qxs0kmh.cloudfront.net`) | global edge |
| CloudFront OAC | `EUP8DDWY2DQDM` | — |
| Route 53 hosted zone | `Z03002813HBNI1PL2A782` (streamdotmy.com.) | global |
| A alias record | `juniorinnovathon.streamdotmy.com.` → CloudFront | Route 53 |

**Live URL:** https://juniorinnovathon.streamdotmy.com

**Cost:** <USD 0.50/month (mockup hosting only). Production deployment will be ~USD 600–1,200/month per `aws-architecture.md`.

**Redeploy mockup after edits:**
```powershell
aws s3 sync "docs\proposal-drafts\design-proposals" s3://juniorinnovathon-streamdotmy-com --profile streamdotmy --delete
aws cloudfront create-invalidation --distribution-id ETTFYVJNQE52L --paths "/*" --profile streamdotmy
```

## Scale targets

- ~5,000 participating teams
- 5,000 concurrent users (peak — live broadcast)
- Active operation: June – December 2026

## Modules (mapped to spec sections)

| # | Module | Spec § | Key points |
|---|---|---|---|
| 1 | CMS | 3.2 | Custom-built, branded as **StreamDotMy CMS** |
| 2 | Pendaftaran | 3.2.5 | Pangkalan Data Sekolah lookup; 3-min video + 5 slides per team |
| 3 | Saringan | 3.6 | 5 zones; vendor supplies 5 laptops; ~3.5 months |
| 4 | Penjurian Studio | 3.6.4 | 6 live episodes; real-time LED scoring; 12 Sep – 1 Nov |
| 5 | Sijil Digital | 3.2.5(c) | PDF + QR verification |
| 6 | AI Chatbot | 3.4 | OpenAI GPT-4o-mini + WhatsApp Cloud API + Telegram + web widget |
| 7 | Admin Dashboard | 3.7 | Content mgmt, users, GA4, chatbot mgmt |
| 8 | Helpdesk | 3.8 | 24/7 SLA-tracked tickets |
| 9 | Analytics | 3.3 | Demographics, scores, demographics, chatbot stats |
| 10 | Streaming Server | (new scope) | RTMP ingest + HLS transcode + VOD pipeline (in CMS Brochure) |

## Hard requirements (from spec)

- **Source code** (frontend, backend, DB, credentials) handed to RTM at contract end — § 3.14
- **Development in Malaysia** — § 3.12.7
- **CMS local product / local developer** — § 3.2.1
- **Latest software versions** — § 3.12.5
- **SLA**: Critical (down/login) — SEGERA; Medium (function error) — 3 hr; Light (typo) — 24 hr — § 3.11.3
- **Backups**: daily / weekly / monthly — § 3.11.4(a)
- **Security**: SSL, DDoS, firewall, IDS, 24/7 monitoring — § 3.8.1
- **Staff vetting**: CGSO E-Vetting; no Rohingya on gov premises — § 2.1.8, § 2.3.1
- **Training**: 1 session × 4 SuperAdmin + 1 session × 50 juri/content users — § 3.9
- **Deliverables**: Admin Manual + Technical Manual (2 hardcopies + softcopy each), UAT + FAT docs — § 3.10, § 3.13

## Timeline anchors

| Date | Event |
|---|---|
| Apr 2026 | RTM procurement + evaluation |
| 21 May 2026 | **SST (Surat Setuju Terima)** issued — contract begins |
| 22 May 2026 | Performance bond + insurance submission |
| 23 May 2026 | Day 1 of development (90-day clock starts) |
| **30 May 2026** | Registration module must be live (per RTM Gantt) |
| 19 Aug 2026 | Day 90 (full system deadline per § 2.1.20) |
| 12 Sep – 1 Nov 2026 | 6 studio episodes recorded |
| Nov – Dec 2026 | Handover, training, post-mortem |

## Key decisions made (chronological)

See [`docs/internal/decisions-log.md`](./docs/internal/decisions-log.md) for full chronology with rationale.

Headline decisions:
1. Stack: React + Bootstrap 5 + Laravel + MySQL
2. AWS region: `ap-southeast-5` (Malaysia)
3. Compute: ECS Fargate
4. Real-time: polling first, Reverb later
5. Chatbot LLM: OpenAI GPT-4o-mini (with PII filter for gov data sovereignty)
6. CMS: custom-built (not Filament / Statamic / WordPress)
7. Product brand: **StreamDotMy CMS**
8. Mobile app: **DROPPED** — responsive web only
9. Streaming: nginx-rtmp on EC2 + HLS pipeline (in-house, not AWS MediaLive)
10. Design hosting (mockups): pure AWS (S3 + CloudFront + Route 53) — Cloudflare not used yet
11. Backend conventions (locked, see `docs/backend/`): Spatie RBAC · controllers grouped by role under `Api/V1/` · service layer (thin controllers) · Form Request validation foldered by controller · JSON-only responses · Sanctum auth · `/api/v1` versioning (HTTP layer only; services/models shared) · **Pest 3.x** tests with Arch enforcement · 3-layer middleware stack

## Working notes for Claude (across machines)

- **Language**: User communicates in Bahasa Melayu predominantly, with English technical terms. Reply in BM (or BM/English mix) — match the user's register. The user's earlier instruction was English-default but actual conversation has shifted to BM.
- **User**: Azril (`azril.nazli@gmail.com`), project lead at Stream.My. Prefers concise answers, often says "ringkas". Skips clarifying questions when in momentum — pick sensible defaults and move.
- **Verification preference**: User prefers I check actual infra state (run `aws` commands) rather than ask about things I could verify. Earlier feedback: "streamdotmy.com bukan sudah diuruskan di route53?" — I should have checked Route 53 first.
- **AWS access**: Profile `streamdotmy` already configured. Run AWS commands directly without asking for credentials. **Always pass `--profile streamdotmy`** for the JI project. Don't use `--profile muzikfm` (different project).
- **AWS confirmation**: For cost-incurring or destructive operations, briefly note cost impact then proceed unless user objects. Read-only is fine without confirmation.
- **Spec § citations**: Every feature/decision should reference its spec § anchor so RTM compliance is traceable.
- **Commit messages**: User signs off with "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>" — keep this format.
- **Push frequency**: After each meaningful chunk of work, commit + push to GitHub. User considers this the canonical state across machines.
- **Plan mode**: When user types `/plan`, follow the plan workflow strictly. Overwrite the existing plan file when it's a new task.

## Continuing work on another machine

1. `git pull origin main` to get latest state
2. Read this `CLAUDE.md` first
3. Read `docs/internal/decisions-log.md` for chronological decisions + rationale
4. For module-specific work, open the relevant `docs/proposal-drafts/*.md` file
5. AWS access requires `aws configure --profile streamdotmy` on the new machine (set up your own credentials)
6. To preview the live mockup site: https://juniorinnovathon.streamdotmy.com

## Repo layout

```
.
├── CLAUDE.md                          ← project context (this file)
├── README.md                          ← public-facing readme
├── .gitignore
├── docs/
│   ├── Technical Proposal/            ← RTM-issued PDF spec
│   ├── Financial Proposal/            ← our pricing draft
│   ├── NGeP-QT-Documents/             ← procurement portal docs
│   ├── proposal-drafts/               ← OUR working documents
│   │   ├── *.md                       ← 9 markdown proposal docs
│   │   ├── design-proposals/          ← 9 HTML UI mockups + shared CSS
│   │   └── design-proposals.zip       ← packaged zip artifact
│   ├── backend/                       ← Laravel API design conventions
│   │   ├── README.md                  ← RBAC, controllers, services, requests, JSON, Sanctum, /api/v1, middleware
│   │   └── testing.md                 ← Pest 3.x testing conventions
│   └── internal/
│       └── decisions-log.md           ← chronological decisions
└── (backend/ and frontend/ code will appear when scaffolding starts post-SST)
```
