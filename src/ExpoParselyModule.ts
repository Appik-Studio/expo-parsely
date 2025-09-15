import { NativeModule, requireNativeModule } from 'expo-modules-core'

import type { CommonParameters, EngagementOptions, PageViewOptions } from './ExpoParsely.types'

declare class ExpoParselyModule extends NativeModule {
  // Configuration
  init(siteId: string): Promise<void>

  // Page view tracking - single method like iOS SDK
  trackPageView(options: PageViewOptions): Promise<void>

  // Engagement tracking (heartbeat)
  startEngagement(options: EngagementOptions): Promise<void>
  stopEngagement(): Promise<void>

  // Debug methods
  getHeartbeatStatus(): Promise<{
    isActive: boolean
    lastActivity: number
    sessionDuration: number
    totalActivities: number
    totalHeartbeats: number
  }>
  isCurrentlyScrolling(): Promise<boolean>
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

  // Engagement tracking (heartbeat) with automatic common parameters merging
  // Overload 1: URL as first parameter, options as second parameter
  async startEngagement(url: string, options?: Partial<EngagementOptions>): Promise<void>
  // Overload 2: Options object only (must contain url property)
  async startEngagement(options: EngagementOptions): Promise<void>
  // Implementation
  async startEngagement(
    urlOrOptions: string | EngagementOptions,
    options?: Partial<EngagementOptions>
  ): Promise<void> {
    let engagementOptions: EngagementOptions

    if (typeof urlOrOptions === 'string') {
      // First overload: URL as first parameter
      engagementOptions = { url: urlOrOptions }

      // Merge with provided options if any
      if (options) {
        engagementOptions = {
          ...engagementOptions,
          ...options,
          // Ensure URL from first parameter takes precedence
          url: urlOrOptions
        }
      }
    } else {
      // Second overload: Options object only
      engagementOptions = urlOrOptions
    }

    const mergedOptions = mergeCommonParameters(engagementOptions)
    return NativeExpoParsely.startEngagement(mergedOptions)
  }

  async stopEngagement(): Promise<void> {
    return NativeExpoParsely.stopEngagement()
  }

  // Debug methods
  async getHeartbeatStatus() {
    return NativeExpoParsely.getHeartbeatStatus()
  }

  async isCurrentlyScrolling() {
    return NativeExpoParsely.isCurrentlyScrolling()
  }

  // Record activity (placeholder for compatibility with existing code)
  recordActivity(): void {
    // This method is used by HeartbeatTouchBoundary and other components
    // The actual activity recording is handled by the native module
    // This is just a placeholder to maintain API compatibility
  }

  // Parse.ly video tracking support
  private _videoPlaying: boolean = false

  get videoPlaying(): boolean {
    return this._videoPlaying
  }

  set videoPlaying(playing: boolean) {
    this._videoPlaying = playing
    // In a full implementation, this would notify the native module
    // For now, this maintains Parse.ly API compatibility
  }
}

const ExpoParsely = new ExpoParselyWrapper()

export default ExpoParsely
