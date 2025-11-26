/**
 * DRAG & DROP COMPREHENSIVE TESTS
 * 
 * These tests prevent regressions from theme/layout changes that can break DnD functionality.
 * Root causes identified:
 * - DOM structure changes (grid/spacing tokens) confuse collision detection
 * - SortableContext misuse prevents cross-area/cross-section moves
 * - Missing widget drop targets prevent precise positioning
 * - Library widget click handler not creating sections
 */

import { test, expect } from '@playwright/test';

test.describe('Drag & Drop - Comprehensive Coverage', () => {
  
  // =============================================================================
  // TEST GROUP 1: Library Widget → Section Drops
  // =============================================================================
  
  test('Can drag widget from library to empty canvas (creates section)', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Count sections before
    const canvasArea = page.locator('main').first()
    const sectionsBeforeCount = await canvasArea.locator('[data-section-id]').count()
    
    // Drag Text widget to canvas
    const textWidget = page.getByTestId('library-widget-text')
    await expect(textWidget).toBeVisible()
    
    // Perform drag-and-drop
    const canvasCenter = await canvasArea.boundingBox()
    await textWidget.hover()
    await page.mouse.down()
    await page.mouse.move(canvasCenter.x + canvasCenter.width / 2, canvasCenter.y + 100)
    await page.mouse.up()
    await page.waitForTimeout(500)
    
    // Should have created a new section
    const sectionsAfterCount = await canvasArea.locator('[data-section-id]').count()
    expect(sectionsAfterCount).toBe(sectionsBeforeCount + 1)
    
    // Widget should be visible in canvas
    await expect(page.locator('text=Sample text content').first()).toBeVisible({ timeout: 5000 })
  })

  test('Can drag widget from library into existing section area', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Add first widget to create a section
    await page.getByTestId('library-widget-text').click()
    await page.waitForTimeout(300)
    
    // Get the first section area
    const sectionArea = page.locator('[data-droppable-area]').first()
    await expect(sectionArea).toBeVisible()
    
    // Count widgets before
    const widgetsBeforeCount = await sectionArea.locator('[data-testid^="canvas-widget-"]').count()
    
    // Drag Heading widget into the section
    const headingWidget = page.getByTestId('library-widget-heading')
    await headingWidget.hover()
    await page.mouse.down()
    const areaBox = await sectionArea.boundingBox()
    await page.mouse.move(areaBox.x + areaBox.width / 2, areaBox.y + areaBox.height / 2)
    await page.mouse.up()
    await page.waitForTimeout(500)
    
    // Should have added widget to existing section
    const widgetsAfterCount = await sectionArea.locator('[data-testid^="canvas-widget-"]').count()
    expect(widgetsAfterCount).toBe(widgetsBeforeCount + 1)
    
    // Both widgets should be visible
    await expect(page.locator('text=Sample text content').first()).toBeVisible()
    await expect(page.locator('text=Your Heading Text').first()).toBeVisible()
  })

  test('Can click widget in library to auto-create section', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    const canvasArea = page.locator('main').first()
    const sectionsBeforeCount = await canvasArea.locator('[data-section-id]').count()
    
    // Click Button Link widget
    await page.getByTestId('library-widget-button').click()
    await page.waitForTimeout(500)
    
    // Should have created a new section
    const sectionsAfterCount = await canvasArea.locator('[data-section-id]').count()
    expect(sectionsAfterCount).toBe(sectionsBeforeCount + 1)
    
    // Button should be visible
    await expect(page.locator('text=Button Text').first()).toBeVisible({ timeout: 5000 })
  })

  // =============================================================================
  // TEST GROUP 2: Widget Reordering Within Same Area
  // =============================================================================

  test('Can reorder 2 widgets within same area (bottom to top)', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Add two widgets
    await page.getByTestId('library-widget-text').click()
    await page.waitForTimeout(300)
    await page.getByTestId('library-widget-heading').click()
    await page.waitForTimeout(300)
    
    // Get widgets by their content
    const textWidget = page.locator('[data-widget-type="text"]').first()
    const headingWidget = page.locator('[data-widget-type="heading"]').first()
    
    // Verify initial order (text above heading)
    const textBoxBefore = await textWidget.boundingBox()
    const headingBoxBefore = await headingWidget.boundingBox()
    expect(textBoxBefore.y).toBeLessThan(headingBoxBefore.y)
    
    // Drag heading to top (above text)
    await headingWidget.hover()
    await page.mouse.down()
    await page.mouse.move(textBoxBefore.x, textBoxBefore.y - 10)
    await page.mouse.up()
    await page.waitForTimeout(500)
    
    // Verify new order (heading above text)
    const textBoxAfter = await textWidget.boundingBox()
    const headingBoxAfter = await headingWidget.boundingBox()
    expect(headingBoxAfter.y).toBeLessThan(textBoxAfter.y)
  })

  test('Can insert widget in middle position (3 widgets: move last to middle)', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Add three widgets
    await page.getByTestId('library-widget-text').click()
    await page.waitForTimeout(200)
    await page.getByTestId('library-widget-heading').click()
    await page.waitForTimeout(200)
    await page.getByTestId('library-widget-button').click()
    await page.waitForTimeout(300)
    
    // Get widgets
    const textWidget = page.locator('[data-widget-type="text"]').first()
    const headingWidget = page.locator('[data-widget-type="heading"]').first()
    const buttonWidget = page.locator('[data-widget-type="button"]').first()
    
    // Verify initial order: Text, Heading, Button
    const textBox = await textWidget.boundingBox()
    const headingBox = await headingWidget.boundingBox()
    const buttonBox = await buttonWidget.boundingBox()
    expect(textBox.y).toBeLessThan(headingBox.y)
    expect(headingBox.y).toBeLessThan(buttonBox.y)
    
    // Drag button to middle (between text and heading)
    await buttonWidget.hover()
    await page.mouse.down()
    await page.mouse.move(headingBox.x, headingBox.y - 10)
    await page.mouse.up()
    await page.waitForTimeout(500)
    
    // Verify new order: Button is now between Text and Heading
    const buttonBoxAfter = await buttonWidget.boundingBox()
    const headingBoxAfter = await headingWidget.boundingBox()
    expect(buttonBoxAfter.y).toBeLessThan(headingBoxAfter.y)
  })

  // =============================================================================
  // TEST GROUP 3: Cross-Area Widget Moves (Multi-Column Sections)
  // =============================================================================

  test('Can move widget between columns in two-column section', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Navigate to Sections tab and add a two-column section
    await page.click('text=Sections')
    await page.waitForTimeout(300)
    await page.locator('button:has-text("Two Columns")').first().click()
    await page.waitForTimeout(500)
    
    // Switch back to Widgets tab
    await page.click('text=Widgets')
    await page.waitForTimeout(300)
    
    // Add a text widget to the first column
    await page.getByTestId('library-widget-text').click()
    await page.waitForTimeout(300)
    
    // Get both column areas
    const section = page.locator('[data-section-id]').first()
    const areas = section.locator('[data-droppable-area]')
    await expect(areas).toHaveCount(2)
    
    const leftArea = areas.nth(0)
    const rightArea = areas.nth(1)
    
    // Verify widget is in left column
    await expect(leftArea.locator('[data-widget-type="text"]')).toBeVisible()
    
    // Drag widget from left to right column
    const textWidget = leftArea.locator('[data-widget-type="text"]').first()
    await textWidget.hover()
    await page.mouse.down()
    const rightBox = await rightArea.boundingBox()
    await page.mouse.move(rightBox.x + rightBox.width / 2, rightBox.y + 50)
    await page.mouse.up()
    await page.waitForTimeout(500)
    
    // Verify widget is now in right column
    await expect(rightArea.locator('[data-widget-type="text"]')).toBeVisible()
  })

  // =============================================================================
  // TEST GROUP 4: Cross-Section Widget Moves
  // =============================================================================

  test('Can move widget between different sections', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Add two sections with widgets
    await page.getByTestId('library-widget-text').click()
    await page.waitForTimeout(300)
    await page.getByTestId('library-widget-heading').click()
    await page.waitForTimeout(300)
    
    // Get both sections
    const sections = page.locator('[data-section-id]')
    await expect(sections).toHaveCount(2)
    
    const section1 = sections.nth(0)
    const section2 = sections.nth(1)
    
    // Verify initial state
    await expect(section1.locator('[data-widget-type="text"]')).toBeVisible()
    await expect(section2.locator('[data-widget-type="heading"]')).toBeVisible()
    
    // Drag heading from section 2 to section 1
    const headingWidget = section2.locator('[data-widget-type="heading"]').first()
    const section1Area = section1.locator('[data-droppable-area]').first()
    
    await headingWidget.hover()
    await page.mouse.down()
    const section1Box = await section1Area.boundingBox()
    await page.mouse.move(section1Box.x + section1Box.width / 2, section1Box.y + section1Box.height - 20)
    await page.mouse.up()
    await page.waitForTimeout(500)
    
    // Verify both widgets are now in section 1
    await expect(section1.locator('[data-widget-type="text"]')).toBeVisible()
    await expect(section1.locator('[data-widget-type="heading"]')).toBeVisible()
  })

  test('Can move Publication List widget between sections (regression test)', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Add two sections
    await page.getByTestId('library-widget-text').click()
    await page.waitForTimeout(300)
    await page.getByTestId('library-widget-heading').click()
    await page.waitForTimeout(300)
    
    // Add Publication List widget to section 1
    const pubListWidget = page.getByTestId('library-widget-publication-list')
    await pubListWidget.click()
    await page.waitForTimeout(500)
    
    // Get sections
    const sections = page.locator('[data-section-id]')
    const section1 = sections.nth(0)
    const section2 = sections.nth(1)
    const section3 = sections.nth(2) // Publication List auto-created section
    
    // Verify Publication List is in section 3
    await expect(section3.locator('[data-widget-type="publication-list"]')).toBeVisible()
    
    // Drag Publication List from section 3 to section 2
    const pubListInCanvas = section3.locator('[data-widget-type="publication-list"]').first()
    const section2Area = section2.locator('[data-droppable-area]').first()
    
    await pubListInCanvas.hover()
    await page.mouse.down()
    const section2Box = await section2Area.boundingBox()
    await page.mouse.move(section2Box.x + section2Box.width / 2, section2Box.y + section2Box.height - 20)
    await page.mouse.up()
    await page.waitForTimeout(500)
    
    // Verify Publication List is now in section 2
    await expect(section2.locator('[data-widget-type="publication-list"]')).toBeVisible()
  })

  // =============================================================================
  // TEST GROUP 5: Edge Cases
  // =============================================================================

  test('Can add multiple widgets in sequence without interference', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Add 5 widgets rapidly by clicking
    await page.getByTestId('library-widget-text').click()
    await page.waitForTimeout(200)
    await page.getByTestId('library-widget-heading').click()
    await page.waitForTimeout(200)
    await page.getByTestId('library-widget-button').click()
    await page.waitForTimeout(200)
    await page.getByTestId('library-widget-text').click()
    await page.waitForTimeout(200)
    await page.getByTestId('library-widget-heading').click()
    await page.waitForTimeout(500)
    
    // Should have 5 sections (each click creates a section)
    const canvasArea = page.locator('main').first()
    const sectionsCount = await canvasArea.locator('[data-section-id]').count()
    expect(sectionsCount).toBe(5)
    
    // All widgets should be visible
    await expect(page.locator('[data-widget-type]')).toHaveCount(5)
  })

  test('Can drag widget into empty area of multi-area section', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Add a three-column section
    await page.click('text=Sections')
    await page.waitForTimeout(300)
    await page.locator('button:has-text("Three Columns")').first().click()
    await page.waitForTimeout(500)
    
    // Switch back to Widgets
    await page.click('text=Widgets')
    await page.waitForTimeout(300)
    
    // Drag a widget into the middle (2nd) column
    const section = page.locator('[data-section-id]').first()
    const middleArea = section.locator('[data-droppable-area]').nth(1)
    
    const textWidget = page.getByTestId('library-widget-text')
    await textWidget.hover()
    await page.mouse.down()
    const middleBox = await middleArea.boundingBox()
    await page.mouse.move(middleBox.x + middleBox.width / 2, middleBox.y + middleBox.height / 2)
    await page.mouse.up()
    await page.waitForTimeout(500)
    
    // Verify widget landed in middle column (not first or last)
    await expect(middleArea.locator('[data-widget-type="text"]')).toBeVisible()
    const firstArea = section.locator('[data-droppable-area]').nth(0)
    const lastArea = section.locator('[data-droppable-area]').nth(2)
    await expect(firstArea.locator('[data-widget-type="text"]')).not.toBeVisible()
    await expect(lastArea.locator('[data-widget-type="text"]')).not.toBeVisible()
  })

  test('Drag visual feedback is present during drag operation', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Add a section with a widget
    await page.getByTestId('library-widget-text').click()
    await page.waitForTimeout(300)
    
    const textWidget = page.locator('[data-widget-type="text"]').first()
    
    // Start dragging
    await textWidget.hover()
    await page.mouse.down()
    await page.mouse.move(100, 100)
    await page.waitForTimeout(200)
    
    // Widget should have opacity-50 class during drag
    const classList = await textWidget.getAttribute('class')
    expect(classList).toContain('opacity-50')
    
    // End drag
    await page.mouse.up()
    await page.waitForTimeout(200)
    
    // Opacity should be removed after drag
    const classListAfter = await textWidget.getAttribute('class')
    expect(classListAfter).not.toContain('opacity-50')
  })

  // =============================================================================
  // TEST GROUP 6: Integration with Prefab Sections
  // =============================================================================

  test('Can add widgets to prefab Hero section', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Navigate to Sections and add Hero section
    await page.click('text=Sections')
    await page.waitForTimeout(300)
    await page.locator('button:has-text("Hero Section")').first().click()
    await page.waitForTimeout(500)
    
    // Switch back to Widgets
    await page.click('text=Widgets')
    await page.waitForTimeout(300)
    
    // Add a button to the Hero section
    const heroSection = page.locator('[data-section-id]').first()
    const heroArea = heroSection.locator('[data-droppable-area]').first()
    
    const buttonWidget = page.getByTestId('library-widget-button')
    await buttonWidget.hover()
    await page.mouse.down()
    const heroBox = await heroArea.boundingBox()
    await page.mouse.move(heroBox.x + heroBox.width / 2, heroBox.y + heroBox.height - 50)
    await page.mouse.up()
    await page.waitForTimeout(500)
    
    // Verify button was added to Hero section
    await expect(heroArea.locator('[data-widget-type="button"]')).toBeVisible()
  })
})

