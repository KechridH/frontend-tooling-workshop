import type { BankSnapshot, Scenario, TransferRequest } from './banking';

async function readResponse(response: Response): Promise<BankSnapshot> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'The request failed. Please try again.');
  }
  return response.json() as Promise<BankSnapshot>;
}

export async function getBanking(scenario: Scenario, signal: AbortSignal) {
  return readResponse(await fetch(`/api/banking?scenario=${scenario}`, { signal }));
}

export async function createTransfer(transfer: TransferRequest, scenario: Scenario) {
  return readResponse(
    await fetch(`/api/transfers?scenario=${scenario}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transfer),
    }),
  );
}
