# Junior Innovathon 2026

Registration, screening, judging and reporting system for **RTM's Junior Innovathon 2026** reality TV programme — a national innovation competition for Malaysian school students.

> **Status:** Planning / pre-scaffolding. Tender response phase. No source code yet.

## About

This repository hosts the system being proposed by **Stream.My** in response to a tender (Sebut Harga) issued by **Jabatan Penyiaran Malaysia (RTM)** for the Junior Innovathon 2026 programme.

The platform will handle:

- Public-facing portal with announcements, schedule, and finalists
- School-based team registration with participant details
- Submission of innovation entries (3-min video + 5 slides)
- Multi-zone online screening by selected judges
- Real-time scoring during 6 studio episodes with live LED display
- Digital certificate issuance and verification
- AI chatbot support across web, WhatsApp, and Telegram
- Admin dashboard, helpdesk, and analytics reporting

**Target URL (production):** `https://juniorinnovathon.rtm.gov.my`

## Stakeholders

| Role | Party |
|---|---|
| Owner | Jabatan Penyiaran Malaysia (RTM) |
| Vendor | Stream.My |
| Audience | School teachers (Guru), judges (Juri), administrators, and the public (Awam) |

## Scale

- ~5,000 participating teams
- 5,000 concurrent users (peak — live broadcast windows)
- Active programme window: June – December 2026

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Bootstrap 5, React Router, React Query, Axios |
| Backend | Laravel (latest), PHP 8.3+, Sanctum (SPA auth), Spatie Permission |
| Database | MySQL 8 (on Amazon RDS Multi-AZ) |
| Object storage | Amazon S3 (videos, slides, certificate PDFs) |
| Cache & queue | Redis (on Amazon ElastiCache Multi-AZ) |
| Real-time (Phase 2) | Laravel Reverb (WebSockets) |

Laravel and MySQL are mandated by the tender (Lampiran 1). React + Bootstrap 5 is the chosen frontend stack.

## Cloud & infrastructure

| Concern | Service |
|---|---|
| Cloud provider | **AWS** — region `ap-southeast-5` (Malaysia, KL) for data residency |
| Compute | **ECS Fargate** Multi-AZ, auto-scaling |
| Load balancer | **Application Load Balancer (ALB)** with ACM TLS |
| Database | **Amazon RDS for MySQL 8** Multi-AZ |
| Cache | **Amazon ElastiCache for Redis** Multi-AZ |
| Object storage | **Amazon S3** (uploads + SPA + backup buckets) |
| Backup | **AWS Backup** + cross-region replication to `ap-southeast-1` |
| Edge | **Cloudflare Business** (CDN + WAF + DDoS) in front of AWS |
| Secrets | **AWS Secrets Manager** + Parameter Store |
| Security | **GuardDuty + Security Hub + KMS + WAF + CloudTrail** |
| Observability | **CloudWatch** (logs, metrics, alarms) + **X-Ray** |
| Email | **Amazon SES** |
| IaC | **Terraform** modules in `infrastructure/` |
| CI/CD | **GitHub Actions** with OIDC → ECR → ECS |

Architecture follows AWS Well-Architected Framework (6 pillars). Full details in [`docs/proposal-drafts/aws-architecture.md`](./docs/proposal-drafts/aws-architecture.md).

## Architecture

3-tier, with frontend and backend separated and communicating only via JSON API. Deployed on AWS in Malaysia region with Cloudflare as edge:

```
┌─────────────────────────────────────────────┐
│  Presentation Tier (React SPA on S3)        │
│  ├── Guru  (teacher / submitter)            │
│  ├── Juri  (judge)                          │
│  ├── Admin                                  │
│  └── Awam  (public)                         │
└────────────────────┬────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────┐
│  Cloudflare Edge (CDN · WAF · DDoS)         │
└────────────────────┬────────────────────────┘
                     │ HTTPS · mTLS to origin
┌────────────────────▼────────────────────────┐
│  AWS ap-southeast-5 (Malaysia, KL)          │
│  ┌─────────────────────────────────────┐    │
│  │  ALB → ECS Fargate (Laravel API)    │    │
│  │  Multi-AZ · Auto-scale 2–10 tasks   │    │
│  └────────┬────────────────────┬───────┘    │
│           │                    │            │
│  ┌────────▼────────┐  ┌────────▼─────────┐  │
│  │  RDS MySQL 8    │  │  ElastiCache     │  │
│  │  Multi-AZ + KMS │  │  Redis Multi-AZ  │  │
│  └─────────────────┘  └──────────────────┘  │
│  ┌─────────────────┐  ┌──────────────────┐  │
│  │  S3 (uploads,   │  │  AWS Backup →    │  │
│  │  video, slides) │  │  ap-southeast-1  │  │
│  └─────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────┘
```

## Repository layout

Current (pre-scaffolding):

```
.
├── CLAUDE.md           # Project context for AI sessions
├── README.md           # This file
├── .gitignore
└── docs/
    ├── Technical Proposal/    # RTM-issued spec, Lampiran, Gantt
    ├── Financial Proposal/    # Our financial submission
    └── NGeP-QT-Documents/     # Procurement-portal documents
```

Planned (once scaffolding begins):

```
.
├── backend/            # Laravel API
├── frontend/           # React SPA
└── infrastructure/     # Terraform IaC modules for AWS
```

## Documentation

Authoritative tender documents (in **Bahasa Melayu**):

| File | Purpose |
|---|---|
| `docs/Technical Proposal/SPESIFIKASI_JUNIOR_INNOVATHON_-_JADUAL_PEMATUHAN_2026.pdf` | Full functional + non-functional spec. The compliance checklist. |
| `docs/Technical Proposal/Lampiran_1.pdf` | Mandated 3-tier architecture diagram |
| `docs/Technical Proposal/SISTEM_DATA_-_GANTT_CHART_JR_INNOVATHON_2026.pdf` | Project timeline |
| `docs/Technical Proposal/JADUAL_PERKHIDMATAN.pdf` | Component / pricing schedule |
| `docs/NGeP-QT-Documents/` | Procurement portal terms, sample letters, compliance forms |

When implementing a feature, reference its **spec section number** (e.g. `3.6.1`) in commit messages and PR descriptions so each change is traceable back to a tender compliance item.

## Getting started

Setup instructions will be added once Phase 0 scaffolding lands. The intended flow:

```bash
# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Implementation roadmap

| Phase | Module | Spec ref |
|---|---|---|
| 0 | Repo scaffolding, CI, auth skeleton | — |
| 1 | Auth + roles (Guru / Juri / Admin / Awam) | 3.1 |
| 2 | School directory (Pangkalan Data Sekolah) | 3.2.5(a) |
| 3 | Team registration + participants | 3.2.5 |
| 4 | Submissions (video + slides) | 3.2.5 |
| 5 | Screening (5-zone judging) | 3.6.1 |
| 6 | Studio judging + LED live display | 3.6.4 |
| 7 | Digital certificates | 3.2.5(c) |
| 8 | CMS (public pages, announcements) | 3.2 |
| 9 | AI chatbot (web + WhatsApp + Telegram) | 3.4 |
| 10 | Helpdesk + reporting + analytics | 3.3, 3.8 |
| 11 | Hardening (security, backups, load test) | 3.5, 3.8, 3.11 |

## Key delivery milestones

| Date | Event |
|---|---|
| 21 May 2026 | Surat Setuju Terima (SST) — contract begins |
| 23 May 2026 | System development starts |
| 30 May 2026 | Registration opens |
| 12 Sep – 1 Nov 2026 | Studio recording of 6 episodes |
| Nov – Dec 2026 | Final phase, handover, training, documentation |

Full delivery within **90 days from SST**, phased per the Gantt chart.

## Service level (SLA)

| Severity | Issue type | Response |
|---|---|---|
| Critical | System down, login broken | Immediate |
| Medium | Function error, broken feature | 3 hours |
| Light | Typo, layout, content error | 24 hours |

## Compliance highlights

- **Source code** (frontend, backend, database, all credentials) is fully handed over to RTM at end of contract — § 3.14.
- **Development must happen in Malaysia** — § 3.12.7.
- **CMS must be a local product** or built by local developers — § 3.2.1.
- All developers undergo CGSO **E-Vetting**.
- Bound by the **Akta Rahsia Rasmi Kerajaan Malaysia** for the duration of the contract.

## License

Proprietary. All rights to the source code transfer to Jabatan Penyiaran Malaysia (RTM) on completion per the tender terms.

## Contact

**Stream.My** — `sales@stream.my`
