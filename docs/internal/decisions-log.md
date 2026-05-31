# Decisions Log — Junior Innovathon 2026

> **Purpose:** Chronological record of key decisions made during proposal preparation, with rationale. Read this to understand **why** the project is shaped the way it is. Pair with `CLAUDE.md` for current state.

---

## 2026-05-24 — Project initialized

**Context:** Starting fresh response to RTM tender for Sistem Pendaftaran Penyertaan, Saringan, Penjurian dan Pelaporan Program Realiti Junior Innovathon 2026.

**Decisions:**
- **Tender documents read**: full spec in `SPESIFIKASI_JUNIOR_INNOVATHON_-_JADUAL_PEMATUHAN_2026.pdf` is the canonical reference. Lampiran 1 mandates 3-tier architecture with Laravel + Apache/Nginx + MySQL + S3.
- **Tech stack chosen by user**: ReactJS frontend, Bootstrap 5, Laravel as API, MySQL database. Laravel + MySQL match the tender mandate; React + Bootstrap is our addition.
- **Created `CLAUDE.md`** to preserve project context across machines.
- **Initialized git repo**, pushed to `github.com:StreamDotMySolutions/junior_innovathon_2026`. Repo eventually made public.

---

## 2026-05-25 — Document drafting marathon

Several proposal drafts produced under `docs/proposal-drafts/`:

### Jadual Perkhidmatan (Service Schedule)
- 9-row component declaration matching the official RTM PDF form
- **CMS approach**: custom-built using React + Laravel + MySQL (no third-party CMS product like Filament/Statamic). Satisfies § 3.2.1 "local product / local developer".
- **AI Chatbot**: OpenAI GPT-4o-mini (GPT-4o-mini for chat + text-embedding-3-small for RAG). User confirmed OpenAI choice. Compliance mitigation: PII filter in system prompt; fallback path is Azure OpenAI Singapore if RTM raises data residency concerns.

### Diagram Sistem
- First version: faithful reproduction of Lampiran 1 (3-tier).
- Second version: enriched with specific tech (initially Nginx/Cloudflare; later updated to AWS).

### Gantt + Execution Plan
- `gantt-chart-rtm.md` reproduces RTM's official Gantt as Mermaid.
- `jadual-pelaksanaan.md` is the **vendor-internal** 90-day execution plan with module-level milestones. Key insight: RTM Gantt Item 15 says "system live 30 Mei" — only 7 days after dev starts (23 Mei). Realistic interpretation: **registration module** must be live by then; other modules follow per § 2.1.20 phased delivery.

### AWS Architecture
- Decision: **AWS region `ap-southeast-5` (Malaysia, KL)** for data residency. Account ownership recommendation: RTM-owned with Stream.My as IAM operator (for clean § 3.14 handover).
- **Compute**: ECS Fargate (managed, auto-scale, no patching) — chosen over EC2 ASG (more manual) and Elastic Beanstalk (AWS de-investing since 2022).
- **CDN/DDoS**: Originally chose **Cloudflare Business in front of AWS** (better DDoS, free tier, POP KL). Later when actually deploying mockup site, used **pure AWS CloudFront** since DNS was already in Route 53 and CloudFront integrates more cleanly.
- **Region trade-off**: ap-southeast-5 is newer (Aug 2024). Some service quotas may need increases before SST.
- All proposal drafts updated to align with AWS choice.

---

## 2026-05-26 — Brand, mobile decision, and deployment

### Branding
- First proposed brand: **"InnovaCast by Stream.My"** (Innovation + Broadcast).
- User overrode to: **"StreamDotMy CMS"**. Rationale: matches company name, simpler product line naming.
- All references in `cms-brochure.md` updated (13 occurrences replaced).

### Mobile app dropped
- Originally considered native mobile app (React Native vs Flutter vs PWA).
- User decided: **no native mobile app** — responsive web only is sufficient.
- Reasons inferred: scope reduction; web responsive via Bootstrap 5 covers mobile UX adequately; saves significant dev time within 90-day window.

### Streaming server scope confirmed
- User confirmed: full RTMP streaming server scope — **live (studio) + VOD (participant submissions)**.
- Pipeline: nginx-rtmp on EC2 ASG → ffmpeg HLS transcode → S3 (HLS bucket) → CDN. VOD via S3 event → Lambda → Fargate ffmpeg.
- Why not AWS MediaLive: too expensive (~USD 1.50/hr idle), and "local product" story is stronger with self-hosted nginx-rtmp.

### `cms-usage.md` portfolio
- Fetched streamdotmy.com — 6 projects listed, 4 of which are for RTM (same client). Strong evidence for § 3.12.1 (5-10 years experience).
- Thumbnails embedded via absolute URLs from streamdotmy.com CDN.

### AI Chatbot proposal
- Detailed `ai-chatbot-proposal.md` written: WhatsApp Cloud API + Laravel + OpenAI GPT-4o-mini + RAG.
- Cost analysis: ~RM 2,270 for full 6-month program (vs ~RM 21,000 for 1 full-time helpdesk operator). Savings: ~RM 19,000.
- Escalation flow: AI confidence < 0.6 → auto-create helpdesk ticket with full transcript.

### Jadual Pembinaan (concise)
- User explicitly asked for "ringkas" version. Produced `jadual-pembinaan.md` with module × man-day estimates.
- Total: **~164 MD** (114 dev + 50 support). Team capacity in 90 days: ~320 MD. **~60% buffer** for URS adjustments.

### Design Proposals (HTML mockups)
- User asked for visual mockups for tender. Created `docs/proposal-drafts/design-proposals/` with 9 standalone HTML files using Bootstrap 5 + Bootstrap Icons + Google Fonts + Chart.js (all CDN).
- Theme: **RTM Biru Klasik** (#0d3b66 navy) + **aksen kuning/oren** (#ffc107 / #ff6b35) — confirmed by user.
- 5 user pages: Landing, Pendaftaran wizard, Guru dashboard, Juri scoring, **WhatsApp chatbot conversation** (added last).
- 4 admin pages: Dashboard, Submission management, CMS editor, Analytics.
- Plus `index.html` (TOC) and `assets/styles.css` (shared design tokens).
- Also packaged as `design-proposals.zip` (36.2 KB).

### AWS Live Hosting
- User wanted mockups accessible at `juniorinnovathon.streamdotmy.com`.
- Initial assumption: Cloudflare manages DNS for streamdotmy.com. User pushed back: "streamdotmy.com bukan sudah diuruskan di route53?"
- **Lesson learned**: verify infrastructure state via CLI before asking questions. Confirmed Route 53 hosted zone `Z03002813HBNI1PL2A782`.
- Deployment stack:
  - S3 bucket `juniorinnovathon-streamdotmy-com` in `ap-southeast-5` (private, blocked public access)
  - ACM cert in `us-east-1` (CloudFront requirement)
  - CloudFront distribution `ETTFYVJNQE52L` with Origin Access Control (OAC)
  - Route 53 A alias → CloudFront
- Total cost: <USD 0.50/month
- Total deploy time: ~5 minutes (cert validated faster than expected)

### WhatsApp chatbot mockup (5th user page)
- Authentic WhatsApp Web styling (header #00a884, sent bubble #d9fdd3, etc.).
- 12-turn conversation: Cikgu Aishah ↔ Bot. Demonstrates greeting → FAQ retrieval → multi-turn context → escalation to helpdesk.
- Backend annotation pipeline shows WA API → Laravel → RAG → OpenAI → reply.

---

## 2026-05-31 — Backend design conventions locked

**Context:** Defining the Laravel API backend conventions before scaffolding starts (post-SST). Documented under new `docs/backend/` folder.

**Decisions:**
1. **RBAC** — Spatie laravel-permission controls roles + route access. 4 roles: `guru`, `juri`, `admin`, `awam`. Guard `sanctum`.
2. **Controllers grouped by role** — `app/Http/Controllers/Api/V1/{Guru,Juri,Admin,Awam}/`. Thin controllers only.
3. **Service layer** — all business logic in `app/Services/{Domain}/`. Controllers call services; services are HTTP-agnostic.
4. **Validation via Form Request** — folders named by controller: `app/Http/Requests/Api/V1/{Role}/{Controller}/{Action}Request`. BM validation messages.
5. **JSON-only responses** — every controller method returns `JsonResponse`; API Resources for shaping.
6. **Sanctum** — primary auth (SPA cookie session + tokens for integrations).
7. **API versioning** — all endpoints under `/api/v1/`. HTTP layer (controllers, requests, routes) namespaced `V1`; **Service layer, Models, migrations NOT versioned** (shared) to avoid logic duplication across versions.
8. **Testing = Pest 3.x** — Feature (endpoints) / Unit (services) / Arch (enforce conventions). DoD: ≥80% coverage gate in GitHub Actions CI. Arch tests turn the conventions above into automated checks.
9. **Middleware (3 layers)** — global (`/api/v1`): Sanctum stateful + CORS + `ForceJsonResponse` + `SetLocale` + `throttle:api`; auth group: `auth:sanctum` + `role:*`; per-route: `permission:*`, `AuditLog`, tighter `throttle:login|upload`. SSL/WAF/DDoS handled at CloudFront/WAF, not app middleware (§ 3.8.1).

**Rationale:** Consistent, auditable, easy to hand over to RTM (§ 3.14). Arch tests make conventions self-enforcing rather than documentation-only.

**Artifacts:** `docs/backend/README.md` (conventions + middleware), `docs/backend/testing.md` (Pest).

**Open within backend (minor):**
- Test DB: SQLite in-memory (fast) + nightly MySQL 8 suite for real migration validation — proposed, not yet locked.
- `SuperAdmin`: separate role vs `admin` + `*` permission — to decide at scaffolding.

---

## 2026-05-31 — Frontend design conventions locked (+ TypeScript dropped)

**Context:** Defining ReactJS frontend conventions, pairing with the backend conventions. Documented under new `docs/frontend/` folder.

**Decisions:**
1. **JavaScript only — TypeScript DROPPED.** ⚠️ Reversal of the earlier stack choice (`CLAUDE.md` listed React 18 + TypeScript). User decided JS/JSX only. Compensating measures recommended: PropTypes, ESLint, Vitest, JSDoc.
2. **Bootstrap 5** via SCSS import (themeable for RTM colours) — not CDN; consistent with existing mockups.
3. **Role-based layouts** — `src/layouts/{guru,juri,admin,awam}/`.
4. **Mobile & desktop layouts in separate files** — e.g. `GuruLayoutMobile.jsx` / `GuruLayoutDesktop.jsx`, picked by a `useIsMobile` breakpoint resolver (Bootstrap lg = 992px).
5. **Axios single instance** (`src/api/http.js`) — `withCredentials` + CSRF for Sanctum SPA; API modules grouped by role mirroring backend controllers; no direct `axios` in components.
6. **Config via env** — Vite `VITE_*` keys, read through one `src/config/index.js`; `.env` not committed, `.env.example` is.
7. **Laravel-style naming** — components/layouts PascalCase `.jsx`; role folders lowercase; functions/hooks camelCase; non-class modules lowercase `.js`; routes kebab-case; env UPPER_SNAKE.
8. **Views & helpers mirror Laravel** — `src/views/{role}/` (like `resources/views`), repeated JS functions in `src/helpers/` (like Laravel helpers), grouped by domain.

**Recommendations (not mandatory):** PropTypes, TanStack Query (its `refetchInterval` fits studio-scoring polling), React Router v6 + ProtectedRoute (mirrors backend role middleware), react-bootstrap, ESLint+Prettier, `@/` path alias, Vitest + RTL, role code-splitting, AuthContext, centralised error toast.

**Rationale:** Frontend structure mirrors backend (role grouping) for consistency and easy RTM handover (§ 3.14). JS-only honours the user's decision despite the long-term tradeoffs of dropping TS (noted in doc).

**Artifact:** `docs/frontend/README.md`.

---

## 2026-05-31 — Added 5th role: `pelajar` (student)

**Context:** User added a fifth RBAC role beyond the original four (Guru / Juri / Admin / Awam).

**Decision:**
- New role **`pelajar`** (student participant) — authenticated, role-gated like guru/juri/admin. Scope: view own team, submission status, schedule, certificate.
- Propagated consistently across backend + frontend conventions and `CLAUDE.md`:
  - Backend: role table, `routes/api/v1/pelajar.php` group (`role:pelajar`), `Controllers/Api/V1/Pelajar/`, folder summaries.
  - Frontend: `layouts/pelajar/` (mobile + desktop), `views/pelajar/`, `api/pelajar/`, `router/routes/pelajar.jsx` + `/pelajar` prefix group with `ProtectedRoute role="pelajar"`.

**Note:** Pelajar is mobile-first (students on phones). Exact permissions per role to be finalised at scaffolding; spec § mapping (§ 3.2.5 participant access) to confirm in URS.

---

## 2026-05-31 — Frontend auth, token storage & error handling

**Context:** Refining ProtectedRoute behaviour, token storage choice, and HTTP error handling for the React SPA.

**Decisions:**
1. **Token storage = Sanctum `httpOnly` cookie — NOT localStorage/sessionStorage.** Token never touches JavaScript (XSS-safe); cookie sent automatically via `withCredentials`; CSRF via Sanctum. Only non-sensitive UI state (user profile + roles) kept in memory (AuthContext / TanStack Query cache). `sessionStorage > localStorage` only if a JS token is ever unavoidable (e.g. kiosk) — exception, not default.
2. **Server is the real gate.** ProtectedRoute is UX only; every API request carries the cookie and the backend enforces session + role (role middleware). `useAuth` revalidates `me` via TanStack Query (refetch on window focus).
3. **Detailed error mapping** in the central Axios interceptor: 401→/login, 403→/403, 404→/404, 419→CSRF refresh+retry, 422→form (inline BM), 500/503→/ralat-pelayan, no-response→/ralat-rangkaian. API forced to JSON (no 302 redirects) via backend `ForceJsonResponse`.
4. **Special error pages** under `src/views/ralat/` (Larangan 403, TidakDijumpai 404, RalatPelayan 500, RalatRangkaian) + React Error Boundary for render errors. Laravel `message` shown to user; `exception/file/line` only when `import.meta.env.DEV`.

**Artifact:** `docs/frontend/README.md` §10–§11.

---

## Open questions for URS sessions with RTM

These were flagged in earlier drafts and need resolution during URS sessions:

1. **AWS account ownership** — RTM-owned or Stream.My-owned (with migration plan)?
2. **AWS region** — ap-southeast-5 vs ap-southeast-1; depends on RTM's data classification policy
3. **Cloudflare vs CloudFront** — for production edge layer (mockup site uses CloudFront already)
4. **DNS authoritative** — Route 53 vs RTM-internal (gov.my zone)
5. **OpenAI data residency** — if RTM rejects OpenAI (US-based), fallback is Azure OpenAI Singapore
6. **Pangkalan Data Sekolah access** — direct API vs CSV import (impacts Phase 1 timeline)
7. **Cloudflare WhatsApp Business approval lead time** — Meta usually 1-2 weeks
8. **AWS Support tier** — Business support recommended for SLA § 3.11.3

---

## How to update this log

When making a significant decision:
1. Add a new dated section under chronological order
2. Capture: context, decision, rationale, any later changes
3. Reference spec § when applicable
4. Commit + push so the laptop sees it too
