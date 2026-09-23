import { useSyncExternalStore } from "react";
import { getBookmarks, isBookmarked, subscribe, type BookmarkKind, type Bookmarks } from "./store";

export function useIsBookmarked(kind: BookmarkKind, id: number) {
    return useSyncExternalStore(subscribe, () => isBookmarked(kind, id));
}

export function useBookmarks(): Bookmarks {
    return useSyncExternalStore(subscribe, getBookmarks);
}