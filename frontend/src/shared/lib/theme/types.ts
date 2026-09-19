export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

export function isThemePreference(value: string | null): value is ThemePreference {
    return value === 'light' || value === 'dark' || value === 'system';
}