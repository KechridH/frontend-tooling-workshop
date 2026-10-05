import logo from '@axa-fr/canopee-css/logo-axa.svg';
import { Button, Message, Spinner, Tag } from '@axa-fr/canopee-react/client';
import { useEffect, useState } from 'react';
import { Accounts } from '../components/Accounts';
import { ScenarioControl } from '../components/ScenarioControl';
import { Transactions } from '../components/Transactions';
import { TransferForm } from '../components/TransferForm';
import { createTransfer, getBanking } from './api';
import {
  type AccountId,
  type BankSnapshot,
  formatMoney,
  type Scenario,
  type TransferRequest,
} from './banking';
import '../styles/global.css';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: BankSnapshot };

export default function App() {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [selected, setSelected] = useState<AccountId>('current');
  const [scenario, setScenario] = useState<Scenario>('normal');
  const [request, setRequest] = useState<{ scenario: Scenario }>({
    scenario: 'normal',
  });
  const [transferBusy, setTransferBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getBanking(request.scenario, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setLoad({ status: 'ready', data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setLoad({
            status: 'error',
            message: error instanceof Error ? error.message : 'Please try again.',
          });
      });
    return () => controller.abort();
  }, [request]);

  function reloadAccounts() {
    setLoad({ status: 'loading' });
    setRequest({ scenario });
  }

  function restoreNormal() {
    setLoad({ status: 'loading' });
    setScenario('normal');
    setRequest({ scenario: 'normal' });
  }

  async function transfer(value: TransferRequest) {
    setTransferBusy(true);
    try {
      const data = await createTransfer(value, scenario);
      setLoad({ status: 'ready', data });
    } finally {
      setTransferBusy(false);
    }
  }

  const busy = load.status === 'loading' || transferBusy;
  const account =
    load.status === 'ready' ? load.data.accounts.find((item) => item.id === selected) : undefined;

  return (
    <div className="bank-app">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <a href="#main-content" className="brand" aria-label="My Banking home">
            <img src={logo} alt="AXA" />
            <span>
              My Banking<small>YOUR PERSONAL SPACE</small>
            </span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#accounts">My accounts</a>
            <a href="#transfers">Transfers</a>
          </nav>
          <div className="customer">
            <span className="customer__avatar" aria-hidden="true">
              CM
            </span>
            <span>Camille Martin</span>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="main-content">
        <div className="welcome">
          <div>
            <p className="eyebrow">GOOD TO SEE YOU, CAMILLE</p>
            <h1>Banking that fits your day.</h1>
            <p>Your accounts and everyday transfers, all in one place.</p>
          </div>
          <Tag variant="info">Demo banking</Tag>
        </div>
        {load.status === 'loading' ? (
          <div className="loading-state" role="status">
            <Spinner size={40} />
            <h2>Loading your accounts…</h2>
            <p>Getting your balances and latest activity.</p>
          </div>
        ) : load.status === 'error' ? (
          <div className="load-error">
            <Message variant="error" title="We couldn’t load your accounts." heading="h2">
              {load.message}
            </Message>
            <div className="load-error__actions">
              <Button type="button" onClick={reloadAccounts}>
                Try again
              </Button>
              <Button type="button" variant="secondary" onClick={restoreNormal}>
                Restore normal response
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="balance-summary">
              <span>Total available across your accounts</span>
              <strong>
                {formatMoney(load.data.accounts.reduce((sum, item) => sum + item.balanceCents, 0))}
              </strong>
              <span className="balance-summary__note">A clear view of your money</span>
            </div>
            <Accounts accounts={load.data.accounts} selected={selected} onSelect={setSelected} />
            <div className="banking-grid">
              {account && (
                <Transactions
                  key={selected}
                  account={account}
                  transactions={load.data.transactions}
                />
              )}
              <TransferForm
                accounts={load.data.accounts}
                busy={transferBusy}
                onTransfer={transfer}
              />
            </div>
          </>
        )}
        <ScenarioControl
          scenario={scenario}
          busy={busy}
          onScenario={setScenario}
          onReload={reloadAccounts}
        />
      </main>
      <footer className="site-footer">
        <span>Frontend tooling workshop</span>
        <span>Built with AXA France Canopée · Client collection</span>
      </footer>
    </div>
  );
}
