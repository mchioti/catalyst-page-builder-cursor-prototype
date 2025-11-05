# Testing Tabs Widget Drop

To test:
1. Open browser console
2. Drag a widget from library
3. Watch for console logs during drag
4. Check what "over" target is detected

Look for these logs:
- "🎯 Drag End Event:"
- Should show overType: 'tab-panel'
