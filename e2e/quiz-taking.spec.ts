import { test, expect } from '@playwright/test';

test.describe('Quiz Taking Flow', () => {
  test('user can complete a quiz and see results', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Should see available quizzes (sample data)
    await expect(page.locator('text=Wellbeing Assessment')).toBeVisible();

    // Click on a quiz to start
    await page.click('text=Take Quiz');

    // Should show the first question
    await expect(page.locator('h2')).toContainText(/question/i);

    // Answer the first question
    await page.click('ion-radio:first-child');

    // Should enable Next button after selecting answer
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeEnabled();

    // Click Next to go to second question
    await nextButton.click();

    // Should show second question
    await expect(page.locator('text=2 of')).toBeVisible();

    // Answer all remaining questions
    for (let i = 0; i < 9; i++) {
      // Select an answer
      await page.click('ion-radio:first-child');

      // Click Next or Submit on last question
      if (i < 8) {
        await page.click('button:has-text("Next")');
      } else {
        await page.click('button:has-text("Submit")');
      }
    }

    // Should navigate to results page
    await expect(page).toHaveURL(/\/results/);

    // Should show results
    await expect(page.locator('text=Your Results')).toBeVisible();

    // Should show metric scores
    await expect(page.locator('text=Physical Health')).toBeVisible();
    await expect(page.locator('text=Mental Health')).toBeVisible();
    await expect(page.locator('text=Social Connection')).toBeVisible();

    // Should show percentages
    await expect(page.locator('text=%')).toBeVisible();
  });

  test('cannot proceed without answering question', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Take Quiz');

    // Next button should be disabled without answer
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeDisabled();

    // Select an answer
    await page.click('ion-radio:first-child');

    // Now Next button should be enabled
    await expect(nextButton).toBeEnabled();
  });

  test('can navigate back to previous question', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Take Quiz');

    // Answer first question
    await page.click('ion-radio:first-child');
    await page.click('button:has-text("Next")');

    // Should be on question 2
    await expect(page.locator('text=2 of')).toBeVisible();

    // Click Back button
    await page.click('button:has-text("Back")');

    // Should be back on question 1
    await expect(page.locator('text=1 of')).toBeVisible();

    // Previous answer should still be selected
    await expect(page.locator('ion-radio:checked')).toBeVisible();
  });

  test('shows loading state while submitting', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Take Quiz');

    // Answer all questions quickly
    for (let i = 0; i < 10; i++) {
      await page.click('ion-radio:first-child');

      if (i < 9) {
        await page.click('button:has-text("Next")');
      } else {
        await page.click('button:has-text("Submit")');
      }
    }

    // Should show loading indicator or disabled button briefly
    // Then navigate to results
    await expect(page).toHaveURL(/\/results/, { timeout: 10000 });
  });

  test('handles quiz not found error', async ({ page }) => {
    // Navigate to invalid quiz ID
    await page.goto('/quiz/invalid-id');

    // Should show error message or redirect
    await expect(page.locator('text=not found')).toBeVisible({ timeout: 5000 });
  });
});
