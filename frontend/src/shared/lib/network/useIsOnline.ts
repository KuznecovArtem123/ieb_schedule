import { useSyncExternalStore } from 'react';
import { getIsOnline, subscribe } from './store';

export function useIsOnline(): boolean {
    return useSyncExternalStore(subscribe, getIsOnline);
}
