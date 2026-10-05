import { Button, Card, Dropdown, InputText, Message } from '@axa-fr/canopee-react/client';
import { type FormEvent, useState } from 'react';
import {
  type Account,
  type AccountId,
  formatMoney,
  parseAmount,
  type TransferRequest,
} from '../app/banking';

export function TransferForm({
  accounts,
  busy,
  onTransfer,
}: {
  accounts: Account[];
  busy: boolean;
  onTransfer: (transfer: TransferRequest) => Promise<void>;
}) {
  const [from, setFrom] = useState<AccountId>('current');
  const [to, setTo] = useState<AccountId>('savings');
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const source = accounts.find((account) => account.id === from);
  const clearMessage = () => {
    setError('');
    setSuccess('');
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    clearMessage();
    const amountCents = parseAmount(amount);
    if (from === to) {
      setError('Choose two different accounts.');
      return;
    }
    if (amountCents === null) {
      setError('Enter an amount greater than zero with no more than two decimal places.');
      return;
    }
    if (!source || amountCents > source.balanceCents) {
      setError('The amount exceeds your available balance.');
      return;
    }
    try {
      await onTransfer({
        fromAccountId: from,
        toAccountId: to,
        amountCents,
        label: label.trim() || 'Internal transfer',
      });
      setSuccess(
        formatMoney(amountCents) +
          ' moved to your ' +
          (to === 'savings' ? 'savings account.' : 'current account.'),
      );
      setAmount('');
      setLabel('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Please try your transfer again.');
    }
  }

  return (
    <Card as="section" className="transfer-panel" id="transfers" aria-labelledby="transfer-title">
      <p className="eyebrow">BETWEEN YOUR ACCOUNTS</p>
      <h2 id="transfer-title">Make a transfer</h2>
      <p className="panel-description">A simple way to move money, whenever you need.</p>
      <form onSubmit={submit} noValidate aria-label="Make a transfer" aria-busy={busy}>
        <Dropdown
          label="From account"
          value={from}
          disabled={busy}
          onChange={(event) => {
            setFrom(event.target.value as AccountId);
            clearMessage();
          }}
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Dropdown>
        <p className="available-balance">
          Available: <strong>{formatMoney(source?.balanceCents ?? 0)}</strong>
        </p>
        <Dropdown
          label="To account"
          value={to}
          disabled={busy}
          onChange={(event) => {
            setTo(event.target.value as AccountId);
            clearMessage();
          }}
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Dropdown>
        <InputText
          label="Amount"
          unit={<span>€</span>}
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          disabled={busy}
          onChange={(event) => {
            setAmount(event.target.value);
            clearMessage();
          }}
        />
        <InputText
          label="Reference (optional)"
          placeholder="e.g. Monthly savings"
          maxLength={60}
          value={label}
          disabled={busy}
          onChange={(event) => {
            setLabel(event.target.value);
            clearMessage();
          }}
        />
        {error && (
          <Message variant="error" title="Check your transfer" heading="h3">
            {error}
          </Message>
        )}
        {success && (
          <Message variant="validation" title="Transfer completed" heading="h3">
            {success}
          </Message>
        )}
        <Button type="submit" loading={busy} className="transfer-submit">
          {busy ? 'Sending transfer…' : 'Confirm transfer'}
        </Button>
        <p className="transfer-note">Transfers are simulated using demo data.</p>
      </form>
    </Card>
  );
}
