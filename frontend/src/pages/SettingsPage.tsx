
import { InstallCard } from '@/features/install-app';
import { useTheme } from '@/shared/lib/theme';
import { NotificationRow } from '@/features/notifications';
import { Switch } from '@heroui/react';
import { Moon, Sun } from '@gravity-ui/icons';

function SettingsPage() {
    const { isDark, setPreference } = useTheme();
    return (
        <section className="mt-6 space-y-4 pb-4">
            <div className="px-2 text-center">
                <h1 className="text-[2rem] font-black tracking-[-0.04em] text-heading">Настройки</h1>
            </div>

            <InstallCard/>
            <div className="overflow-hidden rounded-[27px] bg-surface p-5 shadow-card">
                <div className="flex items-center justify-between gap-4">
                    <div className='flex gap-2 items-center'>
                        { !isDark ? (<Sun width='30' height='30'/>) : (<Moon width='30' height='30'/>)}
                        <div>
                            <p className="text-base font-extrabold text-heading">Изменить тему</p>
                            <p className="mt-1 text-sm leading-5 text-subtle">Светлая тема / Тёмная тема</p>
                        </div>
                    </div>
                    <Switch
                        aria-label="Включить тёмную тему"
                        size="lg"
                        isSelected={isDark}
                        onChange={(selected) => setPreference(selected ? 'dark' : 'light')}
                    >
                        <Switch.Content>
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                        </Switch.Content>
                    </Switch>
                </div>
            </div>

            <NotificationRow />
        </section>
    )
}

export default SettingsPage;