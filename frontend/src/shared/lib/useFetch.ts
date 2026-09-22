import { useEffect, useState } from 'react';

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: unknown;
}

const INITIAL = { data: null, loading: true, error: null } as const;

export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[], enabled = true): FetchState<T> {
    const key = JSON.stringify([enabled, ...deps]);
    const [state, setState] = useState<FetchState<T>>(INITIAL);
    const [loadedKey, setLoadedKey] = useState(key);

    if (key !== loadedKey) {
        setLoadedKey(key);
        setState(INITIAL);
    }

    useEffect(() => {
        if (!enabled) return;

        let cancelled = false;

        fetcher()
            .then((data) => {
                if (!cancelled) setState({ data, loading: false, error: null });
            })
            .catch((error) => {
                if (cancelled) return;
                console.error('Ошибка загрузки', error);
                setState({ data: null, loading: false, error });
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, enabled]);

    return state;
}
