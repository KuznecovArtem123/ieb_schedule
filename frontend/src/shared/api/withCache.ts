import { readCache, writeCache } from '@/shared/lib/db';
import { getIsOnline, isNetworkError, reportNetworkError, reportNetworkSuccess } from '@/shared/lib/network';

export async function withCache<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (getIsOnline()) {
        try {
            const data = await request();
            reportNetworkSuccess();
            void writeCache(key, data);
            return data;
        } catch (error) {
            if (isNetworkError(error)) reportNetworkError();
            console.error('Запрос не удался, пробуем кэш', error);
        }
    }

    const cached = await readCache<T>(key);
    if (cached) return cached.data;

    throw new Error(`Нет данных: сеть недоступна, в кэше пусто (${key})`);
}
