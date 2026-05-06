// src/serviceWorkerRegistration.js

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(() => {
          console.log("Service Worker registrado ✅");
        })
        .catch((error) => {
          console.log("Erro no Service Worker:", error);
        });
    });
  }
}