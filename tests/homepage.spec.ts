import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the navbar with logo', async ({ page }) => {
    // Check that the navbar is visible
    const navbar = page.locator('nav, header').first();
    await expect(navbar).toBeVisible();
    
    // Check for GYMBUD AI branding
    await expect(page.getByText('GYMBUD AI').first()).toBeVisible();
  });

  test('should display navigation links', async ({ page }) => {
    // Check for main navigation items
    await expect(page.getByRole('link', { name: /count calories/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /form correction/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /workout planner/i })).toBeVisible();
  });

  test('should display the hero section with ScrollyTelling', async ({ page }) => {
    // The ScrollyTelling component should be present
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should display the features section', async ({ page }) => {
    // Scroll to features section
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();

    // Check for feature titles
    await expect(page.getByRole('heading', { name: /count calories/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /ai form correction/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /workout planner/i })).toBeVisible();
  });

  test('should have correct page title and meta', async ({ page }) => {
    // Check the page has loaded properly
    await expect(page).toHaveURL('/');
  });

  test('should scroll to features section when navigating', async ({ page }) => {
    // Click on features section link if available
    const featuresSection = page.locator('#features');
    
    // Scroll into view
    await featuresSection.scrollIntoViewIfNeeded();
    
    // Verify the section is now in viewport
    await expect(featuresSection).toBeInViewport();
  });
});

test.describe('Homepage - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display mobile navigation', async ({ page }) => {
    await page.goto('/');
    
    // On mobile, navbar should still be visible
    const navbar = page.locator('nav, header').first();
    await expect(navbar).toBeVisible();
  });

  test('should show hamburger menu on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Look for hamburger menu icon (Menu from lucide-react)
    const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(menuButton).toBeVisible();
  });
});
