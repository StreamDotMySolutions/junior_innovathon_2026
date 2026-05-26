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
| 5 | **Analitik dan Pelaporan** | Dashboard Statistik Dalaman (Stream.My) + Google Analytics 4 — Malaysia / USA | Custom v1.0 / GA4 | Proprietary / Google Marketing Platform Terms (free tier) | Dashboard dalaman: jumlah pendaftaran, demografi (jantina, darjah/tingkatan, negeri, jenis sekolah), trend bacaan/hits/views, taburan markah penjurian, statistik chatbot. Dibangunkan dengan React + Recharts. Eksport laporan ke Excel via `maatwebsite/excel`. |
| 6 | **Perisian Sokongan: Application Server** | PHP-FPM — sumber terbuka antarabangsa | PHP 8.3+ (versi stabil terkini) | PHP License v3.01 | Runtime untuk Laravel API. Beroperasi di belakang Nginx melalui FastCGI socket. Opcache diaktifkan untuk prestasi. |
| 7 | **Perisian Sokongan: Database Server** | MySQL Community Server — USA (Oracle Corporation) | MySQL 8.0+ (versi LTS stabil terkini) | GPL v2 | Enjin InnoDB, set aksara `utf8mb4_unicode_ci` (sokongan penuh aksara BM). Backup automatik harian/mingguan/bulanan ke S3 berasingan menggunakan `spatie/laravel-backup`. |
| 8 | **Perisian Sokongan: Web Server** | Nginx — F5 Inc., USA | Versi stabil terkini | BSD-2-Clause | Reverse proxy untuk Laravel API dan static build React. HTTP/2 diaktifkan. Gzip / Brotli compression. Rate limiting per-IP untuk endpoint chatbot dan login. |
| 9 | **Perisian Sokongan: Kawalan Keselamatan Server** | ModSecurity WAF + OWASP CRS + Fail2Ban + UFW + Let's Encrypt + Cloudflare — pelbagai | Semua versi stabil terkini | Apache 2.0 / GPL / BSD / Cloudflare Free atau Pro | (i) ModSecurity WAF dengan OWASP Core Rule Set untuk SQLi / XSS / RCE protection. (ii) Fail2Ban untuk Intrusion Detection (memenuhi § 3.8.1(g)). (iii) UFW host firewall. (iv) Sijil SSL/TLS Let's Encrypt (auto-renew 90-hari) — memenuhi § 3.8.1(f). (v) Cloudflare untuk DDoS protection + CDN. |

---

## Compliance trace

Each row maps to the following tender requirements:

| Spec § | Requirement | Addressed by row |
|---|---|---|
| 3.2.1 | CMS local product / local developer, customizable, latest version | 1, 2 |
| 3.2.1 | API separation of front-end and back-end (Laravel back-end recommended) | 1 |
| 3.2.4 | CMS supports 5,000 concurrent users | 1, 6, 7, 8 |
| 3.3.1 | Cloud-based analytics for participation data | 5 |
| 3.3.2 | Data analytics tooling for user behaviour and portal performance | 5 |
| 3.4.1–3.4.3 | AI chatbot for web + WhatsApp/Telegram with "ask and reply" model | 3 |
| 3.5.1 | Server and storage infrastructure | 6, 7, 8 |
| 3.5.2 | Automated periodic backup with restoration capability | 2 (spatie/laravel-backup), 7 |
| 3.8.1(f) | SSL Certificate + DDoS Protection | 9 |
| 3.8.1(g) | 24/7 security monitoring, modern firewall, IDS | 9 |
| 3.11.4 | Daily, weekly, monthly backups; security audit per quarter; framework updates | 2, 7 |
| 3.12.5 | All software new and latest version | 2, 6, 7, 8, 9 |
| 3.14.1 | Full source code, plugins, license handover to RTM | 1, 2 |

---

## Open considerations

- **OpenAI data residency.** Vanilla OpenAI processes prompts in the USA. Mitigations declared in row 3 (PII filtering + privacy notice + opt-out from training). If RTM raises concerns during evaluation, fallback is **Azure OpenAI Service (Singapore region)** with Microsoft's Data Processing Addendum — same GPT-4o models, regional residency.
- **Cloudflare.** Free tier covers DDoS basics; production deployment may upgrade to Cloudflare Pro (~USD 20/month) for advanced WAF rules. Budget should accommodate either tier.
- **MySQL licensing.** GPL v2 covers self-hosted Community Server. If RTM later opts for managed MySQL on a cloud (AWS RDS, etc.), no licensing change needed since GPL still applies.
- **Database backups storage.** Daily/weekly/monthly backups should land in a **separate S3 bucket** with versioning enabled to satisfy § 3.11.4(a). Bucket lifecycle policy: keep daily for 30 days, weekly for 12 weeks, monthly for 12 months.
