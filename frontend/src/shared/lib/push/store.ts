import { getIsInstalled, isIOS, subscribeToInstallState } from '@/shared/lib/pwa';
import { fetchVapidKey, removeSubscription, sendSubscription } from './api';
import type { NotificationMode } from './types';
import { urlBase64ToUint8Array } from './urlBase64';

const supported = 'Notification' in window
    && 'serviceWorker' in navigator
    && 'PushManager' in window;

const listeners = new Set<() => void>();

let permission: NotificationPermission = supported ? Notification.permission : 'denied';
let subscription: PushSubscription | null = null;
let busy = false;

function notify() {
    listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

export function getMode(): NotificationMode {
    if (!supported) return isIOS && !getIsInstalled() ? 'needs-install' : 'unsupported';
    if (permission === 'denied') return 'denied';
    if (permission === 'default') return 'default';
    return subscription ? 'subscribed' : 'needs-subscribe';
}

export function getIsBusy() {
    return busy;
}

function setBusy(next: boolean) {
    busy = next;
    notify();
}

export async function enableNotifications(): Promise<NotificationMode> {
    if (!supported || busy) return getMode();
    setBusy(true);

    try {
        permission = await Notification.requestPermission();
        if (permission !== 'granted') return getMode();

        const registration = await navigator.serviceWorker.ready;

        const existing = await registration.pushManager.getSubscription();
        const created = existing ?? await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(await fetchVapidKey()),
        });

        await sendSubscription(created);
        subscription = created;
        return getMode();
    } catch (error) {
        console.error('Не удалось включить уведомления', error);
        return getMode();
    } finally {
        setBusy(false);
    }
}

export async function disableNotifications(): Promise<NotificationMode> {
    if (!subscription || busy) return getMode();
    setBusy(true);

    const endpoint = subscription.endpoint;
    try {
        await removeSubscription(endpoint);
        await subscription.unsubscribe();
        subscription = null;
        return getMode();
    } catch (error) {
        console.error('Не удалось выключить уведомления', error);
        return getMode();
    } finally {
        setBusy(false);
    }
}

async function readExistingSubscription() {
    if (!supported) return;
    try {
        const registration = await navigator.serviceWorker.ready;
        subscription = await registration.pushManager.getSubscription();
        console.log(subscription);
        notify();
    } catch (error) {
        console.error('Не удалось прочитать подписку', error);
    }
}

void readExistingSubscription();

if (supported && 'permissions' in navigator) {
    void navigator.permissions.query({ name: 'notifications' as PermissionName })
        .then((status) => {
            status.addEventListener('change', () => {
                permission = Notification.permission;
                notify();
            });
        })
        .catch(() => { /* не во всех браузерах доступно */ });
}

subscribeToInstallState(notify);