import type { AxiosResponse } from 'axios';
import axiosClient from './client';
import { readCache, writeCache } from '@/shared/lib/db';
import { getIsOnline, isNetworkError, reportNetworkError, reportNetworkSuccess } from '@/shared/lib/network';

export function getWithEtag<T>(url: string, etag?: string): Promise<AxiosResponse<T>> {
    return axiosClient.get<T>(url, {
        headers: etag?.trim() ? { 'If-None-Match': etag } : undefined,
        validateStatus: (status) => status === 200 || status === 304,
    });
}

export async function withCache<T>(key: string, request: (etag?: string) => Promise<AxiosResponse<T>>): Promise<T> {
    const cached = await readCache<T>(key);

    if (getIsOnline()) {
        try {
            const response = await request(cached?.etag);
            reportNetworkSuccess();
            if (response.status === 304 && cached) return cached.data;
            if (response.status === 304) throw new Error(`Ответ 304 без кэша (${key})`);

            const headerValue = response.headers.etag;
            const etag = typeof headerValue === 'string' ? headerValue : undefined;
            await writeCache(key, response.data, etag);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) reportNetworkError();
            console.error('Запрос не удался, пробуем кэш', error);
        }
    }

    if (cached) return cached.data;

    throw new Error(`Нет данных: сеть недоступна, в кэше пусто (${key})`);
}
