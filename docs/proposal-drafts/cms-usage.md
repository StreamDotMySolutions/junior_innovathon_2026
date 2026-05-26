# StreamDotMy CMS — Rekod Penggunaan & Portfolio

> **Tujuan:** Lampiran Pengalaman untuk Sebut Harga Junior Innovathon 2026. Memenuhi keperluan **§ 3.12.1**: *"Pembekal perlu mempunyai sekurang-kurangnya (5-10) tahun pengalaman syarikat dalam pembangunan sistem pendaftaran, penjurian dan pertandingan dalam talian."*
> **Sumber:** [streamdotmy.com](https://streamdotmy.com)

Dokumen ini menyenaraikan projek-projek terkini yang dibangunkan oleh Stream.My menggunakan **stack teknologi yang sama** dengan platform StreamDotMy CMS yang dicadangkan untuk Junior Innovathon 2026 (Laravel API + React + MySQL + AWS). Empat daripada enam projek di bawah adalah untuk **RTM (Jabatan Penyiaran Malaysia) — pelanggan yang sama dengan tender ini**, menunjukkan pemahaman mendalam Stream.My terhadap keperluan operasi RTM, integrasi penyiaran, dan tahap perkhidmatan kerajaan.

---

## 1. Portal Rasmi RTM

<img src="https://www.streamdotmy.com/projects/portal-rasmi-rtm.png" alt="Portal Rasmi RTM" width="640" />

| | |
|---|---|
| **Pelanggan** | Radio Televisyen Malaysia (RTM) |
| **Tahun** | 2023 |
| **Kategori** | Portal Kerajaan |
| **URL** | [rtm.gov.my](https://www.rtm.gov.my) |
| **Stack** | Laravel + React |

Portal korporat rasmi RTM, merangkumi senarai saluran TV nasional (TV1, TV2, OKEY, Sukan, Berita, RTM Parlimen), video carousel, dan kandungan berita penyiaran. **Stack yang sama** dengan yang dicadangkan untuk StreamDotMy CMS — Laravel sebagai backend API dengan React sebagai SPA frontend.

**Kaitan dengan Junior Innovathon 2026:** Menunjukkan pengalaman langsung Stream.My membangun portal awam RTM bertahap kerajaan, termasuk integrasi kandungan video, struktur navigasi pelbagai saluran, dan keperluan branding RTM.

---

## 2. Portal Radio (Jaringan Penyiaran Malaysia)

<img src="https://www.streamdotmy.com/projects/radio.rtm.gov.my.PNG" alt="Portal Radio Jaringan Penyiaran Malaysia" width="640" />

| | |
|---|---|
| **Pelanggan** | RTM — Jaringan Penyiaran Malaysia |
| **Tahun** | 2024 |
| **Kategori** | Streaming Hub Bersepadu |
| **URL** | [radio.rtm.gov.my](https://radio.rtm.gov.my) |
| **Stack** | AWS, HLS/DASH streaming |

Streaming hub bersepadu yang menggabungkan **semua stesen radio RTM** dalam satu platform — live player, station switcher, dan panel chat pendengar dalam masa nyata. Sistem ini menggunakan **HLS/DASH streaming** di atas infrastruktur **AWS** — sama dengan pipeline streaming yang dicadangkan untuk StreamDotMy CMS.

**Kaitan dengan Junior Innovathon 2026:** Membuktikan keupayaan Stream.My membina **streaming pipeline tahap penyiaran** dengan multi-bitrate adaptive streaming, real-time chat, dan capaian skala besar. Tepat untuk keperluan rakaman studio Junior Innovathon dan VOD video penyertaan.

---

## 3. Radio Muzik

<img src="https://www.streamdotmy.com/projects/radio-muzik.PNG" alt="Radio Muzik RTM" width="640" />

| | |
|---|---|
| **Pelanggan** | RTM |
| **Tahun** | 2024 |
| **Kategori** | Tapak Stesen Radio |
| **URL** | [radiomuzik.rtm.gov.my](https://radiomuzik.rtm.gov.my) |
| **Stack** | AWS Elemental MediaLive |

Portal stesen muzik kontemporari RTM dengan persistent live-stream bar, jadual rancangan, charts, dan kandungan artis. Menggunakan **AWS Elemental MediaLive** untuk live broadcast pipeline — pengalaman langsung dengan **AWS broadcast services**.

**Kaitan dengan Junior Innovathon 2026:** Pengalaman dengan AWS Elemental dan persistent streaming UI terus diaplikasikan pada modul rakaman studio Junior Innovathon (6 episod live).

---

## 4. Nasional FM 88.5

<img src="https://www.streamdotmy.com/projects/nasional--logo.PNG" alt="Nasional FM 88.5 RTM" width="640" />

| | |
|---|---|
| **Pelanggan** | RTM |
| **Tahun** | 2025 |
| **Kategori** | Tapak Stesen Radio |
| **URL** | [nasionalfm.rtm.gov.my](https://nasionalfm.rtm.gov.my) |
| **Stack** | AWS, NGINX |

Laman web rasmi saluran flagship talk-and-music RTM. Termasuk live streaming, jadual rancangan, kad DJ roster, dan kandungan komuniti. **NGINX** sebagai web server / reverse proxy — sama dengan komponen pelayan streaming RTMP yang dicadangkan untuk StreamDotMy CMS.

**Kaitan dengan Junior Innovathon 2026:** Pengalaman dengan **NGINX** di atas AWS dapat diaplikasikan secara langsung pada pelayan **nginx-rtmp** untuk ingest siaran studio Junior Innovathon.

---

## 5. iMOHON (Sistem Permohonan RTM)

<img src="https://www.streamdotmy.com/projects/imohon.png" alt="iMOHON RTM" width="640" />

| | |
|---|---|
| **Pelanggan** | RTM |
| **Tahun** | 2023 |
| **Kategori** | Sistem Dalaman |
| **URL** | [imohon.rtm.gov.my](https://imohon.rtm.gov.my) |
| **Stack** | Laravel Sanctum, MySQL |

Portal pengesahan staf dan pemohon menggunakan log masuk berasaskan No. KP dengan keupayaan pendaftaran kendiri. **Laravel Sanctum** untuk authentication — komponen yang sama akan digunakan dalam StreamDotMy CMS untuk pengurusan peranan Guru / Juri / Admin / Awam.

**Kaitan dengan Junior Innovathon 2026:** Pengalaman dengan **Laravel Sanctum + MySQL** untuk sistem authentication dan pengurusan pengguna gov — keperluan asas modul Pendaftaran dan Penjurian Junior Innovathon.

---

## 6. i-SYAEMS / Hotline JAIS

<img src="https://www.streamdotmy.com/projects/hotline-jais.png" alt="i-SYAEMS Hotline JAIS" width="640" />

| | |
|---|---|
| **Pelanggan** | Jabatan Agama Islam Selangor (JAIS) |
| **Tahun** | 2025 |
| **Kategori** | Platform Perkhidmatan Awam |
| **URL** | [hotline.jais.gov.my](https://hotline.jais.gov.my) |
| **Stack** | Laravel + React, OpenAI |

Portal aduan awam untuk laporan berkaitan Syariah, dengan case tracking dan dashboard pegawai dalaman. Menggunakan **Laravel + React + OpenAI** — **stack identikal** dengan StreamDotMy CMS yang dicadangkan (termasuk chatbot AI dengan OpenAI).

**Kaitan dengan Junior Innovathon 2026:** Pengalaman dengan **integrasi OpenAI** secara langsung diaplikasikan pada chatbot AI Junior Innovathon. Sistem ticketing JAIS juga adalah corak yang sama dengan modul Helpdesk StreamDotMy CMS (SLA-tracked, kategori severity).

---

## Ringkasan Portfolio

| # | Projek | Pelanggan | Tahun | Stack Bersama dengan StreamDotMy CMS |
|---|---|---|---|---|
| 1 | Portal Rasmi RTM | RTM | 2023 | Laravel + React |
| 2 | Portal Radio | RTM (JPM) | 2024 | AWS + HLS streaming |
| 3 | Radio Muzik | RTM | 2024 | AWS Elemental |
| 4 | Nasional FM 88.5 | RTM | 2025 | AWS + NGINX |
| 5 | iMOHON | RTM | 2023 | Laravel Sanctum + MySQL |
| 6 | i-SYAEMS / Hotline JAIS | JAIS Selangor | 2025 | Laravel + React + OpenAI |

**Statistik pengalaman:**

- **4 daripada 6 projek** untuk RTM (pelanggan yang sama dengan tender Junior Innovathon)
- **5 daripada 6 projek** menggunakan Laravel sebagai backend
- **3 daripada 6 projek** melibatkan **AWS-based streaming** infrastructure
- **2 daripada 6 projek** menggunakan **OpenAI** untuk chatbot AI
- Pengalaman gov sector merangkumi: RTM, JAIS Selangor

---

## Pemetaan Kepada Modul StreamDotMy CMS (Junior Innovathon 2026)

Setiap modul yang dicadangkan dalam StreamDotMy CMS telah dibina sebelum ini dalam projek-projek di atas:

| Modul StreamDotMy CMS untuk JI 2026 | Bukti Pengalaman |
|---|---|
| Multi-role authentication (Guru/Juri/Admin/Awam) | **iMOHON** — Laravel Sanctum + role-based access untuk staf RTM |
| Laravel API + React SPA | **Portal Rasmi RTM**, **i-SYAEMS** |
| Streaming server (RTMP → HLS) | **Portal Radio**, **Radio Muzik** — HLS/DASH + AWS Elemental |
| Pelayan nginx untuk video delivery | **Nasional FM 88.5** — NGINX di atas AWS |
| AWS deployment (`ap-southeast-5`) | **Portal Radio**, **Radio Muzik**, **Nasional FM** |
| Chatbot AI dengan OpenAI | **i-SYAEMS / Hotline JAIS** |
| Helpdesk + ticketing SLA-tracked | **i-SYAEMS / Hotline JAIS** |
| Pengurusan kandungan dinamik (CMS) | **Portal Rasmi RTM** — content carousel, news, channels |
| User registration dengan IC-based identity | **iMOHON** |

Setiap pattern teknikal dalam StreamDotMy CMS telah **terbukti berfungsi dalam pengeluaran**, bukan reka bentuk teoritis.

---

## Rujukan Tambahan

- Maklumat syarikat lanjut: [streamdotmy.com](https://streamdotmy.com)
- Status pendaftaran:
  - SSM: 002484760-U
  - MOF: 15 kategori perolehan ICT (termasuk kod bidang **210103, 210104, 210108**)
  - Bumiputera Certified
  - AWS-powered infrastructure

---

*Dokumen ini disediakan sebagai sokongan kepada Technical Proposal — Lampiran Pengalaman, memenuhi keperluan § 3.12.1 sebut harga.*
