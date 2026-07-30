import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** 404 — Halaman tidak dijumpai. */
export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="container py-5 text-center">
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <p className="lead text-secondary mb-4">
        Maaf, halaman yang anda cari tidak dijumpai.
      </p>
      <Link to="/" className="btn btn-primary">
        {t("common.back_home")}
      </Link>
    </div>
  );
}
