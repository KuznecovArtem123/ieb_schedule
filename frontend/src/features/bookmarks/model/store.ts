const BOOKMARKS_STORAGE_KEY = 'bookmarks';

export interface Bookmarks {
    groups: number[];
    teachers: number[];
}

export type BookmarkKind = 'groups' | 'teachers';

const listeners = new Set<() => void>();

let bookmarks: Bookmarks = read();

function notify() {
    listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

function emptyBookmarks(): Bookmarks {
    return { groups: [], teachers: [] };
}

export function toggleBookmark(kind: BookmarkKind, id: number) {
    try {
        const next = [...bookmarks[kind]];
        if (isBookmarked(kind, id)) {
            next.splice(bookmarks[kind].indexOf(id), 1);
        } else {
            next.push(id);
        }
        bookmarks = { ...bookmarks, [kind]: next };
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    }
    catch (e) {
        console.error(e);
    }
    notify();
}

export function isBookmarked(kind: BookmarkKind, id: number) {
    return bookmarks[kind].indexOf(id) !== -1;
}

function isNumberArray(value: unknown): value is number[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'number');
}

function isBookmarks(value: unknown): value is Bookmarks {
    if (value === null || typeof value !== 'object') return false;
    const { groups, teachers } = value as Partial<Bookmarks>;
    return isNumberArray(groups) && isNumberArray(teachers);
}

function read() {
    try {
        const data = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
        if (!data) {
            return emptyBookmarks();
        }
        const payload: unknown = JSON.parse(data);
        if (!isBookmarks(payload)) return emptyBookmarks();
        return payload;
    } catch (e) {
        console.error(e);
        return emptyBookmarks();
    }
}

export function getBookmarks() {
    return bookmarks;
}