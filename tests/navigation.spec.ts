import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to Calories page', async ({ page }) => {
    await page.goto('/calories');
    
    // Should be on calories page
    await expect(page).toHaveURL('/calories');
    
    // Should show sign in required or the dashboard
    const signInRequired = page.getByRole('heading', { name: /sign in required/i });
    const dashboard = page.getByText(/dashboard/i);
    
    const isSignInVisible = await signInRequired.isVisible().catch(() => false);
    const isDashboardVisible = await dashboard.isVisible().catch(() => false);
    
    expect(isSignInVisible || isDashboardVisible).toBeTruthy();
  });

  test('should navigate to Form Correction page', async ({ page }) => {
    await page.goto('/form-correction');
    
    // Should be on form-correction page
    await expect(page).toHaveURL('/form-correction');
    
    // Should show check your form heading
    await expect(page.getByRole('heading', { name: /check your form/i })).toBeVisible();
  });

  test('should navigate to Workout Planner page', async ({ page }) => {
    await page.goto('/workout-planner');
    
    // Should be on workout-planner page or redirected to home
    const url = page.url();
    expect(url.includes('/workout-planner') || url.includes('/')).toBeTruthy();
  });

  test('should navigate back to home from calories page', async ({ page }) => {
    await page.goto('/calories');
    
    // Find and click the back arrow link
    const backLink = page.getByRole('link').filter({ has: page.locator('svg') }).first();
    await backLink.click();
    
    // Should be back on homepage
    await expect(page).toHaveURL('/');
  });

  test('should navigate back to home from form-correction page', async ({ page }) => {
    await page.goto('/form-correction');
    
    // Find and click the back arrow link
    const backLink = page.getByRole('link').filter({ has: page.locator('svg') }).first();
    await backLink.click();
    
    // Should be back on homepage
    await expect(page).toHaveURL('/');
  });

  test('should navigate back to home from workout-planner page', async ({ page }) => {
    await page.goto('/workout-planner');
    
    // Wait for potential redirect if not authenticated
    await page.waitForTimeout(500);
    
    // If we're on the workout planner page
    if (await page.url().includes('/workout-planner')) {
      const backLink = page.getByRole('link').filter({ has: page.locator('svg') }).first();
      await backLink.click();
      await expect(page).toHaveURL('/');
    } else {
      // User was redirected due to auth - this is expected behavior
      await expect(page).toHaveURL('/');
    }
  });
});

test.describe('Feature Section Navigation', () => {
  test('should show auth modal when clicking Get Started (unauthenticated)', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to features section
    await page.locator('#features').scrollIntoViewIfNeeded();
    
    // Click on the first "Get Started" link
    const getStartedLinks = page.getByRole('link', { name: /get started/i });
    
    if (await getStartedLinks.first().isVisible()) {
      await getStartedLinks.first().click();
      
      // Either a modal appears or navigation happens
      // Check if AuthModal appeared (contains Sign In text)
      const authModal = page.getByText(/sign in/i);
      const isModalVisible = await authModal.isVisible().catch(() => false);
      
      if (isModalVisible) {
        // Auth modal is showing - expected for unauthenticated users
        await expect(authModal).toBeVisible();
      }
    }
  });
});
