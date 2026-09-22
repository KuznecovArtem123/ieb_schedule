/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

import { PUSH_PATHS, apiUrl } from '@/shared/lib/push/endpoints';

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
    new NavigationRoute(createHandlerBoundToURL('index.html'), {
        denylist: [
            /^\/admin(?:\/|$)/,
            /^\/api(?:\/|$)/,
            /^\/static(?:\/|$)/,
            /^\/media(?:\/|$)/,
        ],
    }),
);

interface PushPayload {
    title?: string;
    body?: string;
    url?: string;
}

function parsePayload(event: PushEvent): PushPayload {
    try {
        const parsed: unknown = event.data?.json();
        return parsed !== null && typeof parsed === 'object' ? parsed as PushPayload : {};
    } catch {
        return { body: event.data?.text() };
    }
}

self.addEventListener('push', (event) => {
    const { title, body, url } = parsePayload(event);

    event.waitUntil(
        self.registration.showNotification(title ?? 'Расписание ИНЭБ', {
            body: body ?? 'Расписание обновилось',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: { url: url ?? '/' },
        }),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const target = (event.notification.data as { url?: string } | undefined)?.url ?? '/';

    event.waitUntil((async () => {
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

        for (const client of clients) {
            if ('focus' in client) {
                await client.focus();
                await client.navigate(target).catch(() => undefined);
                return;
            }
        }
        await self.clients.openWindow(target);
    })());
});

self.addEventListener('pushsubscriptionchange', (event) => {
    event.waitUntil((async () => {
        try {
            const key = await fetch(apiUrl(PUSH_PATHS.vapidKey))
                .then((response) => response.json() as Promise<{ publicKey: string }>);

            const renewed = await self.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: key.publicKey,
            });

            await fetch(apiUrl(PUSH_PATHS.subscribe), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(renewed.toJSON()),
            });
        } catch (error) {
            console.error('Не удалось обновить подписку', error);
        }
    })());
});