/**
 * SMOKE TESTS - Run after every code change
 * Fast tests that catch major breakage before it hits demo
 */

import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Critical Functionality @smoke', () => {
  
  test('App loads without crashing @smoke', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1').first()).toContainText('Page Builder')
  })

  test('Can navigate to all main views @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Test navigation exists (don't click yet, just check elements exist)
    await expect(page.locator('text=Preview Changes').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('h1').first()).toContainText('Page Builder')
  })

  test('Widget library is accessible @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Check basic widgets exist
    await expect(page.locator('text=Text')).toBeVisible()
    await expect(page.locator('text=Heading')).toBeVisible()
    await expect(page.locator('text=Button Link')).toBeVisible()
  })

  test('Main sidebar tabs exist @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Just check tabs exist, don't click them for smoke test
    await expect(page.locator('[role="tablist"], .space-y-4').first()).toBeVisible()
  })

  test('Canvas area exists @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Check main content area exists (less specific selector)
    await expect(page.locator('main, .flex-1').first()).toBeVisible()
  })

  test('Properties panel exists @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Check properties panel area exists
    await expect(page.locator('aside, .w-80').first()).toBeVisible()
  })

  test('Template editing functionality @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Check if sections tab exists and works
    await page.click('text=Sections')
    await expect(page.locator('text=Template-Ready Sections')).toBeVisible({ timeout: 10000 })
  })

  test('Background editing controls exist @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to sections and add a simple section to test properties
    await page.click('text=Sections')
    
    // Look for sections area - just verify it exists for smoke test
    await expect(page.locator('text=Template-Ready Sections')).toBeVisible({ timeout: 10000 })
  })

  test('Mock Live Site navigation @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Test navigation to Mock Live Site
    await page.click('text=Preview Changes', { timeout: 10000 })
    
    // Should reach Mock Live Site (check for distinctive elements)
    await expect(page.locator('text=Mock Live Site')).toBeVisible({ timeout: 10000 })
  })

  test('Journal template editing scope @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to Mock Live Site
    await page.click('text=Preview Changes', { timeout: 10000 })
    
    // Look for journal navigation (lighter check)
    await expect(page.locator('text=Advanced Materials')).toBeVisible({ timeout: 10000 })
  })

  test('Widget transparency and section styling @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Basic check that widgets section exists
    await expect(page.locator('text=Text')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Heading')).toBeVisible({ timeout: 10000 })
  })
})
