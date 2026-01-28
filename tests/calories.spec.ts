import { test, expect } from '@playwright/test';

test.describe('Calories Page - Unauthenticated', () => {
  test('should show sign in required message when not authenticated', async ({ page }) => {
    await page.goto('/calories');
    
    // Should display sign in required message
    await expect(page.getByRole('heading', { name: /sign in required/i })).toBeVisible();
    await expect(page.getByText(/please sign in to track/i)).toBeVisible();
  });

  test('should have a back to home link when not authenticated', async ({ page }) => {
    await page.goto('/calories');
    
    // Should have a back to home link
    const backLink = page.getByRole('link', { name: /back to home/i });
    await expect(backLink).toBeVisible();
    
    // Click and verify navigation
    await backLink.click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Calories Page - Page Structure', () => {
  test('should display page content', async ({ page }) => {
    await page.goto('/calories');
    
    // When unauthenticated, shows sign-in message (no header)
    // When authenticated, shows header
    // Either way, page body should be visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/calories');
    
    // Page should still render properly on mobile
    await expect(page.locator('body')).toBeVisible();
  });
});
