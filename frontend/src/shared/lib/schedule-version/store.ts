import axiosClient from '@/shared/api/client';
import {
    getIsOnline,
    isNetworkError,
    reportNetworkError,
    reportNetworkSuccess,
} from '@/shared/lib/network';

const VERSION_URL = '/schedule/version/';

const MIN_REFRESH_MS = 30_000;

const listeners = new Set<() => void>();

let version: string | undefined;
let lastCheckedAt = 0;
let inFlight: Promise<void> | null = null;

function notify() {
    listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

export function getScheduleVersion(): string | undefined {
    return version;
}

interface ScheduleVersion {
    version: string;
    id: number;
};

function parseVersion(data: ScheduleVersion): string | null {
    const { id, version: value } = data;
    const idPart = typeof id === 'number' || typeof id === 'string' ? `${id}:` : '';
    return `${idPart}${value}`;
}

export function refreshScheduleVersion(force = false): Promise<void> {
    if (inFlight) return inFlight;
    if (!getIsOnline()) return Promise.resolve();
    if (!force && Date.now() - lastCheckedAt < MIN_REFRESH_MS) return Promise.resolve();

    inFlight = axiosClient
        .get<ScheduleVersion>(VERSION_URL)
        .then(({ data }) => {
            reportNetworkSuccess();
            lastCheckedAt = Date.now();

            const parsed = parseVersion(data);
            if (parsed !== null && parsed !== version) {
                version = parsed;
                notify();
            }
        })
        .catch((error: unknown) => {
            if (isNetworkError(error)) reportNetworkError();
            console.warn('Не удалось получить версию расписания', error);
        })
        .finally(() => {
            inFlight = null;
        });

    return inFlight;
}

void refreshScheduleVersion(true);

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void refreshScheduleVersion();
});

window.addEventListener('online', () => void refreshScheduleVersion(true));
