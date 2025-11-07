import { test, expect } from '@playwright/test';

test.describe('Quiz Editing Flow', () => {
  test('admin can edit existing quiz', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');

    // Should see list of quizzes
    await expect(page.locator('text=Wellbeing Assessment')).toBeVisible();

    // Click edit button on first quiz
    await page.click('[aria-label="Edit quiz"]:first-child');

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/admin\/edit\//);

    // Should load existing quiz data
    await expect(page.locator('input[name="title"]')).toHaveValue(/Wellbeing/);

    // Update the title
    await page.fill('input[name="title"]', 'Updated Wellbeing Assessment');

    // Update description
    await page.fill('textarea[name="description"]', 'Updated description for testing');

    // Submit changes
    await page.click('button:has-text("Update Quiz")');

    // Should navigate back to admin page
    await expect(page).toHaveURL(/\/admin/);

    // Should show success toast
    await expect(page.locator('text=updated successfully')).toBeVisible();

    // Updated title should appear in list
    await expect(page.locator('text=Updated Wellbeing Assessment')).toBeVisible();
  });

  test('can add new metric to existing quiz', async ({ page }) => {
    await page.goto('/admin');
    await page.click('[aria-label="Edit quiz"]:first-child');

    // Wait for quiz to load
    await page.waitForSelector('input[name="title"]');

    // Count existing metrics
    const initialMetricsCount = await page.locator('text=/Metric #/').count();

    // Add new metric
    await page.click('text=Add Metric');

    // Should have one more metric
    const newMetricsCount = await page.locator('text=/Metric #/').count();
    expect(newMetricsCount).toBe(initialMetricsCount + 1);

    // Fill in new metric details
    await page.fill(`input[name="metrics.${initialMetricsCount}.name"]`, 'New Metric');
    await page.fill(`input[name="metrics.${initialMetricsCount}.description"]`, 'New metric description');

    // Save changes
    await page.click('button:has-text("Update Quiz")');

    await expect(page).toHaveURL(/\/admin/);
  });

  test('can delete metric from existing quiz', async ({ page }) => {
    await page.goto('/admin');
    await page.click('[aria-label="Edit quiz"]:first-child');

    await page.waitForSelector('input[name="title"]');

    // Count existing metrics
    const initialMetricsCount = await page.locator('[aria-label="Delete metric"]').count();

    if (initialMetricsCount > 0) {
      // Delete first metric
      await page.click('[aria-label="Delete metric"]:first-child');

      // Should have one fewer metric
      const newMetricsCount = await page.locator('[aria-label="Delete metric"]').count();
      expect(newMetricsCount).toBe(initialMetricsCount - 1);
    }
  });

  test('validates quiz updates', async ({ page }) => {
    await page.goto('/admin');
    await page.click('[aria-label="Edit quiz"]:first-child');

    await page.waitForSelector('input[name="title"]');

    // Clear the title (required field)
    await page.fill('input[name="title"]', '');

    // Try to submit
    await page.click('button:has-text("Update Quiz")');

    // Should show validation error
    await expect(page.locator('text=required')).toBeVisible();

    // Should stay on edit page
    await expect(page).toHaveURL(/\/admin\/edit\//);
  });

  test('can cancel editing and return to admin page', async ({ page }) => {
    await page.goto('/admin');
    await page.click('[aria-label="Edit quiz"]:first-child');

    await expect(page).toHaveURL(/\/admin\/edit\//);

    // Click back/cancel button
    await page.click('ion-back-button');

    // Should return to admin page
    await expect(page).toHaveURL(/\/admin/);
  });
});
