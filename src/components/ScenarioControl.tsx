import { Button } from '@axa-fr/canopee-react/client';
import type { Scenario } from '../app/banking';

export function ScenarioControl({
  scenario,
  busy,
  onScenario,
  onReload,
}: {
  scenario: Scenario;
  busy: boolean;
  onScenario: (scenario: Scenario) => void;
  onReload: () => void;
}) {
  return (
    <section className="workshop-controls" aria-labelledby="workshop-title">
      <div>
        <p className="eyebrow">WORKSHOP CONTROLS</p>
        <h2 id="workshop-title">Own the API response</h2>
        <p>Choose the next response, then reload accounts or submit a transfer.</p>
      </div>
      <div className="workshop-controls__actions">
        <fieldset className="scenario-controls">
          <legend className="sr-only">API scenario</legend>
          {(['normal', 'slow', 'error'] as const).map((value) => (
            <Button
              key={value}
              type="button"
              variant={scenario === value ? 'primary' : 'secondary'}
              disabled={busy}
              aria-pressed={scenario === value}
              onClick={() => onScenario(value)}
            >
              {value[0].toUpperCase() + value.slice(1)}
            </Button>
          ))}
        </fieldset>
        <Button type="button" variant="secondary" disabled={busy} onClick={onReload}>
          Reload accounts
        </Button>
      </div>
    </section>
  );
}
