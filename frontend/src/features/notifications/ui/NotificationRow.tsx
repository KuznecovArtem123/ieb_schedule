import { Switch } from '@heroui/react';

import { usePushState } from '@/shared/lib/push';
import { Bell } from '@gravity-ui/icons';

function NotificationRow() {
    const { mode, busy, enableNotifications, disableNotifications } = usePushState();

    if (mode === 'unsupported') return null;

    const description = {
        'needs-install': 'Сначала установите приложение — на iPhone уведомления работают только в нём',
        denied: 'Уведомления запрещены. Разрешите их для сайта в настройках браузера',
        default: 'Сообщим, когда расписание изменится',
        'needs-subscribe': 'Сообщим, когда расписание изменится',
        subscribed: 'Сообщим, когда расписание изменится',
    }[mode];

    const interactive = mode === 'default' || mode === 'needs-subscribe' || mode === 'subscribed';

    return (
        <div className="overflow-hidden rounded-[27px] bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between gap-4">
                <div className='flex gap-2 items-center'>
                    <Bell width='30' height='30' />
                    <div>
                        <p className="text-base font-extrabold text-heading flex gap-[10px]">
                            Уведомления
                        </p>
                        <p className="mt-1 text-sm leading-5 text-subtle">{description}</p>
                    </div>
                </div>

                {interactive && (
                    <Switch
                        aria-label="Включить уведомления"
                        size="lg"
                        isSelected={mode === 'subscribed'}
                        isDisabled={busy}
                        onChange={(selected) => {
                            void (selected ? enableNotifications() : disableNotifications());
                        }}
                    >
                        <Switch.Content>
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                        </Switch.Content>
                    </Switch>
                )}
            </div>
        </div>
    );
}

export default NotificationRow;
