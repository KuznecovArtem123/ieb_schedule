import { Switch } from '@heroui/react';

function SettingsPage() {
    return (
        <section className="mt-6 space-y-4 pb-4">
            <div className="px-2 text-center">
                <h1 className="text-[2rem] font-black tracking-[-0.04em] text-[#244b7d]">Настройки</h1>
            </div>

            <div className="overflow-hidden rounded-[27px] bg-white p-5 shadow-[0_4px_10px_rgba(39,82,133,0.08)]">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-base font-extrabold text-[#244b7d]">Тёмная тема</p>
                        <p className="mt-1 text-sm leading-5 text-[#8aa1bd]">Светлая тема / Тёмная тема</p>
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

            <div className="overflow-hidden rounded-[27px] bg-white p-5 shadow-[0_4px_10px_rgba(39,82,133,0.08)]">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-base font-extrabold text-[#244b7d]">Уведомления</p>
                        <p className="mt-1 text-sm leading-5 text-[#8aa1bd]">Включить или выключить уведомления</p>
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