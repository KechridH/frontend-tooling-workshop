import { expect, test } from '@playwright/test';

test('a customer searches activity and transfers money between accounts', async ({ page }) => {
  const errors: Error[] = [];
  page.on('pageerror', (error) => errors.push(error));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Your accounts' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search transactions' }).fill('metro');
  await expect(page.getByText('1 transaction found')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search transactions' }).clear();
  await page.getByRole('textbox', { name: 'Amount' }).fill('100.25');
  await page.getByRole('textbox', { name: 'Reference (optional)' }).fill('Weekend savings');
  await page.getByRole('button', { name: 'Confirm transfer' }).click();
  await expect(page.getByRole('heading', { name: 'Transfer completed' })).toBeVisible();
  await expect(
    page.getByRole('article', { name: 'Current account' }).getByText('€3,148.25', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('article', { name: 'Savings account' }).getByText('€12,600.25', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Weekend savings', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'View savings account transactions' }).click();
  await expect(page.getByText('Weekend savings', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('a customer recovers from a failed account request', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Your accounts' })).toBeVisible();
  await page
    .getByRole('group', { name: 'API scenario' })
    .getByRole('button', { name: 'Error' })
    .click();
  await page.getByRole('button', { name: 'Reload accounts' }).click();
  await expect(
    page.getByRole('heading', { name: 'We couldn’t load your accounts.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(
    page.getByRole('heading', { name: 'We couldn’t load your accounts.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Restore normal response' }).click();
  await expect(page.getByRole('heading', { name: 'Your accounts' })).toBeVisible();
});

test('a slow transfer shows progress and cannot be submitted twice', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Your accounts' })).toBeVisible();
  await page
    .getByRole('group', { name: 'API scenario' })
    .getByRole('button', { name: 'Slow' })
    .click();
  await page.getByRole('textbox', { name: 'Amount' }).fill('25');
  await page.getByRole('button', { name: 'Confirm transfer' }).click();
  await expect(page.getByRole('form', { name: 'Make a transfer' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Sending transfer…' })).toBeDisabled();
  await expect(page.getByRole('textbox', { name: 'Amount' })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Transfer completed' })).toBeVisible();
  await expect(
    page.getByRole('article', { name: 'Current account' }).getByText('€3,223.50', { exact: true }),
  ).toBeVisible();
});
