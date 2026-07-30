import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { router } from "@/router/index.jsx";

/** Fallback semasa lazy chunk dimuatkan. */
function Loading() {
  const { t } = useTranslation();
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{t("common.loading")}</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
