export type Scenario = 'normal' | 'slow' | 'error';
export type AccountId = 'current' | 'savings';

export type Account = {
  id: AccountId;
  name: string;
  iban: string;
  balanceCents: number;
};

export type Transaction = {
  id: string;
  accountId: AccountId;
  label: string;
  category: string;
  date: string;
  amountCents: number;
  status: 'completed' | 'pending';
};

export type BankSnapshot = {
  accounts: Account[];
  transactions: Transaction[];
};

export type TransferRequest = {
  fromAccountId: AccountId;
  toAccountId: AccountId;
  amountCents: number;
  label: string;
};

export function createBankSnapshot(): BankSnapshot {
  return {
    accounts: [
      {
        id: 'current',
        name: 'Current account',
        iban: 'FR76 •••• •••• 4821',
        balanceCents: 324850,
      },
      {
        id: 'savings',
        name: 'Savings account',
        iban: 'FR76 •••• •••• 9034',
        balanceCents: 1250000,
      },
    ],
    transactions: [
      {
        id: 'tx-1',
        accountId: 'current',
        label: 'October salary',
        category: 'Income',
        date: '2026-10-05',
        amountCents: 285000,
        status: 'completed',
      },
      {
        id: 'tx-2',
        accountId: 'current',
        label: 'Maison & Co',
        category: 'Shopping',
        date: '2026-10-04',
        amountCents: -8500,
        status: 'pending',
      },
      {
        id: 'tx-3',
        accountId: 'current',
        label: 'Marché Central',
        category: 'Groceries',
        date: '2026-10-03',
        amountCents: -6240,
        status: 'completed',
      },
      {
        id: 'tx-4',
        accountId: 'current',
        label: 'Metro pass',
        category: 'Transport',
        date: '2026-10-02',
        amountCents: -3200,
        status: 'completed',
      },
      {
        id: 'tx-5',
        accountId: 'current',
        label: 'Café Rivoli',
        category: 'Food & drink',
        date: '2026-10-02',
        amountCents: -680,
        status: 'completed',
      },
      {
        id: 'tx-6',
        accountId: 'current',
        label: 'Bookshop Saint-Paul',
        category: 'Shopping',
        date: '2026-10-01',
        amountCents: -2490,
        status: 'completed',
      },
      {
        id: 'tx-7',
        accountId: 'savings',
        label: 'Monthly savings',
        category: 'Transfer',
        date: '2026-10-01',
        amountCents: 50000,
        status: 'completed',
      },
      {
        id: 'tx-8',
        accountId: 'savings',
        label: 'Savings deposit',
        category: 'Transfer',
        date: '2026-09-15',
        amountCents: 100000,
        status: 'completed',
      },
    ],
  };
}

const euro = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
});
const date = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
});

export function formatMoney(cents: number) {
  return euro.format(cents / 100);
}

export function formatDate(value: string) {
  return date.format(new Date(`${value}T12:00:00`));
}

export function parseAmount(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ''] = normalized.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}
