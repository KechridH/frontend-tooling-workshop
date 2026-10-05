import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';

async function start() {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledFrame: 'bypass',
      serviceWorker: { url: '/mockServiceWorker.js' },
    });
  }

  const root = document.getElementById('root');
  if (!root) throw new Error('Missing #root element');

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void start();
