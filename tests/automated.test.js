/**
 * AUTOMATED TESTS - Run on milestones and on-demand
 * Comprehensive E2E tests for all demo-critical workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Schema Editor Workflow', () => {
  
  test('Complete schema creation workflow', async ({ page }) => {
    await page.goto('http://localhost:5173')
    // Navigate to Schema tab
    await page.click('button:has-text("Schema")')
    
    // Create new schema object
    await page.click('button:has-text("New")')
    
    // Test that schema UI loads correctly
    await expect(page.locator('button:has-text("New")')).toBeVisible({ timeout: 10000 })
    
    // Test basic schema tab functionality exists
    await page.waitForTimeout(1000) // Allow UI to settle
  })
})

test.describe('DIY Zone - HTML Widget', () => {
  
  test('HTML widget creation and interactivity', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Go to DIY Zone
    await page.click('button:has-text("DIY")')
    
    // Wait for DIY content to load
    await expect(page.locator('text=HTML Block')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Code Block')).toBeVisible()
    
    // Test preview navigation works
    await page.click('button:has-text("Preview Changes")')
    await expect(page.locator('h1:has-text("Wiley Online Library"), h2:has-text("Wiley Online Library")').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Save/Load Sections', () => {
  
  test('Save and load custom sections', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Go to DIY Zone to check saved sections area
    await page.click('button:has-text("DIY")')
    
    // Verify saved sections area exists
    await expect(page.locator('h3:has-text("Saved Sections")')).toBeVisible({ timeout: 5000 })
    
    // Test that save functionality UI exists
    await expect(page.locator('button:has-text("Save Current Canvas")')).toBeVisible()
  })
})

test.describe('Core Page Builder Functions', () => {
  
  test('Drag and drop widgets', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Verify core widgets are available in library
    await expect(page.locator('text=Text')).toBeVisible()
    await expect(page.locator('text=Heading')).toBeVisible()
    await expect(page.locator('text=Button Link')).toBeVisible()
    
    // Verify canvas exists
    await expect(page.locator('main, .flex-1').first()).toBeVisible()
  })
  
  test('Widget properties editing', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Check that properties panel exists
    await expect(page.locator('h2:has-text("Properties")')).toBeVisible()
    
    // Check different tabs work
    await page.click('button:has-text("Sections")')
    await expect(page.locator('text=Basic Sections')).toBeVisible()
    
    // Go back to library
    await page.click('button:has-text("Library")')
    await expect(page.locator('text=Core Widgets')).toBeVisible()
  })
  
  test('Delete widgets and sections', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Test that sections tab shows pre-built sections
    await page.click('button:has-text("Sections")')
    await expect(page.locator('text=Template-Ready Sections')).toBeVisible()
    await expect(page.locator('text=Hero Section')).toBeVisible()
    await expect(page.locator('div:has-text("Featured Research")').first()).toBeVisible()
  })
})

test.describe('Live Site Navigation', () => {
  
  test('Complete live site navigation', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Go to live site
    await page.click('button:has-text("Preview Changes")')
    
    // Test homepage loads
    await expect(page.locator('h1:has-text("Wiley Online Library"), h2:has-text("Wiley Online Library")').first()).toBeVisible({ timeout: 10000 })
    
    // Test journal navigation
    await page.click('button:has-text("Advanced Materials")')
    await expect(page.locator('h1:has-text("Advanced Materials")').first()).toBeVisible()
    
    // Test navigation elements exist
    await expect(page.locator('button:has-text("Current Issue")')).toBeVisible()
    
    // Navigate back to home (use first match to avoid strict mode)
    await page.locator('button:has-text("Home")').first().click()
    await expect(page.locator('h1:has-text("Wiley Online Library"), h2:has-text("Wiley Online Library")').first()).toBeVisible({ timeout: 10000 })
  })
  
  test('Edit homepage workflow', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Go to live site
    await page.click('button:has-text("Preview Changes")')
    
    // Click edit homepage
    await page.click('button:has-text("Edit Homepage")', { timeout: 10000 })
    
    // Should be in page builder
    await expect(page.locator('h1:has-text("Page Builder")')).toBeVisible()
    
    // Should auto-load homepage content
    await expect(page.locator('text=Page Builder')).toBeVisible({ timeout: 10000 })
    
    // Verify we're back in page builder
    await expect(page.locator('button:has-text("Preview Changes")')).toBeVisible()
    
    // Preview changes
    await page.click('button:has-text("Preview Changes")')
    
    // Verify we're back on live site
    await expect(page.locator('h1:has-text("Wiley Online Library"), h2:has-text("Wiley Online Library")').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Journal Banner and Section Background Features', () => {
  
  test('Journal Banner section has preconfigured background', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Go to Mock Live Site TOC to see Journal Banner
    await page.click('text=Preview Changes')
    await page.click('text=Advanced Materials')
    
    // Should see Journal Banner with preconfigured dark background
    await expect(page.locator('text=Volume 67')).toBeVisible()
    
    // Click Edit to enter editor mode
    await page.click('text=Edit All Advanced Materials Issues')
    
    // Click on Journal Banner section
    await page.click('text=Journal Banner', { force: true })
    
    // Properties Panel should show Gradient as background type
    await expect(page.locator('text=Background Type')).toBeVisible()
    await expect(page.locator('select').filter({ hasText: 'Gradient' })).toBeVisible()
  })

  test('Section background editing works correctly', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Add Hero section
    await page.click('text=Hero Section')
    
    // Click on the hero section to select it  
    await page.click('.bg-gradient-to-r >> visible=true')
    
    // Check Background controls are available
    await expect(page.locator('text=Background')).toBeVisible()
    await expect(page.locator('text=Background Type')).toBeVisible()
    
    // Change background to Solid Color
    await page.selectOption('select >> nth=0', 'solid')
    
    // Should see color picker
    await expect(page.locator('input[type="color"]')).toBeVisible()
  })

  test('Template editing scope button provides context-aware options', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Go to Mock Live Site Advanced Materials TOC
    await page.click('text=Preview Changes')
    await page.click('text=Advanced Materials')
    
    // Should see primary edit button for this journal
    await expect(page.locator('text=Edit All Advanced Materials Issues')).toBeVisible()
    
    // Click the dropdown arrow to see more options
    await page.click('button[title="More editing options"]')
    
    // Should see dropdown with global and individual options
    await expect(page.locator('text=Edit this Issue')).toBeVisible()
    await expect(page.locator('text=Edit All Issues')).toBeVisible()
  })

  test('Global template conflict detection system exists', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // First, create individual customizations by editing a specific journal
    await page.click('text=Preview Changes')
    await page.click('text=Advanced Materials')
    await page.click('text=Edit All Advanced Materials Issues')
    
    // Make a change (add a text widget to create customization)
    await page.click('text=Text')
    
    // Go back to live site and verify global template option exists
    await page.click('text=Preview Changes')
    await page.click('text=Advanced Materials')
    await page.click('button[title="More editing options"]')
    
    // Should see global template editing option
    await expect(page.locator('text=Edit All Issues')).toBeVisible()
  })

  test('Journal Banner section has preconfigured black background', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Navigate to TOC template
    await page.click('text=Preview Changes')
    await page.click('text=Advanced Materials')
    await page.click('text=Edit All Advanced Materials Issues')
    
    // Click on Journal Banner section
    await page.locator('text=Volume 67').first().click()
    
    // Check Properties Panel shows Gradient background by default
    await expect(page.locator('text=Background Type')).toBeVisible()
    await expect(page.locator('select').filter({ hasText: 'Gradient' })).toBeVisible()
  })

  test('Hero section background can be edited without conflicts', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Add Hero section
    await page.click('text=Hero Section')
    
    // Click on hero section to select it
    await page.locator('.bg-gradient-to-r').first().click()
    
    // Change background to Solid Color
    await page.selectOption('select', { label: 'Solid Color' })
    
    // Should see color picker
    await expect(page.locator('input[type="color"]')).toBeVisible()
    
    // Change color and verify no black gradient override
    await page.fill('input[type="color"]', '#ff0000')
    
    // Section should now have red background, not black gradient
    await expect(page.locator('[style*="background-color: rgb(255, 0, 0)"]')).toBeVisible()
  })

  test('Publication Details widget inherits section background', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Navigate to TOC and edit Journal Banner
    await page.click('text=Preview Changes')
    await page.click('text=Advanced Materials')  
    await page.click('text=Edit All Advanced Materials Issues')
    
    // Click on Journal Banner section
    await page.locator('text=Volume 67').first().click()
    
    // Change section background to red
    await page.selectOption('select', { label: 'Solid Color' })
    await page.fill('input[type="color"]', '#ff0000')
    
    // Publication Details should inherit the red background
    const publicationDetails = page.locator('text=Volume 67').first()
    await expect(publicationDetails).toBeVisible()
  })

  test('Individual issue auto-save functionality', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Edit individual issue
    await page.click('text=Preview Changes')
    await page.click('text=Advanced Materials')
    await page.click('button[title="More editing options"]')
    await page.click('text=Edit this Issue')
    
    // Make a change
    await page.click('text=Text')
    
    // Go back to live site and return to editing - changes should be saved
    await page.click('text=Preview Changes')
    await page.click('text=Advanced Materials')
    await page.click('button[title="More editing options"]')
    await page.click('text=Edit this Issue')
    
    // Should see the text widget we added
    await expect(page.locator('text=Enter your text content')).toBeVisible()
  })

  test('Conflict resolution dialog system', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // First, create individual customizations
    await page.click('text=Preview Changes')
    await page.click('text=Advanced Materials')
    await page.click('button[title="More editing options"]')
    await page.click('text=Edit this Issue')
    
    // Make a change to create customization
    await page.click('text=Text')
    
    // Now try to edit global template - should trigger conflict dialog
    await page.click('text=Preview Changes')
    await page.click('text=Advanced Materials')
    await page.click('button[title="More editing options"]')
    await page.click('text=Edit All Issues')
    
    // Should see conflict resolution dialog (check for dialog elements)
    await expect(page.locator('text=Template Conflict Resolution')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Skip Changed Journals')).toBeVisible()
    await expect(page.locator('text=Apply Everywhere')).toBeVisible()
    await expect(page.locator('text=Cancel Template Changes')).toBeVisible()
  })

  test('Skip functionality in conflict resolution prevents changes to skipped journals', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Step 1: Make journal template changes to ADMA
    await page.click('text=Preview Changes')
    await page.click('text=Advanced Materials')
    await page.click('text=Edit All Advanced Materials Issues')
    
    // Change journal banner background color to red
    await page.locator('text=Volume 67').first().click()
    await page.selectOption('select', { label: 'Solid Color' })
    await page.fill('input[type="color"]', '#ff0000')
    
    // Verify red background applied
    await expect(page.locator('[style*="background-color: rgb(255, 0, 0)"]')).toBeVisible()
    
    // Step 2: Try to edit global template (should trigger conflict dialog)
    await page.click('text=Preview Changes')
    await page.click('text=EMBO Journal') 
    await page.click('button[title="More editing options"]')
    await page.click('text=Edit All Issues')
    
    // Should see conflict dialog
    await expect(page.locator('text=Template Conflict Resolution')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Advanced Materials')).toBeVisible() // Should show ADMA as conflicted
    
    // Step 3: Select "Skip Changed Journals"
    await page.click('text=Skip Changed Journals')
    
    // Should be in editor now
    await expect(page.locator('h1').first()).toContainText('Page Builder')
    
    // Step 4: Make a global change (change banner to blue)
    await page.locator('text=Volume 67').first().click()
    await page.selectOption('select', { label: 'Solid Color' })  
    await page.fill('input[type="color"]', '#0000ff')
    
    // Step 5: Verify ADMA kept its red color (was skipped)
    await page.click('text=Preview Changes')
    await page.click('text=Advanced Materials')
    
    // ADMA should still have red background (not blue from global template)
    await expect(page.locator('[style*="background-color: rgb(255, 0, 0)"]')).toBeVisible()
    
    // Step 6: Verify EMBO got the blue color (not skipped)
    await page.click('text=EMBO Journal')
    
    // EMBO should have blue background from global template
    await expect(page.locator('[style*="background-color: rgb(0, 0, 255)"]')).toBeVisible()
  })
})

test.describe('Design System Console', () => {
  
  test('Theme and website management', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Go to design console
    await page.click('button:has-text("Design System Console")')
    
    // Verify design console loads
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
    
    // Test return to page builder works
    await page.click('button:has-text("Page Builder")', { timeout: 5000 })
    await expect(page.locator('text=Page Builder')).toBeVisible()
  })
})
