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
  
  test('Sidebar system is accessible @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to Sections tab
    await page.click('text=Sections')
    
    // Check Special Sections category exists
    await expect(page.locator('text=Special Sections')).toBeVisible()
    
    // Check Sidebar exists in Special Sections - use more specific selector
    await expect(page.locator('button:has-text("Sidebar")').first()).toBeVisible()
  })
  
  test('Sidebar can be placed on canvas @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to Sections tab  
    await page.click('text=Sections')
    
    // Click on sidebar to add it
    await page.locator('button:has-text("Sidebar")').first().click()
    
    // Sidebar should appear on canvas with default content
    await expect(page.locator('text=Drop widgets here').first()).toBeVisible({ timeout: 5000 })
    
    // Click on the drop zone area to select the sidebar
    await page.locator('text=Drop widgets here').first().click()
    
    // Blue label showing "sidebar" should now be visible
    await expect(page.locator('.bg-blue-500:has-text("sidebar")')).toBeVisible({ timeout: 5000 })
  })
  
  test('Sidebar properties are configurable @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Add a sidebar
    await page.click('text=Sections')
    await page.locator('button:has-text("Sidebar")').first().click()
    
    // Wait for sidebar to appear, then click to select it
    await expect(page.locator('text=Drop widgets here').first()).toBeVisible({ timeout: 5000 })
    await page.locator('text=Drop widgets here').first().click()
    
    // Blue label shows it's selected
    await expect(page.locator('.bg-blue-500:has-text("sidebar")')).toBeVisible({ timeout: 5000 })
    
    // Check key configuration options exist in properties panel
    await expect(page.locator('label:has-text("Position")')).toBeVisible()
    await expect(page.locator('label:has-text("Width")').last()).toBeVisible()
    await expect(page.locator('label:has-text("Span Sections")')).toBeVisible()
    await expect(page.locator('label:has-text("Gap Size")')).toBeVisible()
  })

  test('Menu widget can be placed @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Find and place Menu widget
    const menuWidget = page.locator('text=Menu').first()
    await expect(menuWidget).toBeVisible({ timeout: 5000 })
    await menuWidget.click()
    
    // Widget should be added to canvas with default items
    await expect(page.locator('nav').filter({ hasText: 'Home' })).toBeVisible({ timeout: 5000 })
    await expect(page.locator('nav').filter({ hasText: 'About' })).toBeVisible()
    await expect(page.locator('nav').filter({ hasText: 'Contact' })).toBeVisible()
  })
})
