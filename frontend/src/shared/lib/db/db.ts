import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

const DB_NAME = 'ieb-schedule';
const DB_VERSION = 1;

const OPEN_TIMEOUT_MS = 5_000;

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
    if (dbPromise) return dbPromise;

    const opening = openDB<ScheduleDB>(DB_NAME, DB_VERSION, {

        upgrade(db) {
            const store = db.createObjectStore('cache', { keyPath: 'key' });
            store.createIndex('savedAt', 'savedAt');
        },

        blocked(currentVersion, blockedVersion) {
            console.warn(`Кэш ${currentVersion} - ${blockedVersion ?? '?'}: другая вкладка не отпускает схему`);
        },

        blocking() {
            dbPromise = null;
            void opening.then((db) => { db.close(); }, () => undefined);
        },

        terminated() {
            dbPromise = null;
        },

    });

    dbPromise = new Promise((resolve) => {
        let settled = false;

        const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            console.error(`IndexedDB не открылся за ${OPEN_TIMEOUT_MS} мс — работаем без кеша`);
            resolve(null);
        }, OPEN_TIMEOUT_MS);

        const finish = (db: IDBPDatabase<ScheduleDB> | null) => {
            clearTimeout(timer);
            if (settled) {
                db?.close();
                return;
            }
            settled = true;
            resolve(db);
        };

        opening.then(finish, (error: unknown) => {
            console.error('IndexedDB недоступен — работаем без кеша', error);
            finish(null);
        });
    });

    return dbPromise;
}
