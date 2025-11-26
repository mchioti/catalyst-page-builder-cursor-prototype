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

/**
 * Helper: Drag a canvas widget using its drag handle (required for dnd-kit)
 * Canvas widgets must be hovered to show the toolbar, then dragged from the grip handle
 */
async function dragCanvasWidget(page, widget, targetX, targetY) {
  // Hover over widget to show toolbar
  await widget.hover()
  await page.waitForTimeout(300)
  
  // Click to ensure selection and toolbar visibility
  await widget.click()
  await page.waitForTimeout(300)
  
  // Find the drag handle - it should be visible in the widget's toolbar
  const dragHandle = page.locator('[title="Drag to reorder or move widget"]').first()
  await expect(dragHandle).toBeVisible({ timeout: 3000 })
  
  // Get handle position
  const handleBox = await dragHandle.boundingBox()
  if (!handleBox) {
    throw new Error('Could not get drag handle bounding box')
  }
  
  // Perform drag with proper dnd-kit activation
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(handleBox.x + 10, handleBox.y, { steps: 5 }) // Activate drag
  await page.waitForTimeout(50)
  await page.mouse.move(targetX, targetY, { steps: 10 })
  await page.waitForTimeout(50)
  await page.mouse.up()
  await page.waitForTimeout(300)
}

test.describe('Drag & Drop - Comprehensive Coverage', () => {
  
  // =============================================================================
  // TEST GROUP 1: Library Widget → Section Drops
  // =============================================================================
  
  test.skip('Can drag widget from library to empty canvas (creates section) - needs canvas selector fix', async ({ page }) => {
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

  test.skip('Can drag widget from library into existing section area - needs canvas selector fix', async ({ page }) => {
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

  test.skip('Can click widget in library to auto-create section - needs canvas selector fix', async ({ page }) => {
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
    
    // Drag heading to top (above text) using drag handle
    await dragCanvasWidget(page, headingWidget, textBoxBefore.x + textBoxBefore.width / 2, textBoxBefore.y - 20)
    
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
    
    // Drag button to middle (between text and heading) using drag handle
    await dragCanvasWidget(page, buttonWidget, headingBox.x + headingBox.width / 2, headingBox.y - 20)
    
    // Verify new order: Button is now between Text and Heading
    const buttonBoxAfter = await buttonWidget.boundingBox()
    const headingBoxAfter = await headingWidget.boundingBox()
    expect(buttonBoxAfter.y).toBeLessThan(headingBoxAfter.y)
  })

  // =============================================================================
  // TEST GROUP 3: Cross-Area Widget Moves (Multi-Column Sections)
  // =============================================================================

  test.skip('Can move widget between columns in two-column section', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Navigate to Sections tab and add a two-column section
    await page.click('text=Sections')
    await page.waitForTimeout(300)
    await page.locator('button:has-text("Two Columns")').first().click()
    await page.waitForTimeout(500)
    
    // Switch back to Widgets tab
    await page.click('button:has-text("Library")')
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
    
    // Drag widget from left to right column using drag handle
    const textWidget = leftArea.locator('[data-widget-type="text"]').first()
    const rightBox = await rightArea.boundingBox()
    await dragCanvasWidget(page, textWidget, rightBox.x + rightBox.width / 2, rightBox.y + 50)
    
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
    
    // Find sections by their content (order may vary)
    const textSection = page.locator('[data-section-id]:has([data-widget-type="text"])')
    const headingSection = page.locator('[data-section-id]:has([data-widget-type="heading"])')
    
    // Verify initial state
    await expect(textSection.locator('[data-widget-type="text"]')).toBeVisible()
    await expect(headingSection.locator('[data-widget-type="heading"]')).toBeVisible()
    
    // Drag heading from its section to the text section using drag handle
    const headingWidget = headingSection.locator('[data-widget-type="heading"]').first()
    const targetArea = textSection.locator('[data-droppable-area]').first()
    const targetBox = await targetArea.boundingBox()
    await dragCanvasWidget(page, headingWidget, targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2)
    
    // Verify both widgets are now in the text section
    await expect(textSection.locator('[data-widget-type="text"]')).toBeVisible()
    await expect(textSection.locator('[data-widget-type="heading"]')).toBeVisible()
  })

  test.skip('Can move Publication List widget between sections (regression test) - needs Publishing Widgets category expansion', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Add a text section first
    await page.getByTestId('library-widget-text').click()
    await page.waitForTimeout(300)
    
    // Expand Publishing Widgets category and add Publication List
    await page.click('button:has-text("Publishing Widgets")')
    await page.waitForTimeout(200)
    const pubListWidget = page.getByTestId('library-widget-publication-list')
    await pubListWidget.click()
    await page.waitForTimeout(500)
    
    // Find sections by content
    const textSection = page.locator('[data-section-id]:has([data-widget-type="text"])')
    const pubListSection = page.locator('[data-section-id]:has([data-widget-type="publication-list"])')
    
    // Verify initial state
    await expect(pubListSection.locator('[data-widget-type="publication-list"]')).toBeVisible()
    
    // Drag Publication List to text section using drag handle
    const pubListInCanvas = pubListSection.locator('[data-widget-type="publication-list"]').first()
    const targetArea = textSection.locator('[data-droppable-area]').first()
    const targetBox = await targetArea.boundingBox()
    await dragCanvasWidget(page, pubListInCanvas, targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2)
    
    // Verify Publication List is now in text section
    await expect(textSection.locator('[data-widget-type="publication-list"]')).toBeVisible()
  })

  // =============================================================================
  // TEST GROUP 5: Edge Cases
  // =============================================================================

  test.skip('Can add multiple widgets in sequence without interference - needs canvas selector fix', async ({ page }) => {
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

  test.skip('Can drag widget into empty area of multi-area section', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Add a three-column section
    await page.click('text=Sections')
    await page.waitForTimeout(300)
    await page.locator('button:has-text("Three Columns")').first().click()
    await page.waitForTimeout(500)
    
    // Switch back to Widgets
    await page.click('button:has-text("Library")')
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
    
    // Click widget to show toolbar, then find drag handle
    await textWidget.click()
    await page.waitForTimeout(200)
    
    const section = page.locator('[data-section-id]').filter({ has: textWidget })
    const dragHandle = section.locator('[title="Drag to reorder or move widget"]').first()
    const handleBox = await dragHandle.boundingBox()
    
    // Start dragging from drag handle
    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(handleBox.x + 20, handleBox.y + 100, { steps: 5 })
    await page.waitForTimeout(200)
    
    // Widget should have visibility hidden during drag (DragOverlay shows it instead)
    const visibility = await textWidget.evaluate(el => window.getComputedStyle(el).visibility)
    expect(visibility).toBe('hidden')
    
    // End drag
    await page.mouse.up()
    await page.waitForTimeout(200)
    
    // Visibility should be restored after drag
    const visibilityAfter = await textWidget.evaluate(el => window.getComputedStyle(el).visibility)
    expect(visibilityAfter).toBe('visible')
  })

  // =============================================================================
  // TEST GROUP 6: Integration with Prefab Sections
  // =============================================================================

  test.skip('Can add widgets to prefab Hero section', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Back to Page Builder') // Navigate from Design Console
    
    // Navigate to Sections and add Hero section
    await page.click('text=Sections')
    await page.waitForTimeout(300)
    await page.locator('button:has-text("Hero Section")').first().click()
    await page.waitForTimeout(500)
    
    // Switch back to Widgets
    await page.click('button:has-text("Library")')
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

