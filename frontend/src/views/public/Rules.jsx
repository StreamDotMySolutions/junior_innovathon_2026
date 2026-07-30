import { useTranslation } from "react-i18next";

/** Syarat Pertandingan (public) — kelayakan, kategori, penyerahan. */
export default function Rules() {
  const { t } = useTranslation();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <h1 className="ji-section-title mb-2">{t("rules.title")}</h1>
          <p className="text-secondary mb-4">{t("rules.intro")}</p>

          {/* Kelayakan */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">{t("rules.eligibility_title")}</h5>
              <ul className="mb-0">
                <li>{t("rules.eligibility.team")}</li>
                <li>{t("rules.eligibility.one_team")}</li>
                <li>{t("rules.eligibility.school")}</li>
              </ul>
            </div>
          </div>

          {/* Kategori */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">{t("rules.categories_title")}</h5>
              <div className="row g-3">
                {["primary", "secondary", "special"].map((c) => (
                  <div className="col-md-4" key={c}>
                    <div className="border rounded p-3 h-100 bg-light">
                      {t(`rules.categories.${c}`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Penyerahan */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">{t("rules.submission_title")}</h5>
              <ul className="mb-0">
                <li>{t("rules.submission.video")}</li>
                <li>{t("rules.submission.slides")}</li>
                <li>{t("rules.submission.deadline")}</li>
              </ul>
            </div>
          </div>

          <p className="small text-muted fst-italic">{t("rules.note")}</p>
        </div>
      </div>
    </div>
  );
}
