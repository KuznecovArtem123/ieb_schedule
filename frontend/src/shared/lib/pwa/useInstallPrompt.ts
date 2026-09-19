import { useSyncExternalStore } from 'react';
import { getInstallMode, promptInstall, subscribe } from './store';

export function useInstallPrompt() {
    const mode = useSyncExternalStore(subscribe, getInstallMode);
    return { mode, promptInstall };
}
