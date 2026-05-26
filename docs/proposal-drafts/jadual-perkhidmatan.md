# Jadual Perkhidmatan — Draft

> **Status:** Draft v1 — pending internal review.
> **Source form:** `docs/Technical Proposal/JADUAL_PERKHIDMATAN.pdf`
> **Tender reference:** Sebut Harga Sistem Pendaftaran Penyertaan, Saringan dan Pelaporan Program Realiti Junior Innovathon di Jabatan Penyiaran Malaysia.

This document is the draft content for the Jadual Perkhidmatan (Service Schedule) component declaration. It lists every software product, version, and license being proposed under the contract. Once finalised, the values below are transcribed into the official PDF/eP-perolehan form.

---

## Proposed entries

| Bil | Komponen | Nama Produk / Negara | Versi Produk | License Key / Sijil Digital | Catatan |
|---|---|---|---|---|---|
| 1 | **Sistem Pengurusan Kandungan (CMS)** | Sistem Junior Innovathon CMS — Malaysia (Stream.My Sdn. Bhd.) | v1.0 (custom-built for this contract) | Proprietary. Source code dan hak milik penuh diserahkan kepada RTM pada akhir kontrak (§ 3.14.1) | Custom-built menggunakan ReactJS 18 (frontend) + Laravel API (backend) + MySQL 8 (database). Senibina 3-tier dengan pengasingan front-end dan back-end melalui API JSON, selaras dengan Lampiran 1. Memenuhi keperluan § 3.2.1 — "produk tempatan / local developer". |
| 2 | **Module atau Plugin Sokongan CMS** | Pakej sumber terbuka — pelbagai negara asal | Versi stabil terkini (terkunci dalam `composer.json` dan `package.json`) | MIT / BSD / Apache 2.0 (tiada yuran berulang) | **Frontend (React):** react, react-dom, react-router-dom, bootstrap 5, react-bootstrap, @tanstack/react-query, axios, react-hook-form, yup, react-dropzone, recharts, react-helmet-async, react-i18next, bootstrap-icons.  **Backend (Laravel):** laravel/framework, laravel/sanctum, spatie/laravel-permission, spatie/laravel-medialibrary, spatie/laravel-activitylog, spatie/laravel-backup, spatie/laravel-pdf, spatie/laravel-seo, maatwebsite/excel, intervention/image, league/flysystem-aws-s3-v3, predis/predis. |
| 3 | **Penyediaan Chatbot AI** | OpenAI GPT-4o-mini (chat) + text-embedding-3-small (RAG) — USA (OpenAI Inc.) | API v1 (versi stabil terkini) | Komersial — pay-per-token. Data pengguna tidak digunakan untuk latihan model (opt-out by default for API customers) | Disepadukan melalui `openai-php/laravel` SDK. Saluran: widget web, WhatsApp Cloud API (Meta), Telegram Bot API. RAG knowledge base diisi dengan FAQ, peraturan pertandingan, jadual program. Penapis PII (No. KP, alamat) dikuatkuasakan pada peringkat system prompt. Notis privasi dipaparkan kepada pengguna. |
| 4 | **Komponen SEO** | spatie/laravel-seo + spatie/laravel-sitemap (Belgium) + react-helmet-async (open source) | Versi stabil terkini | MIT | Auto sitemap.xml, robots.txt, Open Graph tags, schema.org structured data untuk acara (Event) dan finalis (Person), JSON-LD untuk paparan carian Google. |
| 5 | **Analitik dan Pelaporan** | Dashboard Statistik Dalaman (Stream.My) + Google Analytics 4 + Amazon CloudWatch — Malaysia / USA | Custom v1.0 / GA4 / CloudWatch | Proprietary / Google Marketing Platform Terms (free tier) / AWS Customer Agreement | Dashboard dalaman: jumlah pendaftaran, demografi (jantina, darjah/tingkatan, negeri, jenis sekolah), trend bacaan/hits/views, taburan markah penjurian, statistik chatbot. Dibangunkan dengan React + Recharts. CloudWatch dashboards untuk system metrics + SLA tracking. Eksport laporan ke Excel via `maatwebsite/excel`. |
| 6 | **Perisian Sokongan: Application Server** | **Amazon ECS Fargate** + PHP-FPM (container) — AWS Asia Pacific (Malaysia), `ap-southeast-5` | Fargate platform v1.4+ / PHP 8.3+ | AWS Customer Agreement / PHP License v3.01 | Container managed dengan auto-scaling (2–10 tasks, target CPU 60%), Multi-AZ deployment. PHP-FPM dengan Opcache. Image disimpan di **Amazon ECR** (private). Tiada server untuk patch — AWS handle underlying infrastructure (§ 3.11.4(c)). |
| 7 | **Perisian Sokongan: Database Server** | **Amazon RDS for MySQL** — AWS Asia Pacific (Malaysia), `ap-southeast-5` | MySQL 8.0+ Multi-AZ (versi LTS stabil terkini) | AWS Customer Agreement + GPL v2 (MySQL) | Managed RDS dengan `db.t4g.medium` Multi-AZ (Primary + synchronous Standby). InnoDB, `utf8mb4_unicode_ci`. Backup automatik harian (retain 7 hari) + manual snapshot mingguan/bulanan via **AWS Backup**, dengan **Cross-Region Replication** ke `ap-southeast-1` untuk DR (§ 3.11.4(a)). Encryption at rest dengan AWS KMS (CMK). Point-in-time recovery (PITR) untuk RPO < 5 minit. |
| 8 | **Perisian Sokongan: Web Server** | **Application Load Balancer (ALB)** + **Cloudflare Business** — AWS + Cloudflare Inc. (USA, KL POP) | ALB (managed) / Cloudflare Business | AWS Customer Agreement / Cloudflare Self-Serve | ALB Multi-AZ untuk Laravel API (HTTP/2, ACM TLS 1.2+, health checks). Static React SPA dihos di **Amazon S3** dengan Cloudflare sebagai edge cache. Cloudflare di hadapan AWS untuk CDN (POP Kuala Lumpur), bot management, rate limiting. mTLS antara Cloudflare dan ALB (Authenticated Origin Pulls) — origin tidak terdedah ke public. |
| 9 | **Perisian Sokongan: Kawalan Keselamatan Server** | **AWS GuardDuty + Security Hub + AWS WAF + KMS + Secrets Manager + ACM + CloudTrail + Cloudflare WAF** — AWS + Cloudflare | Semua perkhidmatan managed, versi terkini | AWS Customer Agreement / Cloudflare Self-Serve | (i) **AWS WAF** dengan Managed Rule Sets (AWS-OWASP, AWS-IPReputation, AWS-CommonRuleSet) — memenuhi § 3.8.1(f). (ii) **Cloudflare WAF** lapisan pertama dengan OWASP Core Rule Set + bot management. (iii) **AWS Shield Standard** (DDoS L3/L4, free) + Cloudflare DDoS. (iv) **GuardDuty** 24/7 anomaly detection (memenuhi § 3.8.1(g)). (v) **Security Hub** untuk CIS Benchmark + PCI-DSS rules + drift detection. (vi) **AWS KMS** CMK untuk encryption at rest (RDS, S3, ElastiCache, EBS, backups). (vii) **AWS Secrets Manager** untuk DB password + API keys (rotation automatic 30-hari untuk DB). (viii) **ACM** untuk TLS cert auto-renew (memenuhi § 3.8.1(f)). (ix) **CloudTrail** multi-region untuk audit semua API call (§ 2.1.7). (x) **VPC Flow Logs** untuk forensik trafik. (xi) **AWS Systems Manager Session Manager** untuk admin access (no SSH bastion, semua audited). |

---

## Compliance trace

Each row maps to the following tender requirements:

| Spec § | Requirement | Addressed by row |
|---|---|---|
| 2.1.7 | Akta Rahsia Rasmi — data dalam negara | 6, 7, 8, 9 (semua di `ap-southeast-5`) |
| 3.2.1 | CMS local product / local developer, customizable, latest version | 1, 2 |
| 3.2.1 | API separation of front-end and back-end (Laravel back-end recommended) | 1 |
| 3.2.4 | CMS supports 5,000 concurrent users | 1, 6 (Fargate auto-scale), 7 (RDS Multi-AZ), 8 (ALB + Cloudflare CDN) |
| 3.3.1 | Cloud-based analytics for participation data | 5 |
| 3.3.2 | Data analytics tooling for user behaviour and portal performance | 5 |
| 3.4.1–3.4.3 | AI chatbot for web + WhatsApp/Telegram with "ask and reply" model | 3 |
| 3.5.1 | Server and storage infrastructure | 6, 7, 8 (managed AWS, Multi-AZ) |
| 3.5.2 | Automated periodic backup with restoration capability | 7 (AWS Backup + RDS PITR + Cross-Region Replication) |
| 3.8.1(f) | SSL Certificate + DDoS Protection | 9 (ACM + AWS Shield + Cloudflare DDoS) |
| 3.8.1(g) | 24/7 security monitoring, modern firewall, IDS | 9 (GuardDuty 24/7 + Security Hub + VPC Flow Logs + WAF) |
| 3.11.4(a) | Daily, weekly, monthly backups | 7 (AWS Backup policy) |
| 3.11.4(b) | Security audit per quarter | 9 (Security Hub + Inspector) |
| 3.11.4(c) | Plugin / library / framework updates | 2, 6 (Fargate auto-patch dengan image rebuild) |
| 3.12.5 | All software new and latest version | 2, 6, 7, 8, 9 (managed AWS sentiasa terkini) |
| 3.14.1 | Full source code, plugins, license handover to RTM | 1, 2; **AWS account ownership** akan dipindah kepada RTM pada akhir kontrak |

---

## Open considerations

- **OpenAI data residency.** OpenAI memproses prompts di USA. Mitigasi dalam row 3 (PII filtering + privacy notice + opt-out dari training). Jika RTM bangkit concerns, fallback adalah **Azure OpenAI Service (Singapore region)** dengan Microsoft DPA — model GPT-4o yang sama, residency regional.
- **AWS region pilihan.** Semua perkhidmatan AWS dihos di **`ap-southeast-5` (Malaysia, KL)** untuk data residency dalam negara. Backup cross-region ke `ap-southeast-1` (Singapore) untuk Disaster Recovery — backup pail di-encrypt dengan KMS CMK.
- **Cloudflare data flow.** Cloudflare adalah edge layer di hadapan AWS. Origin AWS di KL bermakna **data at rest 100% dalam Malaysia**. Cloudflare TLS termination di POP global (termasuk KL) — jika RTM tegas tentang full sovereign edge, fallback adalah switch ke AWS CloudFront + AWS Shield Advanced.
- **AWS account ownership.** Untuk handover lancar (§ 3.14), AWS account perlu didaftarkan atas nama RTM dari awal (Stream.My sebagai operator IAM via IAM Identity Center). Alternatif: Stream.My-owned account dengan migrasi formal pada akhir kontrak — lebih kompleks.
- **AWS Support tier.** Untuk SLA § 3.11.3 (kritikal: SEGERA), **Business Support** (USD 100/bulan atau 10% spend, mana lebih tinggi) disyorkan untuk respons 1-jam dari AWS Support.
- **Cost commitment.** Anggaran kos AWS production ~USD 600–1,200/bulan + Cloudflare Business USD 240/bulan. Boleh dijimat ~30% dengan Compute Savings Plan (Fargate) + RDS Reserved Instance, dengan komitmen 1-tahun.
