import { useSyncExternalStore } from 'react';
import { getScheduleVersion, subscribe } from './store';

export function useScheduleVersion(edu = 'spo', week = 'this'): string | undefined {
    return useSyncExternalStore(subscribe, () => getScheduleVersion(edu, week));
}
