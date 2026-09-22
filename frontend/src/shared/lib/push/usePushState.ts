import { useSyncExternalStore } from 'react';
import { getIsBusy, getMode, subscribe } from './store';
import { disableNotifications, enableNotifications } from './store';

export function usePushState() {
    const mode = useSyncExternalStore(subscribe, getMode);
    const busy = useSyncExternalStore(subscribe, getIsBusy);
    return { mode, busy, enableNotifications, disableNotifications };
}
