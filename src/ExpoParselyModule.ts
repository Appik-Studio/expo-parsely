import { NativeModule, requireNativeModule } from 'expo-modules-core'

import type { CommonParameters, PageViewOptions } from './ExpoParsely.types'
import { getConsentGiven as _getConsentGiven, setConsentGiven as _setConsentGiven } from './utils/consentState'
import { heartbeatManager } from './utils/HeartbeatManager'

declare class ExpoParselyModule extends NativeModule {
  // Configuration
  init(siteId: string): Promise<void>

  // Page view tracking - single method like iOS SDK
  trackPageView(options: PageViewOptions): Promise<void>
}

const NativeExpoParsely = requireNativeModule<ExpoParselyModule>('ExpoParsely')

// In-memory storage for common parameters
let commonParameters: CommonParameters = {}


// Helper function to merge common parameters with tracking options
const mergeCommonParameters = <
  T extends { url?: string; metadata?: any; extraData?: any; siteId?: string }
>(
  options: T
): T => {
  return {
    ...options,
    metadata: {
      ...commonParameters.metadata,
      ...options.metadata
    },
    extraData: {
      ...commonParameters.extraData,
      ...options.extraData
    },
    siteId: options.siteId || commonParameters.siteId
  }
}

// Wrapper class that adds common parameters functionality
class ExpoParselyWrapper {
  // Configuration
  async init(siteId: string): Promise<void> {
    return NativeExpoParsely.init(siteId)
  }

  // Enable or disable all tracking based on user consent
  setConsentGiven(given: boolean): void {
    _setConsentGiven(given)
    heartbeatManager.onConsentChanged(given)
  }

  // Check current consent state
  getConsentGiven(): boolean {
    return _getConsentGiven()
  }

  // Set common parameters that will be included with all tracking calls
  setCommonParameters(params: CommonParameters): void {
    commonParameters = { ...params }
  }

  // Get current common parameters
  getCommonParameters(): CommonParameters {
    return { ...commonParameters }
  }

  // Clear common parameters
  clearCommonParameters(): void {
    commonParameters = {}
  }

  // Page view tracking with automatic common parameters merging
  // Overload 1: URL as first parameter, options as second parameter (like iOS SDK)
  async trackPageView(urlOrPath: string, options?: Partial<PageViewOptions>): Promise<void>
  // Overload 2: Options object only (must contain url property)
  async trackPageView(options: PageViewOptions): Promise<void>
  // Implementation
  async trackPageView(
    urlOrPathOrOptions: string | PageViewOptions,
    options?: Partial<PageViewOptions>
  ): Promise<void> {
    if (!_getConsentGiven()) return

    let pageViewOptions: PageViewOptions

    if (typeof urlOrPathOrOptions === 'string') {
      // First overload: URL as first parameter
      pageViewOptions = { url: urlOrPathOrOptions }

      // Merge with provided options if any
      if (options) {
        pageViewOptions = {
          ...pageViewOptions,
          ...options,
          // Ensure URL from first parameter takes precedence
          url: urlOrPathOrOptions
        }
      }
    } else {
      // Second overload: Options object only
      pageViewOptions = urlOrPathOrOptions
    }

    // Merge with common parameters and send to native module
    const mergedOptions = mergeCommonParameters(pageViewOptions)
    return NativeExpoParsely.trackPageView(mergedOptions)
  }

}

const ExpoParsely = new ExpoParselyWrapper()

export default ExpoParsely
