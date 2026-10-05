import { Button, Card, InputText, Table, Tag } from '@axa-fr/canopee-react/client';
import outgoing from '@material-symbols/svg-400/outlined/north_east.svg';
import incoming from '@material-symbols/svg-400/outlined/south_west.svg';
import { useState } from 'react';
import { type Account, formatDate, formatMoney, type Transaction } from '../app/banking';

export function Transactions({
  account,
  transactions,
}: {
  account: Account;
  transactions: Transaction[];
}) {
  const [query, setQuery] = useState('');
  const matching = transactions.filter(
    (transaction) =>
      transaction.accountId === account.id &&
      `${transaction.label} ${transaction.category}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <Card as="section" className="transactions-panel" aria-labelledby="transactions-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">ACCOUNT ACTIVITY</p>
          <h2 id="transactions-title">Recent transactions</h2>
        </div>
        <Tag variant="info">{account.name}</Tag>
      </div>
      <div className="transaction-search">
        <InputText
          label="Search transactions"
          type="search"
          placeholder="Search by name or category"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <p className="results-count" aria-live="polite">
        {matching.length} {matching.length === 1 ? 'transaction' : 'transactions'} found
      </p>
      {matching.length ? (
        <Table className="transaction-table">
          <caption className="sr-only">{account.name} transactions</caption>
          <Table.THead variant="gray">
            <Table.Tr>
              <Table.Th scope="col">Transaction</Table.Th>
              <Table.Th scope="col" position="right">
                Amount
              </Table.Th>
            </Table.Tr>
          </Table.THead>
          <Table.TBody>
            {matching.map((transaction) => (
              <Table.Tr key={transaction.id}>
                <Table.Td>
                  <div className="transaction">
                    <span
                      className={
                        'transaction-icon ' +
                        (transaction.amountCents > 0 ? 'transaction-icon--credit' : '')
                      }
                    >
                      <img src={transaction.amountCents > 0 ? incoming : outgoing} alt="" />
                    </span>
                    <div>
                      <div className="transaction__name">
                        {transaction.label}
                        {transaction.status === 'pending' && <Tag variant="warning">Pending</Tag>}
                      </div>
                      <p>
                        {transaction.category} <span aria-hidden="true">·</span>{' '}
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                </Table.Td>
                <Table.Td position="right">
                  <span
                    className={
                      'transaction-amount ' +
                      (transaction.amountCents > 0 ? 'transaction-amount--credit' : '')
                    }
                  >
                    {transaction.amountCents > 0 ? '+' : ''}
                    {formatMoney(transaction.amountCents)}
                  </span>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.TBody>
        </Table>
      ) : (
        <div className="empty-state">
          <h3>No transactions found</h3>
          <p>Try another search or check a different account.</p>
          {query && (
            <Button variant="secondary" type="button" onClick={() => setQuery('')}>
              Clear search
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
