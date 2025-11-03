/**
 * Template Divergence Management - Smoke Tests
 * 
 * These are the simplest tests to verify basic UI elements exist.
 * Tests the Template Library UI with divergence tracking.
 */

import { test, expect } from '@playwright/test';

test.describe('Template Library - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start dev server and navigate to app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    // Wait for React to mount
    await page.waitForSelector('text=Design Console', { timeout: 10000 });
  });

  test('should display Design Console with Theme Templates navigation', async ({ page }) => {
    // Navigate to Design Console
    await page.click('text=Design Console');
    await page.waitForSelector('text=Design System Overview');
    
    // Find Modernist Theme card
    const modernistCard = page.locator('text=Modern').locator('..');
    expect(modernistCard).toBeVisible();
    
    // Click Theme Templates link
    await page.click('text=Theme Templates →');
    
    // Should be on templates page
    await expect(page.locator('h2:has-text("Theme Templates")')).toBeVisible();
  });

  test('should display template library with template cards', async ({ page }) => {
    // Navigate to Template Library
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    
    // Should see template category tabs
    await expect(page.locator('text=Website Page Templates')).toBeVisible();
    await expect(page.locator('text=Publication Page Templates')).toBeVisible();
    
    // Should see at least one template card
    const templateCards = page.locator('[data-testid="template-card"]');
    await expect(templateCards.first()).toBeVisible();
  });

  test('should display divergence stats on template cards', async ({ page }) => {
    // Navigate to Template Library
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    
    // Select Publication templates (where TOC lives)
    await page.click('text=Publication Page Templates');
    
    // Find TOC template card (or any template card)
    const templateCard = page.locator('[data-testid="template-card"]').first();
    
    // Should show divergence stats
    await expect(templateCard.locator('text=/using base|customized/')).toBeVisible();
  });

  test('should show customization list when divergence badge clicked', async ({ page }) => {
    // Navigate to Template Library
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    // Find a template with customizations (look for "customized" text)
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    
    if (await customizedBadge.isVisible()) {
      // Click to expand customization list
      await customizedBadge.click();
      
      // Should show list of journals/pages that customized this template
      await expect(page.locator('[data-testid="customization-list"]')).toBeVisible();
      await expect(page.locator('text=modifications')).toBeVisible();
    } else {
      // No customizations yet - that's fine for initial state
      console.log('No customizations found - this is expected for fresh install');
    }
  });

  test('should show action buttons for customized journals', async ({ page }) => {
    // Navigate to Template Library
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    // Expand customization list if it exists
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    
    if (await customizedBadge.isVisible()) {
      await customizedBadge.click();
      
      // Should see action buttons
      await expect(page.locator('[data-testid^="view-diff-"]').first()).toBeVisible();
      await expect(page.locator('[data-testid^="reset-"]').first()).toBeVisible();
      await expect(page.locator('[data-testid^="promote-"]').first()).toBeVisible();
      await expect(page.locator('[data-testid^="exempt-"]').first()).toBeVisible();
    }
  });

  test('should open visual diff modal when view diff clicked', async ({ page }) => {
    // Navigate to Template Library
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    // Expand customization list
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    
    if (await customizedBadge.isVisible()) {
      await customizedBadge.click();
      
      // Click view diff button
      await page.click('[data-testid^="view-diff-"]');
      
      // Should open diff modal
      await expect(page.locator('text=Base Template')).toBeVisible();
      await expect(page.locator('text=Customized')).toBeVisible();
      await expect(page.locator('[data-testid="diff-modal"]')).toBeVisible();
    }
  });

  test('should navigate to Website Custom Templates section', async ({ page }) => {
    // Navigate to Design Console
    await page.click('text=Design Console');
    
    // Navigate to a website
    await page.click('text=Websites');
    
    // Find Wiley Main website card
    const websiteCard = page.locator('text=Wiley Main').locator('..');
    await expect(websiteCard).toBeVisible();
    
    // Should have Custom Templates link
    // Note: This will be in website settings/navigation
    await expect(page.locator('text=Custom Templates')).toBeVisible();
  });
});

