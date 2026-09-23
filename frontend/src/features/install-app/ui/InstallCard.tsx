import { Button } from "@heroui/react";
import ArrowShapeUpFromLine from "@gravity-ui/icons/ArrowShapeUpFromLine";
import Plus from "@gravity-ui/icons/Plus";

import { useInstallPrompt } from "@/shared/lib/pwa";

const icon = "mx-0.5 inline-block align-text-bottom text-link";

export function InstallCard() {
    const { mode, promptInstall } = useInstallPrompt();

    if (mode === 'unavailable') {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-[27px] bg-surface p-5 shadow-card">
            <div className="flex flex-col gap-2 items-center text-center">
                <p className="text-base font-extrabold text-heading">Доступно приложение</p>
                <p className="mt-1 text-sm leading-5 text-subtle">
                    Приложение позволит вам быстро смотреть расписание и получать уведомления
                </p>

                {mode === 'prompt' ? (
                    <Button variant="primary" onClick={() => void promptInstall()}>Установить</Button>
                ) : (
                    // ios не дает установить через вызов
                    <p className="mt-1 text-sm leading-6 text-subtle">
                        Нажмите{' '}
                        <ArrowShapeUpFromLine width="16" height="16" className={icon} aria-hidden="true" />
                        {' '}«Поделиться», затем{' '}
                        <Plus width="16" height="16" className={icon} aria-hidden="true" />
                        {' '}«На экран „Домой“»
                    </p>
                )}
            </div>
        </div>
    );
}
