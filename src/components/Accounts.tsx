import { Button, Card } from '@axa-fr/canopee-react/client';
import wallet from '@material-symbols/svg-400/outlined/account_balance_wallet.svg';
import savings from '@material-symbols/svg-400/outlined/savings.svg';
import { type Account, type AccountId, formatMoney } from '../app/banking';

export function Accounts({
  accounts,
  selected,
  onSelect,
}: {
  accounts: Account[];
  selected: AccountId;
  onSelect: (id: AccountId) => void;
}) {
  return (
    <section id="accounts" aria-labelledby="accounts-title">
      <div className="section-heading">
        <h2 id="accounts-title">Your accounts</h2>
        <span>Balances in EUR</span>
      </div>
      <div className="accounts-grid">
        {accounts.map((account) => (
          <Card
            as="article"
            key={account.id}
            className={'account-card ' + (selected === account.id ? 'account-card--selected' : '')}
            aria-label={account.name}
          >
            <div className="account-card__top">
              <span className="account-icon">
                <img src={account.id === 'current' ? wallet : savings} alt="" />
              </span>
              <span className="account-card__kind">
                {account.id === 'current' ? 'EVERYDAY BANKING' : 'A LITTLE FOR LATER'}
              </span>
            </div>
            <h3>{account.name}</h3>
            <p className="account-card__iban">{account.iban}</p>
            <p className="account-card__balance">{formatMoney(account.balanceCents)}</p>
            <div className="account-card__bottom">
              <span>Available balance</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onSelect(account.id)}
                aria-pressed={selected === account.id}
                aria-label={`View ${account.name.toLowerCase()} transactions`}
              >
                {selected === account.id ? 'Selected' : 'View activity'}{' '}
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
