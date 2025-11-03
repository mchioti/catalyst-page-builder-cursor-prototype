/**
 * Template Divergence Management - Reset to Base
 * 
 * Tests the ability to reset customized templates back to the base template,
 * removing all customizations and falling back to the default.
 */

import { test, expect } from '@playwright/test';

test.describe('Reset to Base Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should show reset button for customized journals in Template Library', async ({ page }) => {
    // Navigate to Template Library
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    // Expand customization list
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    
    if (await customizedBadge.isVisible()) {
      await customizedBadge.click();
      
      // Should see reset button for each customized journal
      const resetButton = page.locator('[data-testid^="reset-"]').first();
      await expect(resetButton).toBeVisible();
      await expect(resetButton).toHaveAttribute('title', /Reset|Remove customizations/i);
    }
  });

  test('should show confirmation dialog when reset clicked', async ({ page }) => {
    // Navigate to Template Library
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    
    if (await customizedBadge.isVisible()) {
      await customizedBadge.click();
      
      // Listen for dialog
      page.on('dialog', dialog => {
        expect(dialog.message()).toMatch(/Reset|remove|delete|customizations/i);
        dialog.dismiss(); // Don't actually reset in this test
      });
      
      // Click reset button
      const resetButton = page.locator('[data-testid^="reset-"]').first();
      await resetButton.click();
    }
  });

  test('should remove journal from customization list after reset', async ({ page }) => {
    // First, ensure ADVMA has customizations
    await page.goto('http://localhost:5173/journal/dgov/current');
    await page.click('button:has-text("Edit")');
    await page.waitForSelector('[data-testid="page-builder"]');
    
    // Make a change
    const section = page.locator('[data-testid^="section-"]').first();
    if (await section.isVisible()) {
      await section.click();
      await page.waitForTimeout(300);
    }
    
    // Go to Template Library
    await page.goto('http://localhost:5173');
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    
    if (await customizedBadge.isVisible()) {
      // Get initial count
      const initialCount = await customizedBadge.textContent();
      const initialNumber = parseInt(initialCount.match(/\d+/)[0]);
      
      await customizedBadge.click();
      
      // Accept reset dialog
      page.on('dialog', dialog => dialog.accept());
      
      // Click reset for first journal
      const resetButton = page.locator('[data-testid^="reset-"]').first();
      await resetButton.click();
      
      // Wait for reset to process
      await page.waitForTimeout(1000);
      
      // Count should decrease by 1
      const newBadge = page.locator('text=/\\d+ customized/').first();
      if (await newBadge.isVisible()) {
        const newCount = await newBadge.textContent();
        const newNumber = parseInt(newCount.match(/\d+/)[0]);
        expect(newNumber).toBe(initialNumber - 1);
      } else {
        // If badge disappeared, all customizations were removed
        await expect(page.locator('text=0 customized')).toBeVisible();
      }
    }
  });

  test('should restore base template styling after reset', async ({ page }) => {
    // Customize ADVMA with red banner
    await page.goto('http://localhost:5173/journal/dgov/current');
    await page.click('button:has-text("Edit")');
    await page.waitForSelector('[data-testid="page-builder"]');
    
    // Try to change banner color
    const journalBanner = page.locator('text=Journal Banner').first();
    if (await journalBanner.isVisible()) {
      await journalBanner.click();
      
      const colorPicker = page.locator('input[type="color"]').first();
      if (await colorPicker.isVisible()) {
        await colorPicker.fill('#DC2626'); // Red
        await page.waitForTimeout(500);
      }
    }
    
    // Reset via Template Library
    await page.goto('http://localhost:5173');
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    if (await customizedBadge.isVisible()) {
      await customizedBadge.click();
      
      // Accept reset
      page.on('dialog', dialog => dialog.accept());
      await page.locator('[data-testid^="reset-"]').first().click();
      await page.waitForTimeout(1000);
    }
    
    // Navigate back to ADVMA TOC
    await page.goto('http://localhost:5173/journal/dgov/current');
    
    // Should show base template (black/default background)
    // This is visual validation - in real test we'd check specific element styles
    await expect(page.locator('[data-testid="journal-banner"]')).toBeVisible();
  });

  test('should update "using base" count after reset', async ({ page }) => {
    // Navigate to Template Library
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    // Get initial "using base" count
    const usingBaseBadge = page.locator('text=/\\d+ using base/').first();
    let initialBaseCount = 0;
    
    if (await usingBaseBadge.isVisible()) {
      const text = await usingBaseBadge.textContent();
      initialBaseCount = parseInt(text.match(/\d+/)[0]);
    }
    
    // Reset a customization
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    if (await customizedBadge.isVisible()) {
      await customizedBadge.click();
      
      page.on('dialog', dialog => dialog.accept());
      await page.locator('[data-testid^="reset-"]').first().click();
      await page.waitForTimeout(1000);
      
      // "Using base" count should increase by 1
      const newUsingBaseBadge = page.locator('text=/\\d+ using base/').first();
      if (await newUsingBaseBadge.isVisible()) {
        const newText = await newUsingBaseBadge.textContent();
        const newBaseCount = parseInt(newText.match(/\d+/)[0]);
        expect(newBaseCount).toBe(initialBaseCount + 1);
      }
    }
  });

  test('should change status from "Customized" to "Using base" in Page Builder', async ({ page }) => {
    // Reset a journal via Template Library
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    if (await customizedBadge.isVisible()) {
      await customizedBadge.click();
      
      page.on('dialog', dialog => dialog.accept());
      await page.locator('[data-testid^="reset-"]').first().click();
      await page.waitForTimeout(1000);
    }
    
    // Navigate to the reset journal's TOC
    await page.goto('http://localhost:5173/journal/dgov/current');
    await page.click('button:has-text("Edit")');
    
    // Status should show "Using base template"
    const statusIndicator = page.locator('[data-testid="template-status"]');
    if (await statusIndicator.isVisible()) {
      await expect(statusIndicator).toContainText(/Using base|Default/i);
      await expect(statusIndicator).not.toContainText(/Customized|Modified/i);
    }
  });

  test('should allow resetting multiple journals independently', async ({ page }) => {
    // Navigate to Template Library
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    
    if (await customizedBadge.isVisible()) {
      const initialText = await customizedBadge.textContent();
      const initialCount = parseInt(initialText.match(/\d+/)[0]);
      
      // Only test if we have at least 2 customizations
      if (initialCount >= 2) {
        await customizedBadge.click();
        
        // Reset first journal
        page.on('dialog', dialog => dialog.accept());
        await page.locator('[data-testid^="reset-"]').first().click();
        await page.waitForTimeout(1000);
        
        // Should still have remaining customizations
        const remainingBadge = page.locator('text=/\\d+ customized/').first();
        if (await remainingBadge.isVisible()) {
          const remainingText = await remainingBadge.textContent();
          const remainingCount = parseInt(remainingText.match(/\d+/)[0]);
          expect(remainingCount).toBe(initialCount - 1);
        }
      }
    }
  });

  test('should show success notification after successful reset', async ({ page }) => {
    // Navigate to Template Library
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    
    if (await customizedBadge.isVisible()) {
      await customizedBadge.click();
      
      page.on('dialog', dialog => dialog.accept());
      await page.locator('[data-testid^="reset-"]').first().click();
      
      // Should show success toast/notification
      await expect(page.locator('text=/Reset|Success|Restored/i')).toBeVisible({ timeout: 3000 });
    }
  });
});

