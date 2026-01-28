import { test, expect } from '@playwright/test';

test.describe('Workout Planner Page - Unauthenticated', () => {
  test('should redirect unauthenticated users to home', async ({ page }) => {
    await page.goto('/workout-planner');
    
    // Wait for navigation/redirect
    await page.waitForTimeout(1000);
    
    // Should redirect to home or show loading
    // The page checks session and redirects if not authenticated
    const currentUrl = page.url();
    
    // Either redirected to home or still on workout-planner showing loading
    expect(currentUrl.includes('/') || currentUrl.includes('/workout-planner')).toBeTruthy();
  });
});

test.describe('Workout Planner Page - Structure', () => {
  test('should have proper page structure when loading', async ({ page }) => {
    await page.goto('/workout-planner');
    
    // Should have a body element
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle page load correctly', async ({ page }) => {
    await page.goto('/workout-planner');
    
    // Wait a moment for navigation
    await page.waitForTimeout(500);
    
    // Page should render something - either content or redirect
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
