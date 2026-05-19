// Theme toggle with Telegram WebApp integration and persistence
(function(){
    const STORAGE_KEY = 'ineb_theme';
    const TOGGLE_CLASS = 'theme-dark';

    function applyTheme(theme) {
        if (theme === 'dark') document.documentElement.classList.add(TOGGLE_CLASS);
        else document.documentElement.classList.remove(TOGGLE_CLASS);
    }

    function getSaved() {
        try { return localStorage.getItem(STORAGE_KEY); } catch(e) { return null; }
    }
    function save(theme) {
        try { localStorage.setItem(STORAGE_KEY, theme); } catch(e) {}
    }

    function applyFromTelegram(wa) {
        try {
            const scheme = wa.colorScheme || (wa.themeParams && wa.themeParams.scheme) || null;
            if (scheme === 'dark') applyTheme('dark');
            else applyTheme('light');
            return scheme;
        } catch(e) { return null; }
    }

    document.addEventListener('DOMContentLoaded', function(){
        const btn = document.getElementById('themeToggle');
        const inTelegram = typeof window.Telegram !== 'undefined' && window.Telegram && window.Telegram.WebApp;
        const wa = inTelegram ? window.Telegram.WebApp : null;

        const saved = getSaved();
        if (saved) applyTheme(saved);
        else if (wa) applyFromTelegram(wa);

        if (wa && typeof wa.onEvent === 'function') {
            try {
                wa.onEvent('themeChanged', function() {
                    if (!getSaved()) applyFromTelegram(wa);
                });
            } catch(e) {}
        }

        function updateButton(isDark) {
            if (!btn) return;
            btn.textContent = isDark ? '☀️' : '🌙';
            btn.title = isDark ? 'Светлая тема' : 'Тёмная тема';
        }

        function toggle() {
            const isDark = document.documentElement.classList.toggle(TOGGLE_CLASS);
            save(isDark ? 'dark' : 'light');
            updateButton(isDark);
        }

        if (btn) {
            btn.addEventListener('click', toggle);
            updateButton(document.documentElement.classList.contains(TOGGLE_CLASS));
        }
    });
})();
