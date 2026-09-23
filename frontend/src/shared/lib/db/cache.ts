import { getDB } from './db';

export const DAY_MS = 24 * 60 * 60 * 1000;

const MAX_AGE_MS = 30 * DAY_MS;

export interface CachedValue<T> {
    data: T;
    savedAt: number;
    version?: string;
}

export async function readCache<T>(key: string): Promise<CachedValue<T> | null> {
    const db = await getDB();
    if (!db) return null;

    try {
        const record = await db.get('cache', key);
        if (!record) return null;
        return { data: record.payload as T, savedAt: record.savedAt, version: record.version };
    } catch (error) {
        console.error('Не удалось прочитать кеш', error);
        return null;
    }
}

export async function writeCache(key: string, payload: unknown, version?: string): Promise<void> {
    const db = await getDB();
    if (!db) return;

    try {
        await db.put('cache', { key, payload, version: version, savedAt: Date.now() });
    } catch (error) {
        console.error('Не удалось записать кеш', error);
    }
}

export async function evictCacheByPrefix(prefix: string): Promise<void> {
    const db = await getDB();
    if (!db) return;

    try {
        const tx = db.transaction('cache', 'readwrite');
        for await (const cursor of tx.store) {
            if (cursor.key.startsWith(prefix)) await cursor.delete();
        }
        await tx.done;
    } catch (error) {
        console.error('Не удалось удалить записи кэша', error);
    }
}

export async function evictStale(maxAgeMs: number = MAX_AGE_MS): Promise<void> {
    const db = await getDB();
    if (!db) return;

    try {
        const cutoff = Date.now() - maxAgeMs;
        const tx = db.transaction('cache', 'readwrite');

        for await (const cursor of tx.store.index('savedAt').iterate(IDBKeyRange.upperBound(cutoff))) {
            await cursor.delete();
        }

        await tx.done;
    } catch (error) {
        console.error('Не удалось почистить кэш', error);
    }
}
