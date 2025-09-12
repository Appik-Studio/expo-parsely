import { requireNativeModule } from 'expo-modules-core'

import type {
  ActivityDetectionConfig,
  ExtraData,
  HeartbeatConfig,
  HeartbeatStatus,
  ParselyMetadata,
  ParselyVideoMetadata,
  TrackingHierarchyConfig
} from './ExpoParsely.types'

interface NativeModule {
  init(siteId: string, flushInterval?: number, dryRun?: boolean): void

  trackPageView(
    url: string,
    urlRef?: string,
    metadata?: ParselyMetadata,
    extraData?: ExtraData,
    siteId?: string
  ): void

  startEngagement(url: string, urlRef?: string, extraData?: ExtraData, siteId?: string): void

  stopEngagement(): void

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

  // Element and Component Tracking
  trackElement(action: string, elementType: string, elementId: string, location: string): void

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

  static trackPageView(
    url: string,
    urlRef?: string,
    metadata?: ParselyMetadata,
    extraData?: ExtraData,
    siteId?: string
  ): void {
    nativeModule.trackPageView(url, urlRef, metadata, extraData, siteId)
  }

  static startEngagement(
    url: string,
    urlRef?: string,
    extraData?: ExtraData,
    siteId?: string
  ): void {
    nativeModule.startEngagement(url, urlRef, extraData, siteId)
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

  // Element and Component Tracking Methods
  static trackElement(
    action: string,
    elementType: string,
    elementId: string,
    location: string
  ): void {
    nativeModule.trackElement(action, elementType, elementId, location)
  }

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
