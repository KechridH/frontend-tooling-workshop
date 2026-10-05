import { expect, it } from 'vite-plus/test';

it('rejects a same-account transfer without changing money or history', async () => {
  const before = await (await fetch('/api/banking')).json();
  const response = await fetch('/api/transfers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromAccountId: 'current',
      toAccountId: 'current',
      amountCents: 2500,
      label: 'Same-account exercise',
    }),
  });
  // Deliberate wrong expectation: read the contract, then repair this assertion.
  expect(response.status).toBe(201);
  const after = await (await fetch('/api/banking')).json();
  expect(after).toEqual(before);
});
