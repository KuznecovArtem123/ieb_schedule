import { Switch } from '@heroui/react';

function SettingsPage() {
    return (
        <section className="mt-6 space-y-4 pb-4">
            <div className="px-2 text-center">
                <h1 className="text-[2rem] font-black tracking-[-0.04em] text-heading">Настройки</h1>
            </div>

            <div className="overflow-hidden rounded-[27px] bg-white p-5 shadow-card">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-base font-extrabold text-heading">Тёмная тема</p>
                        <p className="mt-1 text-sm leading-5 text-subtle">Светлая тема / Тёмная тема</p>
                    </div>
                    <Switch aria-label="Включить тёмную тему" size="lg">
                        <Switch.Content>
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                        </Switch.Content>
                    </Switch>
                </div>
            </div>

            <div className="overflow-hidden rounded-[27px] bg-white p-5 shadow-card">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-base font-extrabold text-heading">Уведомления</p>
                        <p className="mt-1 text-sm leading-5 text-subtle">Включить или выключить уведомления</p>
                    </div>
                    <Switch aria-label="Включить уведомления" size="lg">
                        <Switch.Content>
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                        </Switch.Content>
                    </Switch>
                </div>
            </div>
        </section>
    )
}

export default SettingsPage;