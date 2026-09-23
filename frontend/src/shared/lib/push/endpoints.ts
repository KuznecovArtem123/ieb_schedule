export const PUSH_PATHS = {
    subscribe: 'notifications/subscribe/',
    vapidKey: 'notifications/vapid-public-key/',
} as const;

export function apiUrl(path: string): string {
    const base: string = import.meta.env.VITE_API_PATH || '/api/';
    return new URL(path, new URL(base, location.origin)).href;
}
