import { useSyncExternalStore } from "react";
import { getPreference, getResolved, setPreference, subscribe } from "./store";

export function useTheme() {
    const preference = useSyncExternalStore(subscribe, getPreference);
    const resolved = useSyncExternalStore(subscribe, getResolved);
    return { preference, isDark: resolved === 'dark', setPreference };
}