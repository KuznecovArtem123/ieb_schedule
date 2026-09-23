import { useSyncExternalStore } from 'react';
import { getScheduleVersion, subscribe } from './store';

export function useScheduleVersion(): string | undefined {
    return useSyncExternalStore(subscribe, getScheduleVersion);
}
