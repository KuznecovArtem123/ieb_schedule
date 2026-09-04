import { useEffect, useState } from 'react';

export function usePWAUpdate() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  useEffect(() => {
    const checkForUpdate = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.addEventListener('updatefound', () => {
          setUpdateReady(true);
        });
      }
    };
    checkForUpdate();
  }, []);

  const update = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return { updateReady, update };
}