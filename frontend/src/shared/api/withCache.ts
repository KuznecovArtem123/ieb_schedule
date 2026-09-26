import type { AxiosResponse } from 'axios';
import axiosClient from './client';
import { readCache, writeCache } from '@/shared/lib/db';
import { getIsBrowserOnline, isNetworkError, reportNetworkError, reportNetworkSuccess } from '@/shared/lib/network';

export function getWithEtag<T>(url: string, etag?: string, allowNotFound = false): Promise<AxiosResponse<T>> {
    return axiosClient.get<T>(url, {
        headers: etag?.trim() ? { 'If-None-Match': etag } : undefined,
        validateStatus: (status) => status === 200 || status === 304 || (allowNotFound && status === 404),
    });
}

export type OnCached<T> = (data: T) => void;

interface CacheOptions<T> {
    notFoundValue?: T;
    onCached?: OnCached<T>
}

const latestRequests = new Map<string, symbol>();

export async function withCache<T>(
    key: string,
    request: (etag?: string) => Promise<AxiosResponse<T>>,
    forceRequest: boolean = false,
    options: CacheOptions<T> = {},
): Promise<T> {
    const cached = await readCache<T>(key);
    if (cached) {
        options.onCached?.(cached.data);
    }

    if (forceRequest || getIsBrowserOnline()) {
        const requestId = Symbol(key);
        latestRequests.set(key, requestId);
        const isCurrentRequest = () => latestRequests.get(key) === requestId;

        try {
            const response = await request(cached?.etag);
            if (isCurrentRequest()) reportNetworkSuccess();
            const headerValue = response.headers.etag;
            const etag = typeof headerValue === 'string' ? headerValue : undefined;
            if (response.status === 304) {
                if (!cached) throw new Error(`Ответ 304 без кэша (${key})`);
                await writeCache(key, cached.data, etag ?? cached.etag, isCurrentRequest);
                return cached.data;
            }

            if (response.status === 404 && options.notFoundValue !== undefined) {
                await writeCache(key, options.notFoundValue, etag, isCurrentRequest);
                return options.notFoundValue;
            }
            if (response.status === 404) throw new Error(`Данные не найдены (${key})`);

            await writeCache(key, response.data, etag, isCurrentRequest);
            return response.data;
        } catch (error) {
            if (isCurrentRequest() && isNetworkError(error)) reportNetworkError();
            console.error('Запрос не удался, пробуем кэш', error);
        } finally {
            if (isCurrentRequest()) latestRequests.delete(key);
        }
    }

    if (cached) return cached.data;

    throw new Error(`Нет данных: сеть недоступна, в кэше пусто (${key})`);
}
