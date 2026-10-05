import { expect, it } from 'vite-plus/test';
import { createBankSnapshot } from '../app/banking';

it('an MSW read error is reproducible and leaves the bank unchanged', async () => {
  const failed = await fetch('/api/banking?scenario=error');
  expect(failed.status).toBe(503);
  const recovered = await fetch('/api/banking?scenario=normal');
  expect(recovered.status).toBe(200);
  expect(await recovered.json()).toEqual(createBankSnapshot());
});
