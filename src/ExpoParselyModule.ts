import { requireNativeModule } from 'expo-modules-core'

import type {
  ActivityDetectionConfig,
  ExtraData,
  HeartbeatConfig,
  HeartbeatStatus,
  ParselyMetadata,
  ParselyVideoMetadata,
  TrackEngagementParams,
  TrackingHierarchyConfig,
  TrackPageViewParams
} from './ExpoParsely.types'

interface NativeModule {
  init(siteId: string, flushInterval?: number, dryRun?: boolean): void

  // Page View Tracking
  trackPageView(params: TrackPageViewParams): void

  // Engagement Tracking
  startEngagement(params: TrackEngagementParams): void
  stopEngagement(): void

  // Video Tracking
  trackPlay(
    url: string,
    videoMetadata: ParselyVideoMetadata,
    urlRef?: string,
    extraData?: ExtraData,
    siteId?: string
  ): void
  trackPause(): void
  resetVideo(): void

  // Enhanced Heartbeat and Activity Detection
  configureHeartbeat(config: HeartbeatConfig): void
  configureActivityDetection(config: ActivityDetectionConfig): void
  recordActivity(): void
  getHeartbeatStatus(): HeartbeatStatus
  startHeartbeatTracking(): void
  stopHeartbeatTracking(): void

  // Component Tracking
  registerComponentTracking(config: TrackingHierarchyConfig): string
  unregisterComponentTracking(trackingId: string): void

  // Scroll and Touch Detection
  setScrollState(isScrolling: boolean): void
  isCurrentlyScrolling(): boolean
}

const nativeModule = requireNativeModule<NativeModule>('ExpoParsely')

class ExpoParsely {
  static init(siteId: string, options?: { flushInterval?: number; dryRun?: boolean }): void {
    nativeModule.init(siteId, options?.flushInterval, options?.dryRun)
  }

  // Page View Tracking - New unified interface
  static trackPageView(params: TrackPageViewParams): void
  static trackPageView(
    url: string,
    urlRef?: string,
    metadata?: ParselyMetadata,
    extraData?: ExtraData,
    siteId?: string
  ): void
  static trackPageView(
    urlOrParams: string | TrackPageViewParams,
    urlRef?: string,
    metadata?: ParselyMetadata,
    extraData?: ExtraData,
    siteId?: string
  ): void {
    if (typeof urlOrParams === 'string') {
      // Legacy support
      nativeModule.trackPageView({
        url: urlOrParams,
        urlRef,
        metadata: metadata as any,
        extraData,
        siteId
      })
    } else {
      // New unified interface
      nativeModule.trackPageView(urlOrParams)
    }
  }

  // Engagement Tracking - New unified interface
  static startEngagement(params: TrackEngagementParams): void
  static startEngagement(url: string, urlRef?: string, extraData?: ExtraData, siteId?: string): void
  static startEngagement(
    urlOrParams: string | TrackEngagementParams,
    urlRef?: string,
    extraData?: ExtraData,
    siteId?: string
  ): void {
    if (typeof urlOrParams === 'string') {
      // Legacy support
      nativeModule.startEngagement({
        url: urlOrParams,
        urlRef,
        extraData,
        siteId
      })
    } else {
      // New unified interface
      nativeModule.startEngagement(urlOrParams)
    }
  }

  static stopEngagement(): void {
    nativeModule.stopEngagement()
  }

  // Video tracking methods
  static trackPlay(
    url: string,
    videoMetadata: ParselyVideoMetadata,
    urlRef?: string,
    extraData?: ExtraData,
    siteId?: string
  ): void {
    nativeModule.trackPlay(url, videoMetadata, urlRef, extraData, siteId)
  }

  static trackPause(): void {
    nativeModule.trackPause()
  }

  static resetVideo(): void {
    nativeModule.resetVideo()
  }

  // Enhanced Heartbeat Methods
  static configureHeartbeat(config: HeartbeatConfig): void {
    nativeModule.configureHeartbeat(config)
  }

  static configureActivityDetection(config: ActivityDetectionConfig): void {
    nativeModule.configureActivityDetection(config)
  }

  static recordActivity(): void {
    nativeModule.recordActivity()
  }

  static getHeartbeatStatus(): HeartbeatStatus {
    return nativeModule.getHeartbeatStatus()
  }

  static startHeartbeatTracking(): void {
    nativeModule.startHeartbeatTracking()
  }

  static stopHeartbeatTracking(): void {
    nativeModule.stopHeartbeatTracking()
  }

  // Component Tracking Methods
  static registerComponentTracking(config: TrackingHierarchyConfig): string {
    return nativeModule.registerComponentTracking(config)
  }

  static unregisterComponentTracking(trackingId: string): void {
    nativeModule.unregisterComponentTracking(trackingId)
  }

  // Scroll and Touch Detection Methods
  static setScrollState(isScrolling: boolean): void {
    nativeModule.setScrollState(isScrolling)
  }

  static isCurrentlyScrolling(): boolean {
    return nativeModule.isCurrentlyScrolling()
  }
}

export default ExpoParsely
