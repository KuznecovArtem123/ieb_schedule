import axiosClient from '@/shared/api/client';
import { PUSH_PATHS } from './endpoints';

export async function fetchVapidKey(): Promise<string> {
    const { data } = await axiosClient.get<{ publicKey?: unknown }>(PUSH_PATHS.vapidKey);

    if (typeof data?.publicKey !== 'string' || data.publicKey.length === 0) {
        throw new Error('Сервер не отдал VAPID-ключ');
    }
    return data.publicKey;
}

export async function sendSubscription(subscription: PushSubscription): Promise<void> {
    await axiosClient.post(PUSH_PATHS.subscribe, subscription.toJSON());
}

export async function removeSubscription(endpoint: string): Promise<void> {
    await axiosClient.delete(PUSH_PATHS.subscribe, { data: { endpoint } });
}
