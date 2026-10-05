import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vite-plus/test';
import App from './App';

async function openBank() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole('heading', { name: 'Your accounts' });
  return user;
}

function account(name: string) {
  return within(screen.getByRole('article', { name }));
}

describe('banking journeys', () => {
  it('searches transactions and switches accounts', async () => {
    const user = await openBank();
    await user.type(screen.getByRole('searchbox', { name: 'Search transactions' }), 'metro');
    expect(screen.getByText('1 transaction found')).toBeInTheDocument();
    expect(screen.getByText('Metro pass')).toBeInTheDocument();
    expect(screen.queryByText('October salary')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'View savings account transactions' }));
    expect(screen.getByText('2 transactions found')).toBeInTheDocument();
    expect(screen.getByText('Savings deposit')).toBeInTheDocument();
  });

  it('moves money and updates both balances and the transaction history', async () => {
    const user = await openBank();
    await user.type(screen.getByRole('textbox', { name: 'Amount' }), '100.25');
    await user.type(
      screen.getByRole('textbox', { name: 'Reference (optional)' }),
      'Weekend savings',
    );
    await user.click(screen.getByRole('button', { name: 'Confirm transfer' }));
    expect(await screen.findByRole('heading', { name: 'Transfer completed' })).toBeInTheDocument();
    expect(account('Current account').getByText('€3,148.25')).toBeInTheDocument();
    expect(account('Savings account').getByText('€12,600.25')).toHaveTextContent('€12,600.25');
    expect(screen.getByText('Weekend savings')).toBeInTheDocument();
    expect(screen.getByText('7 transactions found')).toBeInTheDocument();
  });

  it('rejects an amount above the available balance without changing it', async () => {
    const user = await openBank();
    await user.type(screen.getByRole('textbox', { name: 'Amount' }), '4000');
    await user.click(screen.getByRole('button', { name: 'Confirm transfer' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The amount exceeds your available balance.',
    );
    expect(account('Current account').getByText('€3,248.50')).toHaveTextContent('€3,248.50');
    expect(screen.queryByRole('heading', { name: 'Transfer completed' })).not.toBeInTheDocument();
  });

  it('reproduces a read failure and recovers', async () => {
    const user = await openBank();
    await user.click(
      within(screen.getByRole('group', { name: 'API scenario' })).getByRole('button', {
        name: 'Error',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Reload accounts' }));
    expect(
      await screen.findByRole('heading', {
        name: 'We couldn’t load your accounts.',
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Restore normal response' }));
    expect(await screen.findByRole('heading', { name: 'Your accounts' })).toBeInTheDocument();
  });

  it('keeps transfer details after a server failure so the user can retry', async () => {
    const user = await openBank();
    await user.click(
      within(screen.getByRole('group', { name: 'API scenario' })).getByRole('button', {
        name: 'Error',
      }),
    );
    await user.type(screen.getByRole('textbox', { name: 'Amount' }), '25');
    await user.type(screen.getByRole('textbox', { name: 'Reference (optional)' }), 'Retry savings');
    await user.click(screen.getByRole('button', { name: 'Confirm transfer' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The banking service is temporarily unavailable.',
    );
    expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('25');
    expect(account('Current account').getByText('€3,248.50')).toHaveTextContent('€3,248.50');
    await user.click(
      within(screen.getByRole('group', { name: 'API scenario' })).getByRole('button', {
        name: 'Normal',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Confirm transfer' }));
    expect(await screen.findByRole('heading', { name: 'Transfer completed' })).toBeInTheDocument();
    expect(screen.getByText('Retry savings')).toBeInTheDocument();
  });
});
