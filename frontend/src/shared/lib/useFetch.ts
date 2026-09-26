import { useEffect, useRef, useState } from 'react';

import type { CacheResult } from '@/shared/api/withCache';
import { subscribeReconnect } from '@/shared/lib/network';

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    refreshing: boolean;
    stale: boolean;
    error: unknown;
}

interface UseFetchResult<T> extends FetchState<T> {
    retrying: boolean;
    refetch: () => void;
}

const INITIAL = { data: null, loading: true, refreshing: false, stale: false, error: null } as const;

export function useFetch<T>(fetcher: (onCached: (data: T) => void, forceRequest?: boolean) => Promise<CacheResult<T>>, deps: unknown[]): UseFetchResult<T> {
    const key = JSON.stringify(deps);
    const [state, setState] = useState<FetchState<T>>(INITIAL);
    const [loadedKey, setLoadedKey] = useState(key);
    const [retryCount, setRetryCount] = useState(0);
    const [retrying, setRetrying] = useState(false);

    const forceRequestRef = useRef(false);

    const reload = () => {
        forceRequestRef.current = true;
        setRetryCount((count) => count + 1);
    };

    const refetch = () => {
        if (retrying) return;

        setRetrying(true);
        reload();
    }

    if (key !== loadedKey) {
        setLoadedKey(key);
        setState(INITIAL);
    }

    useEffect(() => subscribeReconnect(reload), []);

    useEffect(() => {
        let cancelled = false;

        const onCached = (data: T) => {
            if (cancelled) return;

            setState({
                data,
                refreshing: true,
                loading: false,
                stale: true,
                error: null,
            });
        };

        const forceRequest = forceRequestRef.current;
        forceRequestRef.current = false;

        fetcher(onCached, forceRequest)
            .then(({ data, stale }) => {
                if (cancelled) return;
                setState({
                    data,
                    refreshing: false,
                    loading: false,
                    stale,
                    error: null
                });
            })
            .catch((error) => {
                if (cancelled) return;
                console.error('Ошибка загрузки', error);
                setState((previous) => ({
                    ...previous,
                    loading: false,
                    refreshing: false,
                    stale: previous.data !== null,
                    error
                }));
            })
            .finally(() => {
                if (!cancelled) setRetrying(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, retryCount]);

    return { ...state, refetch, retrying };
}
