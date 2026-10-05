import { expect, test } from '@playwright/test';

test('failed transfers retain details and can be retried', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Your accounts' })).toBeVisible();
  const scenario = page.getByRole('group', { name: 'API scenario' });
  await scenario.getByRole('button', { name: 'Error', exact: true }).click();
  await page.getByRole('textbox', { name: 'Amount', exact: true }).fill('25');
  await page.getByRole('textbox', { name: 'Reference (optional)' }).fill('Retry savings');
  await page.getByRole('button', { name: 'Confirm transfer' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'temporarily unavailable' }),
  ).toContainText('temporarily unavailable');
  // Deliberate wrong expectation: a failed request must preserve this value.
  await expect(page.getByRole('textbox', { name: 'Amount', exact: true })).toHaveValue('');
  await expect(page.getByRole('textbox', { name: 'Reference (optional)' })).toHaveValue(
    'Retry savings',
  );
  await expect(
    page.getByRole('article', { name: 'Current account' }).getByText('€3,248.50', { exact: true }),
  ).toBeVisible();
  await scenario.getByRole('button', { name: 'Normal', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm transfer' }).click();
  await expect(page.getByRole('heading', { name: 'Transfer completed' })).toBeVisible();
  await expect(
    page.getByRole('article', { name: 'Current account' }).getByText('€3,223.50', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('article', { name: 'Savings account' }).getByText('€12,525.00', { exact: true }),
  ).toBeVisible();
});
