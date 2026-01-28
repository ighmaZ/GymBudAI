import { test, expect } from '@playwright/test';

test.describe('Form Correction Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/form-correction');
  });

  test('should display the page header with correct title', async ({ page }) => {
    // Check for the header
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check for page title
    await expect(page.getByRole('heading', { name: /form correction/i })).toBeVisible();
  });

  test('should display "Check Your Form" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /check your form/i })).toBeVisible();
  });

  test('should display upload instruction text', async ({ page }) => {
    await expect(page.getByText(/upload a video of your exercise/i)).toBeVisible();
  });

  test('should display video upload component', async ({ page }) => {
    // VideoUpload component should be visible
    // Look for upload-related elements
    const uploadArea = page.locator('[class*="upload"], [class*="dropzone"], [role="button"]').first();
    await expect(uploadArea).toBeVisible();
  });

  test('should have a back button to homepage', async ({ page }) => {
    const backLink = page.getByRole('link').filter({ has: page.locator('svg') }).first();
    await expect(backLink).toBeVisible();
    
    await backLink.click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Form Correction Page - Video Upload UI', () => {
  test('should display upload options', async ({ page }) => {
    await page.goto('/form-correction');
    
    // Should have icons for video and camera
    const svgIcons = page.locator('svg');
    const iconCount = await svgIcons.count();
    expect(iconCount).toBeGreaterThan(0);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/form-correction');
    
    // Page should render properly
    await expect(page.getByRole('heading', { name: /check your form/i })).toBeVisible();
  });
});
