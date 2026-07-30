import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

/**
 * Placeholder sementara untuk laluan yang belum dibina (Daftar / Log Masuk).
 * Akan diganti dengan borang sebenar dalam fasa auth.
 */
export default function Placeholder({ titleKey }) {
  const { t } = useTranslation();
  return (
    <div className="container py-5 text-center">
      <h1 className="ji-section-title mb-3">{t(titleKey)}</h1>
      <p className="text-secondary mb-4">
        Bahagian ini akan tersedia tidak lama lagi.
      </p>
      <Link to="/" className="btn btn-outline-primary">
        {t("common.back_home")}
      </Link>
    </div>
  );
}

Placeholder.propTypes = {
  titleKey: PropTypes.string.isRequired,
};
