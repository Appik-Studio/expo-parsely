import { createContext, useContext } from 'react'

// ANSI color codes for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  pink: '\x1b[95m',
  purple: '\x1b[35m',
  orange: '\x1b[38;5;208m'
} as const

type ColorKey = keyof typeof COLORS

// All logs use the same purple color for consistency

export interface DebugLoggerConfig {
  enableDebugLogging: boolean
}

export const DebugLoggerContext = createContext<DebugLoggerConfig>({
  enableDebugLogging: __DEV__
})

const formatMessage = (prefix: string, message: string, color?: ColorKey): string => {
  const fullMessage = `${prefix} ${message}`
  if (color && COLORS[color]) {
    return `${COLORS[color]}${fullMessage}${COLORS.reset}`
  }
  return fullMessage
}

// Helper to create logger method with consistent behavior
const createLogMethod =
  (consoleMethod: (...args: any[]) => void) =>
  (enableDebugLogging: boolean) =>
  (prefix: string, message: string, data?: any, color?: ColorKey) => {
    if (enableDebugLogging) {
      const coloredMessage = formatMessage(prefix, message, color || 'purple')
      consoleMethod(coloredMessage, data || '')
    }
  }

// Shared implementation for all logger methods
const createLoggerMethods = (enableDebugLogging: boolean) => ({
  log: createLogMethod(console.log)(enableDebugLogging),
  error: createLogMethod(console.error)(enableDebugLogging),
  warn: createLogMethod(console.warn)(enableDebugLogging),
  info: createLogMethod(console.info)(enableDebugLogging),
  success: createLogMethod(console.log)(enableDebugLogging),
  debug: createLogMethod(console.debug)(enableDebugLogging)
})

export const useDebugLogger = () => {
  const { enableDebugLogging } = useContext(DebugLoggerContext)
  return createLoggerMethods(enableDebugLogging)
}

export const createDebugLogger = (enableDebugLogging: boolean) =>
  createLoggerMethods(enableDebugLogging)

// Export color constants for custom usage
export { COLORS }
export type { ColorKey }

/*
 * USAGE EXAMPLES:
 *
 * // React Hook (uses context for enableDebugLogging)
 * const debugLogger = useDebugLogger()
 * debugLogger.log('MyComponent', 'User clicked button')
 * debugLogger.success('MyComponent', 'Data saved successfully')
 *
 * // Factory Function (explicit enableDebugLogging parameter)
 * const logger = createDebugLogger(true)
 * logger.error('MyComponent', 'Failed to load data', error)
 * logger.warn('MyComponent', 'Warning message')
 *
 * // Both provide the same methods with purple color by default
 * debugLogger.info('MyComponent', 'Info message')
 * debugLogger.debug('MyComponent', 'Debug message')
 *
 * // Custom colors still available if needed
 * debugLogger.log('MyComponent', 'Custom message', data, 'brightMagenta')
 *
 * // Available colors:
 * - brightRed, brightGreen, brightYellow, brightBlue, brightMagenta, brightCyan
 * - red, green, yellow, blue, magenta, cyan, white, gray
 * - pink, purple, orange
 */
