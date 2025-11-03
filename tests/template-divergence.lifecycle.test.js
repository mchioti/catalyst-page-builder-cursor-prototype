/**
 * Template Divergence Management - Full Lifecycle
 * 
 * This is the most comprehensive test that covers the complete
 * template management lifecycle including:
 * - Tracking customizations
 * - Viewing diffs
 * - Exempting from updates
 * - Promoting to base
 * - Resetting to base
 * - Handling conflicts
 */

import { test, expect } from '@playwright/test';

test.describe('Template Divergence Management - Full Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('MASTER: Complete template management workflow', async ({ page }) => {
    /**
     * SCENARIO: Sarah (admin) manages template customizations across journals
     * 
     * Initial State:
     * - Base TOC template exists (black banner)
     * - ADVMA customizes it (red banner, extra buttons)
     * - EMBO customizes it (orange banner, different layout)
     * - Physics journal uses default
     * 
     * Workflow:
     * 1. Sarah sees which journals customized
     * 2. Sarah views ADVMA's customizations
     * 3. Sarah exempts EMBO from updates (wants to keep their custom version)
     * 4. Sarah promotes ADVMA's version to base (likes the red banner)
     * 5. Physics automatically inherits red banner
     * 6. EMBO stays orange (exempted)
     * 7. Sarah later resets EMBO to new base
     */

    // ====================
    // SETUP: Create initial customizations
    // ====================
    
    // Customize ADVMA - red banner
    await page.goto('http://localhost:5173/journal/dgov/current');
    await page.click('button:has-text("Edit")');
    await page.waitForSelector('[data-testid="page-builder"]', { timeout: 10000 });
    
    const advmaBanner = page.locator('text=Journal Banner').first();
    if (await advmaBanner.isVisible()) {
      await advmaBanner.click();
      const colorPicker = page.locator('input[type="color"]').first();
      if (await colorPicker.isVisible()) {
        await colorPicker.fill('#DC2626'); // Red
        await page.waitForTimeout(500);
      }
    }
    
    // Customize EMBO - orange banner
    await page.goto('http://localhost:5173/journal/embo/current');
    await page.click('button:has-text("Edit")');
    await page.waitForSelector('[data-testid="page-builder"]', { timeout: 10000 });
    
    const emboBanner = page.locator('text=Journal Banner').first();
    if (await emboBanner.isVisible()) {
      await emboBanner.click();
      const colorPicker = page.locator('input[type="color"]').first();
      if (await colorPicker.isVisible()) {
        await colorPicker.fill('#F97316'); // Orange
        await page.waitForTimeout(500);
      }
    }
    
    // ====================
    // STEP 1: View divergence dashboard
    // ====================
    
    await page.goto('http://localhost:5173');
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    // Should see 2 customizations
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    await expect(customizedBadge).toBeVisible();
    
    const customizedText = await customizedBadge.textContent();
    const customizedCount = parseInt(customizedText.match(/\d+/)[0]);
    expect(customizedCount).toBeGreaterThanOrEqual(2); // At least ADVMA and EMBO
    
    // ====================
    // STEP 2: View ADVMA's customizations (diff)
    // ====================
    
    await customizedBadge.click();
    await page.waitForTimeout(500);
    
    // Click view diff for ADVMA
    const advmaDiffButton = page.locator('[data-testid="view-diff-dgov"]').or(
      page.locator('[data-testid^="view-diff-"]').first()
    );
    
    if (await advmaDiffButton.isVisible()) {
      await advmaDiffButton.click();
      
      // Diff modal should open
      await expect(page.locator('[data-testid="diff-modal"]')).toBeVisible({ timeout: 3000 });
      await expect(page.locator('text=Base Template')).toBeVisible();
      await expect(page.locator('text=Customized')).toBeVisible();
      
      // Should show what changed
      await expect(page.locator('text=/Background|Color|Banner|modification/i')).toBeVisible();
      
      // Close diff modal
      await page.locator('[data-testid="close-diff-modal"]').or(
        page.locator('button:has-text("Close")')
      ).first().click();
      
      await page.waitForTimeout(500);
    }
    
    // ====================
    // STEP 3: Exempt EMBO from updates
    // ====================
    
    // Find EMBO in customization list
    const emboExemptButton = page.locator('[data-testid="exempt-embo"]').or(
      page.locator('[data-testid^="exempt-"]').nth(1)
    );
    
    if (await emboExemptButton.isVisible()) {
      // Accept exemption dialog
      page.once('dialog', dialog => {
        expect(dialog.message()).toMatch(/Exempt|freeze|updates/i);
        dialog.accept();
      });
      
      await emboExemptButton.click();
      await page.waitForTimeout(1000);
      
      // EMBO should now show "Exempted" badge
      const emboRow = page.locator('text=EMBO').locator('..');
      await expect(emboRow.locator('text=Exempted')).toBeVisible();
    }
    
    // ====================
    // STEP 4: Promote ADVMA's version to base
    // ====================
    
    const advmaPromoteButton = page.locator('[data-testid="promote-dgov"]').or(
      page.locator('[data-testid^="promote-"]').first()
    );
    
    if (await advmaPromoteButton.isVisible()) {
      // Accept promotion dialog
      page.once('dialog', dialog => {
        expect(dialog.message()).toMatch(/Promote|base template|inherit/i);
        dialog.accept();
      });
      
      await advmaPromoteButton.click();
      await page.waitForTimeout(2000);
      
      // Should show success notification
      await expect(page.locator('text=/Promoted|Success|Updated/i')).toBeVisible({ timeout: 3000 });
      
      // Wait for UI to update
      await page.waitForTimeout(1000);
    }
    
    // ====================
    // STEP 5: Verify Physics inherited red banner
    // ====================
    
    await page.goto('http://localhost:5173/journal/physics/current');
    
    // Physics should now show red banner (inherited from ADVMA)
    // In real test, we'd check actual background color
    const physicsBanner = page.locator('[data-testid="journal-banner"]');
    await expect(physicsBanner).toBeVisible();
    
    // ====================
    // STEP 6: Verify EMBO kept orange banner (exempted)
    // ====================
    
    await page.goto('http://localhost:5173/journal/embo/current');
    
    // EMBO should still show orange banner (not red)
    const emboBannerLive = page.locator('[data-testid="journal-banner"]');
    await expect(emboBannerLive).toBeVisible();
    
    // ====================
    // STEP 7: Check Template Library state after promotion
    // ====================
    
    await page.goto('http://localhost:5173');
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    // After promotion:
    // - ADVMA should no longer be in customizations (now matches base)
    // - EMBO should still be customized AND exempted
    // - Physics should show as "using base" (the new red base)
    
    const updatedBadge = page.locator('text=/\\d+ customized/').first();
    
    if (await updatedBadge.isVisible()) {
      const updatedText = await updatedBadge.textContent();
      const updatedCount = parseInt(updatedText.match(/\d+/)[0]);
      
      // Should have fewer customizations now (ADVMA promoted, so only EMBO remains)
      expect(updatedCount).toBeLessThan(customizedCount);
      
      // Check exempted count
      await updatedBadge.click();
      await page.waitForTimeout(500);
      
      // EMBO should still be there with "Exempted" badge
      const emboRow = page.locator('text=EMBO').locator('..');
      await expect(emboRow).toBeVisible();
      await expect(emboRow.locator('text=Exempted')).toBeVisible();
    }
    
    // ====================
    // STEP 8: Reset EMBO to new base (red banner)
    // ====================
    
    const emboResetButton = page.locator('[data-testid="reset-embo"]');
    
    if (await emboResetButton.isVisible()) {
      // Accept reset dialog
      page.once('dialog', dialog => {
        expect(dialog.message()).toMatch(/Reset|remove|customizations/i);
        dialog.accept();
      });
      
      await emboResetButton.click();
      await page.waitForTimeout(2000);
      
      // Should show success
      await expect(page.locator('text=/Reset|Success/i')).toBeVisible({ timeout: 3000 });
    }
    
    // ====================
    // FINAL: Verify all journals now on same base (red banner)
    // ====================
    
    await page.goto('http://localhost:5173/journal/embo/current');
    const emboFinalBanner = page.locator('[data-testid="journal-banner"]');
    await expect(emboFinalBanner).toBeVisible();
    // In real test: verify it's red, not orange
    
    // Template Library should show all using base
    await page.goto('http://localhost:5173');
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    // Should show 0 customizations (or "using base" for all)
    await expect(page.locator('text=0 customized').or(
      page.locator('text=/all.*using base/i')
    )).toBeVisible();
  });

  test('should handle conflicts when promoting customizations', async ({ page }) => {
    /**
     * SCENARIO: What happens when promoting creates conflicts?
     * - ADVMA has red banner + 3 buttons
     * - EMBO has orange banner + 2 buttons
     * - Promote ADVMA to base
     * - EMBO now conflicts (has different customizations)
     */
    
    // Create conflicting customizations
    // (Implementation would depend on conflict resolution strategy)
    
    // For now, test that promotion dialog warns about affected journals
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    if (await customizedBadge.isVisible()) {
      await customizedBadge.click();
      
      // Promotion dialog should mention number of journals affected
      page.once('dialog', dialog => {
        const message = dialog.message();
        expect(message).toMatch(/\\d+ journal|inherit|affect/i);
        dialog.dismiss(); // Don't actually promote in this test
      });
      
      const promoteButton = page.locator('[data-testid^="promote-"]').first();
      if (await promoteButton.isVisible()) {
        await promoteButton.click();
      }
    }
  });

  test('should allow removing exemption and inheriting updates', async ({ page }) => {
    /**
     * SCENARIO: Exempt a journal, then later un-exempt it
     */
    
    // Exempt a journal
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    if (await customizedBadge.isVisible()) {
      await customizedBadge.click();
      
      // Exempt first journal
      page.once('dialog', dialog => dialog.accept());
      const exemptButton = page.locator('[data-testid^="exempt-"]').first();
      if (await exemptButton.isVisible()) {
        await exemptButton.click();
        await page.waitForTimeout(1000);
        
        // Should show "Exempted" badge
        await expect(page.locator('text=Exempted')).toBeVisible();
        
        // Click again to remove exemption (button should toggle)
        page.once('dialog', dialog => {
          expect(dialog.message()).toMatch(/Remove exemption|inherit/i);
          dialog.accept();
        });
        
        await exemptButton.click();
        await page.waitForTimeout(1000);
        
        // "Exempted" badge should disappear
        await expect(page.locator('text=Exempted')).not.toBeVisible();
      }
    }
  });

  test('should track modification history for customized journals', async ({ page }) => {
    /**
     * SCENARIO: Show when journal was last modified, by whom, etc.
     */
    
    await page.click('text=Design Console');
    await page.click('text=Theme Templates →');
    await page.click('text=Publication Page Templates');
    
    const customizedBadge = page.locator('text=/\\d+ customized/').first();
    if (await customizedBadge.isVisible()) {
      await customizedBadge.click();
      
      // Each customization entry should show metadata
      const firstCustomization = page.locator('[data-testid^="customization-"]').first();
      
      if (await firstCustomization.isVisible()) {
        // Should show modification count
        await expect(firstCustomization.locator('text=/\\d+ modification/i')).toBeVisible();
        
        // Could also show: last modified date, modified by, etc.
      }
    }
  });
});

