import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import '@/shared/lib/pwa';
import '@/shared/lib/schedule-version';
import App from './App';
import { DAY_MS, evictStale } from '@/shared/lib/db';

evictStale(14 * DAY_MS);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
);
