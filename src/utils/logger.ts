/**
 * Debug Logger Utility
 * Centralized logging function for the entire application
 * 
 * Each file should have its own DEBUG flag to control logging independently
 * Errors are always logged regardless of the debug flag
 * 
 * Usage in any file:
 * ```
 * import { createDebugLogger } from '../../utils/logger'
 * const DEBUG = false  // Control logging for this file
 * const debugLog = createDebugLogger(DEBUG)
 * 
 * debugLog('log', 'Debug message')
 * debugLog('error', 'Error always shows')
 * ```
 */

/**
 * Creates a debug logger bound to a specific debug flag
 * @param debugEnabled - Boolean flag to enable/disable logs for this logger instance
 * @returns Debug logger function
 */
export const createDebugLogger = (debugEnabled: boolean) => {
  return (level: 'log' | 'warn' | 'error', ...args: any[]) => {
    if (debugEnabled || level === 'error') {
      console[level](...args)
    }
  }
}

