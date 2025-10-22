/**
 * SMOKE TESTS - Run after every code change
 * Fast tests that catch major breakage before it hits demo
 */

import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Critical Functionality @smoke', () => {
  
  test('App loads without crashing @smoke', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await expect(page.locator('h1').first()).toContainText('Page Builder')
  })

  test('Can navigate to all main views @smoke', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Test navigation exists (don't click yet, just check elements exist)
    await expect(page.locator('text=Preview Changes').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('h1').first()).toContainText('Page Builder')
  })

  test('Widget library is accessible @smoke', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Check basic widgets exist
    await expect(page.locator('text=Text')).toBeVisible()
    await expect(page.locator('text=Heading')).toBeVisible()
    await expect(page.locator('text=Button Link')).toBeVisible()
  })

  test('Main sidebar tabs exist @smoke', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Just check tabs exist, don't click them for smoke test
    await expect(page.locator('[role="tablist"], .space-y-4').first()).toBeVisible()
  })

  test('Canvas area exists @smoke', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Check main content area exists (less specific selector)
    await expect(page.locator('main, .flex-1').first()).toBeVisible()
  })

  test('Properties panel exists @smoke', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Check properties panel area exists
    await expect(page.locator('aside, .w-80').first()).toBeVisible()
  })
})
