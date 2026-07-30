import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/i18n"; // inisialisasi i18n (BM default)
import "@/styles/app.scss"; // Bootstrap 5 (light theme) + tema RTM
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // navbar toggle, dropdown

import App from "@/App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
