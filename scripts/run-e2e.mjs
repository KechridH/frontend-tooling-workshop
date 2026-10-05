import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as wait } from 'node:timers/promises';
import { preview } from 'vite';

const url = 'http://127.0.0.1:4173';
// `vite` resolves to the Vite+ core alias pinned by the migrator.
const server = await preview({ preview: { host: '127.0.0.1', port: 4173, strictPort: true } });
server.printUrls();

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(500) });
      if (response.ok) return;
    } catch {
      // The preview server may still be starting.
    }
    await wait(100);
  }
  throw new Error('The preview server did not become ready on port 4173.');
}

try {
  await waitForServer();
  const playwright = spawn(
    process.execPath,
    ['node_modules/playwright/cli.js', 'test', ...process.argv.slice(2)],
    { stdio: 'inherit' },
  );
  const [code] = await once(playwright, 'exit');
  process.exitCode = code ?? 1;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await new Promise((resolve, reject) => {
    server.httpServer.close((error) => (error ? reject(error) : resolve()));
    server.httpServer.closeAllConnections();
  });
}
