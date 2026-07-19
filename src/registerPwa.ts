const APP_SW_PATH = "/sw.js";

const isPreviewHost = (hostname: string) =>
  hostname.startsWith("id-preview--") ||
  hostname.startsWith("preview--") ||
  hostname === "lovableproject.com" ||
  hostname.endsWith(".lovableproject.com") ||
  hostname === "lovableproject-dev.com" ||
  hostname.endsWith(".lovableproject-dev.com") ||
  hostname === "beta.lovable.dev" ||
  hostname.endsWith(".beta.lovable.dev");

const getRegistrationScriptPath = (registration: ServiceWorkerRegistration) => {
  const scriptUrl =
    registration.active?.scriptURL ??
    registration.waiting?.scriptURL ??
    registration.installing?.scriptURL;

  if (!scriptUrl) return "";

  try {
    return new URL(scriptUrl).pathname;
  } catch {
    return "";
  }
};

const isAppServiceWorker = (registration: ServiceWorkerRegistration) => {
  const scriptPath = getRegistrationScriptPath(registration);
  return scriptPath === APP_SW_PATH || registration.scope === new URL("/", window.location.href).href;
};

const unregisterAppServiceWorkers = async () => {
  if (!("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    registrations
      .filter(isAppServiceWorker)
      .map((registration) => registration.unregister()),
  );
};

const shouldRegisterPwa = () => {
  if (!import.meta.env.PROD) return false;
  if (window.self !== window.top) return false;
  if (isPreviewHost(window.location.hostname)) return false;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return false;

  return true;
};

export const registerPwa = async () => {
  if (!("serviceWorker" in navigator)) return;

  if (!shouldRegisterPwa()) {
    await unregisterAppServiceWorkers();
    return;
  }

  const { registerSW } = await import("virtual:pwa-register");
  registerSW({ immediate: false });
};