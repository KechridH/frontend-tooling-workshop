import { delay, HttpResponse, http } from 'msw';
import { createBankSnapshot, type TransferRequest } from '../app/banking';

let snapshot = createBankSnapshot();
let nextTransferId = 1;

export function resetBank() {
  snapshot = createBankSnapshot();
  nextTransferId = 1;
}

async function simulateNetwork(request: Request) {
  const scenario = new URL(request.url).searchParams.get('scenario');
  if (scenario === 'slow') await delay(1_200);
  if (scenario === 'error') {
    return HttpResponse.json(
      {
        message: 'The banking service is temporarily unavailable. Please try again.',
      },
      { status: 503 },
    );
  }
  return null;
}

export const handlers = [
  http.get('/api/banking', async ({ request }) => {
    const error = await simulateNetwork(request);
    return error ?? HttpResponse.json(snapshot);
  }),
  http.post('/api/transfers', async ({ request }) => {
    const error = await simulateNetwork(request);
    if (error) return error;
    const transfer = (await request.json()) as Partial<TransferRequest>;
    const from = snapshot.accounts.find((account) => account.id === transfer.fromAccountId);
    const to = snapshot.accounts.find((account) => account.id === transfer.toAccountId);
    const amount = transfer.amountCents;
    if (
      !from ||
      !to ||
      from.id === to.id ||
      !Number.isSafeInteger(amount) ||
      !amount ||
      amount <= 0
    ) {
      return HttpResponse.json(
        { message: 'Please choose two different accounts and a valid amount.' },
        { status: 400 },
      );
    }
    if (amount > from.balanceCents) {
      return HttpResponse.json(
        { message: 'The amount exceeds your available balance.' },
        { status: 422 },
      );
    }
    from.balanceCents -= amount;
    to.balanceCents += amount;
    const label =
      typeof transfer.label === 'string' && transfer.label.trim()
        ? transfer.label.trim().slice(0, 60)
        : 'Internal transfer';
    const id = `transfer-${nextTransferId++}`;
    snapshot.transactions.unshift(
      {
        id: `${id}-debit`,
        accountId: from.id,
        label,
        category: 'Transfer',
        date: '2026-10-05',
        amountCents: -amount,
        status: 'completed',
      },
      {
        id: `${id}-credit`,
        accountId: to.id,
        label,
        category: 'Transfer',
        date: '2026-10-05',
        amountCents: amount,
        status: 'completed',
      },
    );
    return HttpResponse.json(snapshot, { status: 201 });
  }),
];
