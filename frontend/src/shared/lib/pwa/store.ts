import type { BeforeInstallPromptEvent, InstallMode, InstallOutcome } from './types';
import { isIOS } from './platform';

const standaloneQuery = window.matchMedia('(display-mode: standalone)');
const listeners = new Set<() => void>();

function readInstalled(): boolean {
    return standaloneQuery.matches
        || ('standalone' in window.navigator && window.navigator.standalone === true);
}

let deferred: BeforeInstallPromptEvent | null = null;
let installed = readInstalled();

function notify() {
    listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

export function getInstallMode(): InstallMode {
    if (installed) return 'unavailable';
    if (deferred) return 'prompt';
    if (isIOS) return 'manual';
    return 'unavailable';
}

export async function promptInstall(): Promise<InstallOutcome> {
    if (!deferred) return 'unavailable';

    await deferred.prompt();
    const { outcome } = await deferred.userChoice;

    deferred = null;
    notify();

    return outcome;
}

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    notify();
});

window.addEventListener('appinstalled', () => {
    deferred = null;
    installed = true;
    notify();
});

standaloneQuery.addEventListener('change', () => {
    installed = readInstalled();
    notify();
});
