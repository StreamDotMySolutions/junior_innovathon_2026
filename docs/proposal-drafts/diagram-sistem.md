# Diagram Sistem — Draft

> **Status:** Draft v1.
> **Source reference:** `docs/Technical Proposal/Lampiran_1.pdf`
> **Purpose:** Senibina 3-tier untuk Sistem Pendaftaran Penyertaan, Saringan, Penjurian dan Pelaporan Program Realiti Junior Innovathon 2026, selaras dengan Lampiran 1 dokumen sebut harga.

---

## Reproduksi Lampiran 1 (3-tier asas)

```mermaid
flowchart LR
    subgraph PT["Presentation Tier"]
        direction TB
        G["Client<br/>Guru"]
        J["Client<br/>Juri"]
        A["Client<br/>Admin"]
        W["Client<br/>Awam"]
    end

    subgraph AT["Application Tier"]
        AS["Application Server<br/>Laravel – PHP<br/>Apache / Nginx"]
    end

    subgraph DT["Data Tier"]
        direction TB
        DB[("Data Source<br/>MySQL")]
        OS[("Object Storage<br/>S3 / bucket")]
    end

    G --> AS
    J --> AS
    A --> AS
    W --> AS
    AS --> DB
    AS --> OS

    classDef tier fill:#f5f5f5,stroke:#666,stroke-width:1px,color:#000
    classDef client fill:#ffffff,stroke:#333,stroke-width:1px,color:#000
    classDef server fill:#e8f0fe,stroke:#1a73e8,stroke-width:1.5px,color:#000
    classDef data fill:#fef7e0,stroke:#f9ab00,stroke-width:1.5px,color:#000

    class G,J,A,W client
    class AS server
    class DB,OS data
```

Catatan: *Aplikasi server hendaklah menggunakan versi yang TERKINI* (per Lampiran 1).

---

## Versi diperinci (mengikut tumpukan dipilih)

Sama seperti rajah asal, tetapi memetakan teknologi konkrit yang dicadangkan dalam Jadual Perkhidmatan.

```mermaid
flowchart LR
    subgraph PT["Presentation Tier — ReactJS 18 SPA + Bootstrap 5"]
        direction TB
        G["Guru<br/>(Pendaftaran pasukan,<br/>muat naik video & slaid)"]
        J["Juri<br/>(Saringan 5 zon,<br/>Penjurian 6 episod)"]
        A["Admin<br/>(CMS, dashboard,<br/>laporan)"]
        W["Awam<br/>(Portal awam,<br/>verifikasi sijil)"]
    end

    subgraph AT["Application Tier"]
        NX["Nginx<br/>(reverse proxy, TLS, HTTP/2)"]
        AS["Laravel API<br/>PHP-FPM 8.3+<br/>Sanctum · Spatie Permission"]
        Q["Redis<br/>(queue, cache, session)"]
        CB["OpenAI API<br/>(GPT-4o-mini chatbot)"]
    end

    subgraph DT["Data Tier"]
        direction TB
        DB[("MySQL 8<br/>(InnoDB · utf8mb4)")]
        OS[("Object Storage<br/>S3-compatible<br/>video · slaid · sijil PDF")]
        BK[("Backup Bucket<br/>(harian / mingguan / bulanan)")]
    end

    subgraph EX["External Services"]
        WA["WhatsApp Cloud API"]
        TG["Telegram Bot API"]
        CF["Cloudflare<br/>(DDoS · CDN · WAF)"]
        LE["Let's Encrypt<br/>(SSL / TLS)"]
    end

    G --> CF
    J --> CF
    A --> CF
    W --> CF
    CF --> NX
    NX --> AS
    AS --> Q
    AS --> DB
    AS --> OS
    AS --> CB
    AS --> WA
    AS --> TG
    DB -.backup.-> BK
    OS -.backup.-> BK
    LE -.cert.-> NX

    classDef client fill:#ffffff,stroke:#333,stroke-width:1px,color:#000
    classDef server fill:#e8f0fe,stroke:#1a73e8,stroke-width:1.5px,color:#000
    classDef data fill:#fef7e0,stroke:#f9ab00,stroke-width:1.5px,color:#000
    classDef external fill:#e6f4ea,stroke:#0f9d58,stroke-width:1.5px,color:#000

    class G,J,A,W client
    class NX,AS,Q,CB server
    class DB,OS,BK data
    class WA,TG,CF,LE external
```

---

## Komponen utama

| Lapisan | Komponen | Teknologi |
|---|---|---|
| Presentation | SPA frontend | ReactJS 18 + TypeScript + Vite + Bootstrap 5 |
| Presentation | Routing & state | React Router v6, TanStack Query, React Hook Form |
| Application | Web server | Nginx (reverse proxy, HTTP/2, gzip/brotli) |
| Application | API server | Laravel (latest) on PHP-FPM 8.3+ |
| Application | Auth | Laravel Sanctum (SPA cookie session) |
| Application | Roles | Spatie laravel-permission (Guru, Juri, Admin, Awam) |
| Application | Queue & cache | Redis |
| Application | AI chatbot | OpenAI GPT-4o-mini + text-embedding-3-small (RAG) |
| Data | Relational DB | MySQL 8 (InnoDB, utf8mb4_unicode_ci) |
| Data | Object storage | S3-compatible (video, slaid, sijil PDF) |
| Data | Backup | Pail S3 berasingan, retensi harian/mingguan/bulanan |
| External | DDoS + CDN + WAF | Cloudflare |
| External | SSL/TLS | Let's Encrypt (auto-renew 90 hari) |
| External | Messaging | WhatsApp Cloud API, Telegram Bot API |

---

## Cara eksport untuk dokumen proposal

Rajah Mermaid di atas dirender secara automatik pada GitHub (boleh dilihat dengan membuka fail ini di github.com). Untuk eksport ke PNG / SVG / PDF untuk dilampirkan dalam dokumen proposal:

**Pilihan A — Mermaid Live Editor (paling cepat)**
1. Buka https://mermaid.live
2. Salin kod blok Mermaid di atas (mulakan dari `flowchart LR`)
3. Tampal pada panel kiri
4. Klik **Actions → PNG** atau **SVG**

**Pilihan B — Mermaid CLI (untuk batch / automated)**
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i diagram-sistem.mmd -o diagram-sistem.png -w 1600 -H 1000
```

**Pilihan C — VS Code extension**
Pasang *Mermaid Chart* extension, buka fail `.md` ini, klik kanan rajah → **Export as PNG**.

---

## Versi alternatif (jika diperlukan format draw.io)

Jika RTM atau JKR meminta format editable (`.drawio` / `.vsdx`), rajah ini boleh dieksport ke `app.diagrams.net`:
1. Buka https://app.diagrams.net
2. **Arrange → Insert → Advanced → Mermaid**
3. Tampal kod Mermaid → **Insert**
4. Save sebagai `.drawio` atau Export sebagai `.png` / `.pdf` / `.vsdx`.
