import { type ThemePreference, type ResolvedTheme, THEME_STORAGE_KEY, isThemePreference } from "./types";

const media = window.matchMedia('(prefers-color-scheme: dark)');
const listeners = new Set<() => void>();

function read(): ThemePreference {
    try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (isThemePreference(saved)) return saved;
    } catch (e) {
        console.error(e);
    }
    return 'system';
}

function resolve(p: ThemePreference): ResolvedTheme {
    return p === 'system' ? (media.matches ? 'dark' : 'light') : p;
}

let preference = read();
let resolved = resolve(preference);

function commit() {
    const root = document.documentElement;

    root.classList.add('theme-switching');
    resolved = resolve(preference);
    root.dataset.theme = resolved;
    root.getBoundingClientRect(); 
    requestAnimationFrame(() => root.classList.remove('theme-switching'));

    listeners.forEach((notify) => notify());
}

export function getPreference() {
    return preference;
}

export function getResolved() {
    return resolved;
}

export function setPreference(next: ThemePreference) {
    if (next === preference) return;
    preference = next;
    try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
    }
    catch (e) {
        console.error(e);
    }
    commit();
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

media.addEventListener('change', () => {
    if (preference === 'system') commit();
});

commit();