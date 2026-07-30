# Backend — Aliran Pendaftaran Penuh (Event → Team → Project)

> **Projek:** Junior Innovathon 2026 — RTM
> **Vendor:** Stream.My
> **Last updated:** 2026-05-31
> **Pasangan:** [`schema.md`](./schema.md) (entiti) · [`README.md`](./README.md) (konvensyen API)
> **Memenuhi:** § 3.2.5 (pendaftaran), § 3.2.5(a) (Pangkalan Data Sekolah), § 3.6 (saringan)

Dokumen ini memperincikan **aliran pendaftaran hujung-ke-hujung**: Admin buka Event → Mentor daftar Team → cipta Project → muat naik bahan → hantar untuk pengesahan. Nama entiti/kolum **English**; prosa BM.

---

## Peserta aliran

| Aktor | Role | Peranan dalam pendaftaran |
|---|---|---|
| Admin | `admin` | Cipta & buka **Event**; tetapkan tarikh pendaftaran; sahkan (verify) Team/Project |
| Mentor | `mentor` | Daftar **Team** ke satu Event; tambah **Participant**; cipta **Project**; muat naik bahan; hantar |
| Participant | `participant` | (Pasif dalam pendaftaran) — lihat status; dibimbing oleh Mentor |

---

## Gambaran keseluruhan (peringkat)

```
[ADMIN]                [MENTOR]                                   [ADMIN]
Cipta Event  ──►  Daftar Team (pilih Event)  ──►  Tambah Participant (≤3)
   │                     │                              │
   │                     ▼                              ▼
   │              Cipta Project (1/Team)  ──►  Upload Video (3-min) + Slaid (≤5)
   │                     │                              │
   │                     ▼                              ▼
   └───────────►  Hantar untuk pengesahan  ──►  Verify: approve / reject
                                                       │
                                                       ▼
                                             Team layak ke Saringan (§3.6)
```

---

## 1. Admin buka Event

Endpoint: `POST /api/v1/admin/events` (role `admin`).

```jsonc
// Request
{ "name": "Junior Innovathon 2026", "year": "2026",
  "starts_at": "2026-05-30", "ends_at": "2026-06-30", "status": "open" }
```

- `status` Event: `draft → open → screening → studio → closed`.
- Pendaftaran hanya dibenarkan bila Event **`open`** dan dalam tetingkap `starts_at..ends_at`.
- Satu Event aktif pada satu masa (MVP); reka boleh sokong banyak Event.

---

## 2. Mentor daftar Team

Prasyarat: Mentor sudah ada akaun (role `mentor`) dan **belum** ada Team (satu Mentor = satu Team).

Endpoint: `POST /api/v1/mentor/pendaftaran` → `PendaftaranService::daftarTeam()`.

### Langkah dalam Service (satu transaksi)

```
1. Guard: Event wujud + status 'open' + dalam tetingkap tarikh        → 422 jika tidak
2. Guard: Mentor belum ada Team                                        → 409 jika sudah
3. Lookup School dari Pangkalan Data Sekolah (kod / carian typeahead)  → 422 jika tak jumpai
4. Cipta Team { mentor_id, school_id, category_id, event_id, team_name, verify_status: DRAFT }
5. (Category ditentukan oleh level sekolah + julat umur — lihat §3)
```

- **Pangkalan Data Sekolah** (`schools`, 11,716 baris) — carian typeahead ikut `code` / `name` / `state` (§ 3.2.5(a)).
- `event_id` **wajib** — Team terikat pada tepat 1 Event (schema).

---

## 3. Tambah Participant (≤ 3, dengan gate umur)

Endpoint: `POST /api/v1/mentor/pasukan/{team}/participant`.

### Peraturan (Form Request + Service)

| Peraturan | Kuatkuasa |
|---|---|
| Maksimum **3 participant** per Team | Service: kira sedia ada sebelum tambah |
| **No. KP unik** merentas sistem | DB `unique` + Form Request `exists`/`unique` |
| Participant belum terikat Team lain | Service: semak `participants.team_id` sedia ada → 409 |
| **Gate umur ikut kategori** — No. KP dalam julat `categories.icstart..iclast` | Service: banding 6 digit pertama IC (tarikh lahir) |
| Gender, race (rujuk `races`) | Form Request `in:` |

> Legacy `categories` menyimpan `icstart`/`iclast` (cth. Sekolah Rendah = lahir 2014–2020). Ini **gate umur automatik** — peserta luar julat ditolak.

---

## 4. Mentor cipta Project (1 per Team)

Endpoint: `POST /api/v1/mentor/projek` → `ProjectService::ciptaProject()`.

```
1. Guard: Team milik Mentor ini                          → 403 jika bukan
2. Guard: Team belum ada Project (unique team_id)         → 409 jika sudah
3. Cipta Project { team_id, name, description, status: DRAFT }
```

- **1 Team = 1 Project** (schema: `projects.team_id` unique).
- Bahan (video/slaid) & markah melekat pada **Project**, bukan Team.

---

## 5. Muat naik bahan — Video (3-min) + Slaid (≤5)

Fail besar → **S3 pre-signed multipart upload** (§ 3.2.5). Backend tak proksi bait fail.

### Aliran upload video

```
Mentor (React)                Laravel API                 S3 (ap-southeast-5)
   │  POST /mentor/projek/{p}/video/presign                    │
   │ ─────────────────────────────►  jana pre-signed URL(s)    │
   │ ◄─────────────────────────────  { uploadId, partUrls }    │
   │  PUT part 1..N ──────────────────────────────────────────►│  (terus ke S3)
   │  POST /mentor/projek/{p}/video/complete                   │
   │ ─────────────────────────────►  simpan Video{project_id,  │
   │                                  link, status: UPLOADED}   │
```

**Peraturan bahan:**
- **Video:** 1 sahaja, MP4, ~3 minit (had saiz + tempoh disemak; ~500MB). Sokongan **resume** (multipart) jika talian terputus.
- **Slaid:** maksimum **5** (`slides.project_id`); PDF/imej.
- Simpan hanya **kunci/URL S3** dalam DB (`videos.link`, `slides.slide`), bukan blob.
- Middleware `throttle:upload` (backend § 1.1) hadkan beban.

---

## 6. Hantar untuk pengesahan (submit)

Endpoint: `POST /api/v1/mentor/projek/{project}/submit`.

### Guard sebelum submit (Service)

```
✓ Team lengkap: 1–3 participant sah (gate umur lulus)
✓ Project ada: video (UPLOADED) + sekurang-kurangnya 1 slaid
✓ Event masih 'open'
→ set Project.status = SUBMITTED, Team.verify_status = PENDING
→ dispatch event: TeamSubmitted (notifikasi Admin)
```

Selepas submit, Mentor **tak boleh** ubah bahan (kunci) melainkan Admin reject.

---

## 7. Admin verify (approve / reject)

Endpoint: `PATCH /api/v1/admin/teams/{team}/verify`.

```jsonc
// approve
{ "verify_status": "approved" }
// reject (dengan sebab → Mentor boleh betulkan)
{ "verify_status": "rejected", "verify_msg": "Video tidak jelas / bukan 3 minit" }
```

- `approved` → Team layak masuk **Saringan** (§ 3.6); `verified_at` distamp.
- `rejected` → `verify_msg` dihantar ke Mentor; Project kembali boleh-edit (status DRAFT).
- Semua tindakan verify dilog oleh middleware `AuditLog` (§ 1.1, § 3.14).

---

## State machine

### Project.status
```
DRAFT ──(upload lengkap + submit)──► SUBMITTED ──(admin approve)──► VERIFIED
  ▲                                     │
  └──────────(admin reject)─────────────┘
```

### Team.verify_status  (padan legacy `verify_status`)
```
DRAFT ──submit──► PENDING ──approve──► APPROVED ──► (Saringan §3.6)
                     │
                     └──reject──► REJECTED ──(mentor betulkan + submit semula)──► PENDING
```

---

## Ringkasan endpoint

| Aktor | Method + Path | Tindakan |
|---|---|---|
| Admin | `POST /api/v1/admin/events` | Cipta Event |
| Admin | `PATCH /api/v1/admin/events/{event}` | Kemas kini / buka / tutup Event |
| Mentor | `GET /api/v1/mentor/schools?q=` | Carian Pangkalan Data Sekolah (typeahead) |
| Mentor | `POST /api/v1/mentor/pendaftaran` | Daftar Team ke Event |
| Mentor | `POST /api/v1/mentor/pasukan/{team}/participant` | Tambah participant (≤3, gate umur) |
| Mentor | `POST /api/v1/mentor/projek` | Cipta Project (1/Team) |
| Mentor | `POST /api/v1/mentor/projek/{project}/video/presign` | Minta pre-signed URL |
| Mentor | `POST /api/v1/mentor/projek/{project}/video/complete` | Sahkan upload selesai |
| Mentor | `POST /api/v1/mentor/projek/{project}/slaid` | Upload slaid (≤5) |
| Mentor | `POST /api/v1/mentor/projek/{project}/submit` | Hantar untuk pengesahan |
| Admin | `PATCH /api/v1/admin/teams/{team}/verify` | Approve / reject |
| Mentor/Participant | `GET /api/v1/mentor/pasukan` · `GET /api/v1/participant/pasukan` | Semak status |

---

## Validasi utama (Form Request)

| Medan | Peraturan |
|---|---|
| `event_id` | `required, exists:events,id`, Event `open` + dalam tarikh |
| `school_code` | `required, exists:schools,code` |
| `team_name` | `required, string, max:200` |
| `participant.ic` | `required, size:12, unique:participants,ic`, dalam julat `categories.icstart..iclast` |
| `participant[]` | `max:3` per Team |
| `project.name` | `required, string, max:200` |
| video | 1 sahaja, mime MP4, tempoh ~3 min, saiz maks |
| slaid | `max:5`, mime pdf/jpg/png |

Semua mesej ralat dalam **Bahasa Melayu** (§ 4 konvensyen).

---

## Nota reka bentuk

1. **Semua guard di Service** (bukan controller) — controller nipis (§ 3). Peraturan "1 Mentor 1 Team", "1 Team 1 Project", "peserta terikat", "gate umur" semua di Service + kekangan DB.
2. **Idempoten upload** — `presign` boleh dipanggil semula untuk part yang gagal; `complete` sahkan semua part sebelum simpan rekod.
3. **Audit** — cipta Event, verify, reject semua dilog (§ 3.14).
4. **Pengujian** — setiap guard ada Feature test (auth, role, 409/422, happy path) + Unit test Service (§ `testing.md`).

---

## Rujukan Spesifikasi

| Perkara | Spec § |
|---|---|
| Pendaftaran (Team, Participant, Project) | § 3.2.5 |
| Pangkalan Data Sekolah (lookup) | § 3.2.5(a) |
| Bahan: video 3-min + slaid | § 3.2.5 |
| Layak ke Saringan zon | § 3.6 |
| Audit trail verify | § 3.14 |
