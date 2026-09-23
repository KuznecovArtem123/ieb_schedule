import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

const DB_NAME = 'ieb-schedule';
const DB_VERSION = 1;

export interface CacheRecord {
    key: string;
    payload: unknown;
    savedAt: number;
    etag?: string;
}

export interface ScheduleDB extends DBSchema {
    cache: {
        key: string;
        value: CacheRecord;
        indexes: { savedAt: number };
    };
}

let dbPromise: Promise<IDBPDatabase<ScheduleDB> | null> | null = null;

export function getDB(): Promise<IDBPDatabase<ScheduleDB> | null> {
    dbPromise ??= openDB<ScheduleDB>(DB_NAME, DB_VERSION, {

        upgrade(db) {
            const store = db.createObjectStore('cache', { keyPath: 'key' });
            store.createIndex('savedAt', 'savedAt');
        },

        terminated() {
            dbPromise = null;
        },

    }).catch((error: unknown) => {
        console.error('IndexedDB недоступен — работаем без кеша', error);
        return null;
    });

    return dbPromise;
}
