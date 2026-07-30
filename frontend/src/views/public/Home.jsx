import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Halaman Utama (public) — hero, ringkasan program, 4 fasa. */
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
      <section className="ji-hero py-5">
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
      <section className="py-5">
        <div className="container">
          <h2 className="ji-section-title text-center mb-3">{t("home.about_title")}</h2>
          <p className="text-center mx-auto text-secondary" style={{ maxWidth: "48rem" }}>
            {t("home.about_body")}
          </p>
        </div>
      </section>

      {/* 4 Fasa */}
      <section className="py-5 bg-white border-top">
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
    </>
  );
}
