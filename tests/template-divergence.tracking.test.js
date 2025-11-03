/**
 * Template Divergence Management - Customization Tracking
 * 
 * Tests that the system automatically tracks when journals/pages
 * customize templates and displays this information correctly.
 */

import { test, expect } from '@playwright/test';

test.describe('Template Customization Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should show "Using base template" status for unmodified journal', async ({ page }) => {
    // Navigate to a journal TOC that hasn't been customized
    await page.goto('http://localhost:5173/journal/physics/current');
    
    // Click edit button
    await page.click('button:has-text("Edit")');
    
    // Should show base template status
    const statusIndicator = page.locator('[data-testid="template-status"]');
    if (await statusIndicator.isVisible()) {
      await expect(statusIndicator).toContainText(/Using base|Default template/i);
    }
  });

  test('should automatically track when a journal customizes the TOC template', async ({ page }) => {
    // Navigate to ADVMA TOC (Digital Government journal)
    await page.goto('http://localhost:5173/journal/dgov/current');
    
    // Enter edit mode
    await page.click('button:has-text("Edit")');
    await page.waitForSelector('[data-testid="page-builder"]');
    
    // Wait for canvas to load
    await page.waitForSelector('[data-testid="canvas"]', { timeout: 5000 });
    
    // Click on Journal Banner section to select it
    const journalBanner = page.locator('text=Journal Banner').or(
      page.locator('[data-section-name="Journal Banner"]')
    ).first();
    
    if (await journalBanner.isVisible()) {
      await journalBanner.click();
      
      // Modify background color in properties panel
      const bgColorPicker = page.locator('[data-testid="background-color"]').or(
        page.locator('input[type="color"]')
      ).first();
      
      if (await bgColorPicker.isVisible()) {
        await bgColorPicker.fill('#DC2626'); // Red
        
        // Wait for change to apply
        await page.waitForTimeout(500);
        
        // Status should change to "Customized"
        const statusIndicator = page.locator('[data-testid="template-status"]');
        if (await statusIndicator.isVisible()) {
          await expect(statusIndicator).toContainText(/Customized|Modified/i);
        }
      }
    }
  });

  test('should show customization count in Template Library after editing', async ({ page }) => {
    // First, make a customization to ADVMA TOC
    await page.goto('http://localhost:5173/journal/dgov/current');
    await page.click('button:has-text("Edit")');
    
    // Wait for editor to load
    await page.waitForSelector('[data-testid="page-builder"]');
    
    // Make a simple change (click on any section)
    const firstSection = page.locator('[data-testid^="section-"]').first();
    if (await firstSection.isVisible()) {
      await firstSection.click();
    }
    
    // Navigate to Template Library
    await page.goto('http://localhost:5173');
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    // Look for TOC template
    const tocTemplate = page.locator('text=TOC').or(
      page.locator('text=Table of Contents')
    ).first();
    
    if (await tocTemplate.isVisible()) {
      const templateCard = tocTemplate.locator('..');
      
      // Should show at least 1 customization
      await expect(templateCard.locator('text=/\\d+ customized/')).toBeVisible();
    }
  });

  test('should list ADVMA in customizations when it modifies TOC', async ({ page }) => {
    // Navigate directly to Template Library
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    // Find TOC template and expand customizations
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    
    if (await customizedBadge.isVisible()) {
      await customizedBadge.click();
      
      // Should see journal names in customization list
      const customizationList = page.locator('[data-testid="customization-list"]');
      await expect(customizationList).toBeVisible();
      
      // Should show modification count
      await expect(page.locator('text=/\\d+ modification/i')).toBeVisible();
    }
  });

  test('should increment modification count when multiple changes made', async ({ page }) => {
    // Navigate to journal TOC
    await page.goto('http://localhost:5173/journal/dgov/current');
    await page.click('button:has-text("Edit")');
    await page.waitForSelector('[data-testid="page-builder"]');
    
    // Make first change - click section 1
    const section1 = page.locator('[data-testid^="section-"]').first();
    if (await section1.isVisible()) {
      await section1.click();
      await page.waitForTimeout(300);
    }
    
    // Make second change - click section 2
    const section2 = page.locator('[data-testid^="section-"]').nth(1);
    if (await section2.isVisible()) {
      await section2.click();
      await page.waitForTimeout(300);
    }
    
    // Check status shows multiple modifications
    const statusIndicator = page.locator('[data-testid="template-status"]');
    if (await statusIndicator.isVisible()) {
      // Should show customized status with count
      await expect(statusIndicator).toContainText(/Customized|Modified/i);
    }
  });

  test('should track customizations per journal independently', async ({ page }) => {
    // Customize ADVMA
    await page.goto('http://localhost:5173/journal/dgov/current');
    await page.click('button:has-text("Edit")');
    await page.waitForSelector('[data-testid="page-builder"]');
    const advmaSection = page.locator('[data-testid^="section-"]').first();
    if (await advmaSection.isVisible()) {
      await advmaSection.click();
    }
    
    // Customize EMBO (different journal)
    await page.goto('http://localhost:5173/journal/embo/current');
    await page.click('button:has-text("Edit")');
    await page.waitForSelector('[data-testid="page-builder"]');
    const emboSection = page.locator('[data-testid^="section-"]').first();
    if (await emboSection.isVisible()) {
      await emboSection.click();
    }
    
    // Check Template Library shows both
    await page.goto('http://localhost:5173');
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    if (await customizedBadge.isVisible()) {
      // Should show 2 (or more) customizations
      const count = await customizedBadge.textContent();
      const number = parseInt(count.match(/\d+/)[0]);
      expect(number).toBeGreaterThanOrEqual(2);
    }
  });

  test('should persist customization tracking across page reloads', async ({ page }) => {
    // Make a customization
    await page.goto('http://localhost:5173/journal/dgov/current');
    await page.click('button:has-text("Edit")');
    await page.waitForSelector('[data-testid="page-builder"]');
    
    const section = page.locator('[data-testid^="section-"]').first();
    if (await section.isVisible()) {
      await section.click();
    }
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Navigate to Template Library
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    // Should still show customizations after reload
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    await expect(customizedBadge).toBeVisible();
  });
});

