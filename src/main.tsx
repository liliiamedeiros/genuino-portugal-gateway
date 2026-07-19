import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { registerPwa } from "./registerPwa";
import "./index.css";

const schedulePwaRegistration = () => {
  const startRegistration = () => {
    void registerPwa();
  };

  const requestIdleCallback = window.requestIdleCallback;
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(startRegistration, { timeout: 4000 });
    return;
  }

  globalThis.setTimeout(startRegistration, 2500);
};

if (document.readyState === "complete") {
  schedulePwaRegistration();
} else {
  window.addEventListener("load", schedulePwaRegistration, { once: true });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
