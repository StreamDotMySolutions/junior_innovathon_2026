import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// NOTA: statistik & episod buat masa ini data statik (mock).
// Akan disambung ke endpoint public (cth. GET /api/v1/public/statistik) kemudian.
const STATS = [
  { key: "teams", value: "1,240" },
  { key: "participants", value: "3,720" },
  { key: "schools", value: "860" },
  { key: "states", value: "16" },
];

const EPISODES = [
  { no: 1, date: "12 Sep 2026" },
  { no: 2, date: "26 Sep 2026" },
  { no: 3, date: "10 Okt 2026" },
  { no: 4, date: "17 Okt 2026" },
  { no: 5, date: "24 Okt 2026" },
  { no: 6, date: "01 Nov 2026" },
];

const SPONSORS = ["RTM", "KPM", "MDEC", "MCMC", "Penaja A", "Penaja B"];

/** Halaman Utama (public) — hero, tentang, 4 fasa, statistik, episod, penaja, CTA. */
export default function Home() {
  const { t } = useTranslation();

  const phases = [
    { key: "registration", icon: "1" },
    { key: "screening", icon: "2" },
    { key: "studio", icon: "3" },
    { key: "award", icon: "4" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="ji-hero ji-section py-5">
        <div className="container py-4 text-center">
          <h1 className="display-5 fw-bold mb-3">{t("home.hero_title")}</h1>
          <p className="lead mb-4 mx-auto" style={{ maxWidth: "42rem" }}>
            {t("home.hero_subtitle")}
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/register" className="btn btn-warning btn-lg fw-semibold">
              {t("home.cta_register")}
            </Link>
            <Link to="/syarat-pertandingan" className="btn btn-outline-light btn-lg">
              {t("home.cta_rules")}
            </Link>
          </div>
        </div>
      </section>

      {/* Tentang */}
      <section className="ji-section py-5">
        <div className="container">
          <h2 className="ji-section-title text-center mb-3">{t("home.about_title")}</h2>
          <p className="text-center mx-auto text-secondary" style={{ maxWidth: "48rem" }}>
            {t("home.about_body")}
          </p>
        </div>
      </section>

      {/* 4 Fasa */}
      <section className="ji-section py-5 bg-white border-top">
        <div className="container">
          <h2 className="ji-section-title text-center mb-5">{t("home.phase_title")}</h2>
          <div className="row g-4">
            {phases.map(({ key, icon }) => (
              <div className="col-6 col-lg-3" key={key}>
                <div className="card h-100 border-0 shadow-sm text-center">
                  <div className="card-body">
                    <div
                      className="badge bg-primary rounded-circle fs-5 mb-3 d-inline-flex align-items-center justify-content-center"
                      style={{ width: "3rem", height: "3rem" }}
                    >
                      {icon}
                    </div>
                    <h6 className="card-title mb-0">{t(`home.phases.${key}`)}</h6>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistik penyertaan */}
      <section className="ji-hero ji-section py-5">
        <div className="container">
          <h2 className="text-center text-white mb-5">{t("home.stats_title")}</h2>
          <div className="row g-4">
            {STATS.map(({ key, value }) => (
              <div className="col-6 col-lg-3" key={key}>
                <div className="ji-stat card text-center h-100">
                  <div className="card-body">
                    <div className="ji-stat__value">{value}</div>
                    <div className="small text-uppercase opacity-75 mt-2">
                      {t(`home.stats.${key}`)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jadual 6 episod studio */}
      <section className="ji-section py-5 bg-white border-top">
        <div className="container">
          <h2 className="ji-section-title text-center mb-2">{t("home.episodes_title")}</h2>
          <p className="text-center text-secondary mb-5">{t("home.episodes_subtitle")}</p>
          <div className="row g-3">
            {EPISODES.map(({ no, date }) => (
              <div className="col-12 col-md-6 col-lg-4" key={no}>
                <div className="ji-episode card shadow-sm h-100">
                  <div className="card-body d-flex align-items-center gap-3">
                    <span className="badge bg-primary fs-6">
                      {t("home.episode")} {no}
                    </span>
                    <span className="text-secondary">{date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Penaja */}
      <section className="ji-section py-5">
        <div className="container text-center">
          <h2 className="ji-section-title mb-2">{t("home.sponsors_title")}</h2>
          <p className="text-secondary mb-5">{t("home.sponsors_note")}</p>
          <div className="ji-sponsor-grid d-grid gap-3">
            {SPONSORS.map((name) => (
              <div
                key={name}
                className="border rounded bg-white d-flex align-items-center justify-content-center fw-semibold text-secondary py-4"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner CTA */}
      <section className="ji-hero ji-section py-5">
        <div className="container text-center py-3">
          <h2 className="fw-bold mb-3">{t("home.cta_banner_title")}</h2>
          <p className="lead mb-4 mx-auto" style={{ maxWidth: "40rem" }}>
            {t("home.cta_banner_body")}
          </p>
          <Link to="/register" className="btn btn-warning btn-lg fw-semibold">
            {t("home.cta_register")}
          </Link>
        </div>
      </section>
    </>
  );
}
