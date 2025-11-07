import { test, expect } from '@playwright/test';

test.describe('Quiz Creation Flow', () => {
  test('admin can create a new quiz', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');

    // Click create quiz button
    await page.click('text=Create Quiz');

    // Fill in quiz details
    await page.fill('input[name="title"]', 'E2E Test Quiz');
    await page.fill('textarea[name="description"]', 'This is an E2E test quiz');

    // Add a metric
    await page.click('text=Add Metric');
    await page.fill('input[name="metrics.0.name"]', 'Wellbeing');
    await page.fill('input[name="metrics.0.description"]', 'Overall wellbeing score');

    // Add a question
    await page.click('text=Add Question');
    await page.fill('input[name="questions.0.text"]', 'How do you feel today?');

    // Add two answers (minimum required)
    await page.click('text=Add Answer', { force: true });
    await page.fill('input[name="questions.0.answers.0.text"]', 'Great');

    await page.click('text=Add Answer', { force: true });
    await page.fill('input[name="questions.0.answers.1.text"]', 'Not so good');

    // Set scores for answers
    const scoreInputs = page.locator('input[type="range"]');
    await scoreInputs.nth(0).fill('5'); // Great = 5
    await scoreInputs.nth(1).fill('2'); // Not so good = 2

    // Submit the quiz
    await page.click('button:has-text("Create Quiz")');

    // Should navigate back to admin page
    await expect(page).toHaveURL(/\/admin/);

    // Should show success toast
    await expect(page.locator('text=Quiz created successfully')).toBeVisible();

    // Quiz should appear in the list
    await expect(page.locator('text=E2E Test Quiz')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/admin/create');

    // Try to submit without filling anything
    await page.click('button:has-text("Create Quiz")');

    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();

    // Should not navigate away
    await expect(page).toHaveURL(/\/admin\/create/);
  });

  test('can remove metrics and questions', async ({ page }) => {
    await page.goto('/admin/create');

    // Add a metric
    await page.click('text=Add Metric');
    await expect(page.locator('text=Metric #1')).toBeVisible();

    // Remove the metric
    await page.click('[aria-label="Delete metric"]');
    await expect(page.locator('text=Metric #1')).not.toBeVisible();

    // Add a question
    await page.click('text=Add Question');
    await expect(page.locator('text=Question #1')).toBeVisible();

    // Remove the question
    await page.click('[aria-label="Delete question"]');
    await expect(page.locator('text=Question #1')).not.toBeVisible();
  });
});
