const listeners = new Set<() => void>();

let online = navigator.onLine;

function set(next: boolean) {
    if (next === online) return;
    online = next;
    listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

export function getIsOnline() { return online; }

export function reportNetworkError() { set(false); }
export function reportNetworkSuccess() { set(true); }

window.addEventListener('online', () => set(true));
window.addEventListener('offline', () => set(false));
