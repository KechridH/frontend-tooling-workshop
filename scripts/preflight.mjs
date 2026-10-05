import { existsSync } from 'node:fs';
import { chromium } from '@playwright/test';

const checks = [
  {
    label: 'Supported Node.js (22.18+, 24.11+, or 26+)',
    passes: (() => {
      const [major, minor] = process.versions.node.split('.').map(Number);
      return (major === 22 && minor >= 18) || (major === 24 && minor >= 11) || major >= 26;
    })(),
    fix: 'Use Node 24 LTS (24.11+) for this workshop, then run npm ci.',
  },
  {
    label: 'Installed Vite+ toolchain',
    passes: existsSync('node_modules/vite-plus/bin/vp'),
    fix: 'Run npm ci.',
  },
  {
    label: 'MSW browser worker',
    passes: existsSync('public/mockServiceWorker.js'),
    fix: 'Run npx msw init public --save.',
  },
  {
    label: 'Playwright Chromium browser',
    passes: existsSync(chromium.executablePath()),
    fix: 'Run npx playwright install chromium.',
  },
];

let failed = false;
for (const check of checks) {
  console.log(`${check.passes ? '✓' : '✗'} ${check.label}`);
  if (!check.passes) {
    failed = true;
    console.log(`  ${check.fix}`);
  }
}

process.exitCode = failed ? 1 : 0;
