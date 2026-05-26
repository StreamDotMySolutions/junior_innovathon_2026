# Jadual Pembinaan Sistem — Modul × Man-Days

> **Tujuan:** Anggaran usaha (man-days) bagi setiap modul pembinaan **StreamDotMy CMS** untuk Junior Innovathon 2026.
> **Memenuhi spec §:** 2.1.22 (Jadual Pelaksanaan wajib).
> **Dokumen berkaitan:** [`jadual-pelaksanaan.md`](./jadual-pelaksanaan.md) (timeline kalendar 90-hari) · [`gantt-chart-rtm.md`](./gantt-chart-rtm.md) (carta Gantt RTM).

---

## Andaian

- **1 Man-Day (MD)** = 1 pembangun penuh masa × 8 jam kerja.
- Hari bekerja: Isnin – Jumaat.
- MD termasuk: coding, unit testing, code review, dokumentasi inline.
- MD **tidak termasuk**: mesyuarat URS, latihan, standby on-call, sokongan studio (dikira berasingan).
- Angka adalah **conservative** — buffer untuk risiko termasuk dalam anggaran.

---

## A. Modul Pembinaan Sistem

| Bil | Modul | Penerangan Ringkas | MD | Spec § |
|---|---|---|---:|---|
| 1 | Mobilisasi Infrastruktur | AWS account + Terraform IaC: VPC, ECS, RDS, ElastiCache, S3, ALB, ACM, GuardDuty, Cloudflare zone | 7 | 3.5.1 |
| 2 | Scaffolding Aplikasi | Laravel + React + CI/CD pipeline (GitHub Actions → ECR → ECS via OIDC) | 3 | 2.1.22 |
| 3 | Authentication & RBAC | Laravel Sanctum cookie auth + Spatie Permission (4 peranan: Guru/Juri/Admin/Awam) | 4 | 3.2.1 |
| 4 | School Directory | Import Pangkalan Data Sekolah (CSV) + typeahead search API + UI komponen | 3 | 3.2.5(a) |
| 5 | Pendaftaran Pasukan & Peserta | Workflow Guru: cipta pasukan, tambah peserta, validasi, status transition | 7 | 3.2.5 |
| 6 | Submissions (Video + Slaid) | S3 multipart pre-signed URL, chunked resumable upload, ffprobe validation, 5-slide upload | 10 | 3.2.5(b) |
| 7 | Streaming Server (RTMP) | nginx-rtmp on EC2 ASG + ffmpeg HLS transcode (4 rungs) + S3 segments + Cloudflare delivery | 12 | 3.5.1 |
| 8 | VOD Transcoding Pipeline | S3 event → Lambda → Fargate ffmpeg → HLS variants di S3 | 6 | 3.5.1 |
| 9 | Saringan 5-Zon | Assignment pasukan ke zon + UI penjurian (mobile/tablet) + rubrik + scoring API | 7 | 3.6.1 |
| 10 | Penjurian Studio + LED | Sistem pemarkahan 6 episod + endpoint live-results + UI LED full-screen + toggle reveal | 8 | 3.6.4 |
| 11 | Sijil Digital | PDF template + auto-generate (browsershot) + QR + portal verifikasi awam | 5 | 3.2.5(c) |
| 12 | CMS (Kandungan) | CRUD halaman, pengumuman, media library, WYSIWYG editor (Tiptap) | 6 | 3.2 |
| 13 | AI Chatbot | WhatsApp Cloud API + Telegram Bot + web widget + RAG dengan OpenAI GPT-4o-mini | 10 | 3.4 |
| 14 | Helpdesk + Ticketing | Submission tiket, SLA tracking, eskalasi automatik, dashboard operator | 6 | 3.8.1 |
| 15 | Analytics Dashboard | 3-tier dashboard (program / penjurian / sistem) + Recharts + eksport Excel | 7 | 3.3, 3.7.3 |
| 16 | Admin Dashboard | Pengurusan pengguna, peranan, kriteria penjurian, episod, audit log viewer | 5 | 3.7.3 |
| 17 | UAT + FAT + Bug Fix | Pengujian dengan RTM, fix issues, sign-off rasmi | 8 | 3.13 |
| | **Subtotal Pembinaan** | | **114** | |

---

## B. Aktiviti Sokongan (di luar pembinaan murni)

| Aktiviti | Penerangan | MD |
|---|---|---:|
| Dokumentasi | Manual Admin (2 hardcopy + softcopy) + Manual Teknikal (2 hardcopy + softcopy) | 5 |
| Latihan | 1 sesi SuperAdmin (4 org) + 1 sesi Juri/Pengguna (50 org) | 3 |
| Hardening & Audit | Load test (5,000 concurrent), security audit, penalty mitigation | 4 |
| Sokongan On-Site Studio | 2 engineer × 7 minggu (12 Sep – 1 Nov), 5 hari seminggu, standby semasa rakaman | 35 |
| Handover & Post-Mortem | Serahan source code, kredensial, sesi briefing akhir, laporan penutup | 3 |
| | **Subtotal Sokongan** | **50** |

---

## C. Rumusan

| Kategori | MD |
|---|---:|
| Pembinaan Sistem (A) | 114 |
| Aktiviti Sokongan (B) | 50 |
| **GRAND TOTAL** | **164** |

---

## D. Pecahan Ikut Peranan Pasukan

| Peranan | Bil. Orang | Anggaran MD |
|---|:---:|---:|
| Backend Developer (Laravel + AWS integration) | 2 | ~50 |
| Frontend Developer (React + Bootstrap 5) | 2 | ~40 |
| DevOps / Cloud Engineer (Terraform, AWS, Cloudflare) | 1 | ~25 |
| QA Engineer (UAT, FAT, automated testing) | 1 | ~10 |
| Trainer | 1 | ~3 |
| On-Site Studio Support | 2 (shift) | ~35 |
| Project Lead (oversight, URS, RTM coordination) | 1 | (cross-cutting, tidak dikira) |

---

## E. Sanity Check Kapasiti

| Metrik | Nilai |
|---|---:|
| Tempoh kontrak (kalendar) | 90 hari |
| Hari bekerja (Isnin–Jumaat) | ~64 hari |
| Saiz core team (Pembinaan + QA + DevOps) | 5 orang |
| **Kapasiti core team** | **~320 MD** |
| Keperluan (Pembinaan A + Dokumentasi + Latihan + Hardening + Handover, kecuali Studio Support yang menggunakan pasukan asing) | ~129 MD |
| **Buffer** | **~190 MD (~60%)** |

Buffer 60% memberi ruang yang munasabah untuk:
- Penyesuaian selepas sesi URS dengan RTM
- Glitches integrasi dengan API pihak ketiga (WhatsApp/Telegram/OpenAI)
- Keperluan unforeseen yang muncul semasa pelaksanaan
- Penambahbaikan UI/UX selepas feedback UAT

---

## F. Nota

1. **Anggaran conservative** — modul-modul kompleks seperti Streaming Server (12 MD) dan AI Chatbot (10 MD) telah mengambil kira pengalaman pasukan dengan teknologi sama (rujuk [`cms-usage.md`](./cms-usage.md)).
2. **Sokongan On-Site (35 MD)** adalah anggaran masa standby — bukan masa development aktif. Pasukan ini juga tersedia untuk pembaikan kecil semasa rakaman.
3. **Project Lead** tidak dimasukkan dalam pecahan MD modul kerana peranan adalah cross-cutting — coordination, URS minit (§ 2.1.16), pelaporan RTM.
4. **MD ≠ tempoh kalendar** — kerja paralel antara 5 orang core team bermakna 114 MD pembinaan boleh diselesaikan dalam ~23 hari bekerja (jika full parallelism), tetapi realitinya mengambil 8–10 minggu kerana dependency antara modul (cth: Authentication mesti siap sebelum Pendaftaran).

---

*Untuk pecahan timeline kalendar terperinci, sila rujuk [`jadual-pelaksanaan.md`](./jadual-pelaksanaan.md).*
