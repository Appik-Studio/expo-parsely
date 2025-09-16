// Common types for ExpoParsely

// Metadata interface for pageview tracking
export interface ParselyMetadata {
  canonical_url?: string
  pub_date?: Date
  title?: string
  authors?: string[]
  image_url?: string
  section?: string
  tags?: string[]
  duration?: number
}

// Heartbeat configuration options (matches Parse.ly engaged-time documentation)
export interface HeartbeatConfig {
  enableHeartbeats?: boolean
  secondsBetweenHeartbeats?: number // Parse.ly standard: defaults to 150 seconds
  activeTimeout?: number // Parse.ly standard: defaults to 5 seconds
  onHeartbeat?: (engagedSeconds: number) => void // Parse.ly callback function
  videoPlaying?: boolean // Parse.ly video tracking support
}

// Activity detection configuration options
export interface ActivityDetectionConfig {
  touchThrottleMs?: number
  scrollThrottleMs?: number
  scrollThreshold?: number
}

// Common parameters that are sent with all tracking events
export interface CommonParameters {
  metadata?: Partial<ParselyMetadata>
  extraData?: Record<string, any>
  siteId?: string
}

// Pageview options
export interface PageViewOptions {
  url: string
  urlref?: string
  metadata?: ParselyMetadata
  extraData?: Record<string, any>
  siteId?: string
  action?: string
  data?: Record<string, any>
}

// Engagement tracking options
export interface EngagementOptions {
  url: string
  urlref?: string
  extraData?: Record<string, any>
  siteId?: string
}

// Video tracking options
export interface VideoOptions {
  url: string
  urlref?: string
  videoID: string
  duration: number
  metadata?: ParselyMetadata
  extraData?: Record<string, any>
  siteId?: string
}

// Tracking Context for overall app tracking
export interface TrackingContextValue {
  trackPageView: (context?: Partial<Record<string, any>>) => void
  isActive: boolean
  recordActivity: () => void
}

// ParselyProvider props
export interface ParselyProviderProps {
  children: React.ReactNode
  /** Site ID for Parse.ly */
  siteId?: string
  /** Whether to auto-initialize Parse.ly SDK */
  autoInitialize?: boolean
  /** Flush interval for Parse.ly */
  flushInterval?: number
  /** Whether to run in dry-run mode */
  dryRun?: boolean
  /** Whether to enable debug logging */
  enableDebugLogging?: boolean
  /** Heartbeat configuration */
  heartbeatConfig?: Partial<HeartbeatConfig>
  /** Activity detection configuration */
  activityDetectionConfig?: Partial<ActivityDetectionConfig>
}

// TrackableScreen props
export interface TrackableScreenProps {
  screenName: string
  screenUrl?: string
  analyticsContext?: Record<string, any>
  children?: React.ReactNode
}

// ParselyTrackablePageView props (alias for TrackableScreenProps)
export type ParselyTrackablePageViewProps = TrackableScreenProps

// HeartbeatTouchBoundary props
export interface HeartbeatTouchBoundaryProps {
  children?: React.ReactNode
}

// HeartbeatDebugOverlay props
export interface HeartbeatDebugOverlayProps {
  visible?: boolean
  updateIntervalMs?: number // Update frequency for debug info (default: 1000ms)
}

// Heartbeat debug info
export interface HeartbeatDebugInfo {
  isActive: boolean
  timeSinceActivity: number
  totalEngagedTime: number
  lastActivity: number
  sessionStart: number
}

// Re-export React types that are used
export type { ReactNode } from 'react'
