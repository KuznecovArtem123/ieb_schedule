import axiosClient from '@/shared/api/client';
import { isAxiosError } from 'axios';
import { evictCacheByPrefix } from '@/shared/lib/db/cache';
import {
    getIsOnline,
    isNetworkError,
    reportNetworkError,
    reportNetworkSuccess,
} from '@/shared/lib/network';

const VERSION_URL = '/schedule/version/';
const VERSION_STORAGE_KEY = 'schedule-version';

const MIN_REFRESH_MS = 30_000;

const listeners = new Set<() => void>();

type ScheduleVersionScope = {
    edu: string;
    week: string;
};

type StoredVersions = Record<string, string>;

function getScopeKey({ edu, week }: ScheduleVersionScope): string {
    return `${edu}:${week}`;
}

function readStoredVersions(): StoredVersions {
    try {
        const stored = localStorage.getItem(VERSION_STORAGE_KEY);
        if (!stored) return {};
        const parsed: unknown = JSON.parse(stored);
        return parsed !== null && typeof parsed === 'object' ? parsed as StoredVersions : {};
    } catch (error) {
        console.error(error);
        return {};
    }
}

function storeVersions(value: StoredVersions) {
    try {
        localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
        console.error(error);
    }
}

let versions = readStoredVersions();
const lastCheckedAt = new Map<string, number>();
const inFlight = new Map<string, Promise<VersionRefreshResult>>();
let activeScope: ScheduleVersionScope = { edu: 'spo', week: 'this' };

export type VersionRefreshResult = 'available' | 'missing' | 'unavailable';

function notify() {
    listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

export function getScheduleVersion(edu = 'spo', week = 'this'): string | undefined {
    return versions[getScopeKey({ edu, week })];
}

export function clearScheduleVersion(edu = 'spo', week = 'this'): void {
    const scopeKey = getScopeKey({ edu, week });
    if (versions[scopeKey] === undefined) return;

    const nextVersions = { ...versions };
    delete nextVersions[scopeKey];
    versions = nextVersions;
    storeVersions(versions);
    notify();
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

export function refreshScheduleVersion(
    edu = 'spo',
    week = 'this',
    force = false,
): Promise<VersionRefreshResult> {
    const scope = { edu, week };
    activeScope = scope;
    const scopeKey = getScopeKey(scope);
    const currentRequest = inFlight.get(scopeKey);
    if (currentRequest) return currentRequest;
    if (!getIsOnline()) return Promise.resolve('unavailable');
    if (!force && Date.now() - (lastCheckedAt.get(scopeKey) ?? 0) < MIN_REFRESH_MS) {
        return Promise.resolve('available');
    }

    const request = axiosClient
        .get<ScheduleVersion>(VERSION_URL, { params: scope })
        .then(({ data }) => {
            reportNetworkSuccess();
            lastCheckedAt.set(scopeKey, Date.now());

            const parsed = parseVersion(data);
            if (parsed !== null && parsed !== versions[scopeKey]) {
                versions = { ...versions, [scopeKey]: parsed };
                storeVersions(versions);
                notify();
            }
            return 'available' as const;
        })
        .catch((error: unknown) => {
            if (isAxiosError(error) && error.response?.status === 404) {
                clearScheduleVersion(edu, week);
                void evictCacheByPrefix(`group:${edu}:`);
                void evictCacheByPrefix(`teacher:${edu}:`);
                return 'missing' as const;
            }
            if (isNetworkError(error)) reportNetworkError();
            console.warn('Не удалось получить версию расписания', error);
            return 'unavailable' as const;
        })
        .finally(() => {
            inFlight.delete(scopeKey);
        });

    inFlight.set(scopeKey, request);
    return request;
}

void refreshScheduleVersion('spo', 'this', true);

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        void refreshScheduleVersion(activeScope.edu, activeScope.week);
    }
});

window.addEventListener('online', () => {
    void refreshScheduleVersion(activeScope.edu, activeScope.week, true);
});
