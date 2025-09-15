// ============================================================================
// BASE TYPES
// ============================================================================

export interface ParselyMetadata {
  canonical_url?: string
  pub_date?: Date | number
  title?: string
  authors?: string[]
  image_url?: string
  section?: string
  tags?: string[]
  duration?: number
}

export interface ParselyVideoMetadata extends ParselyMetadata {
  videoId: string
  duration: number
}

export interface ExtraData {
  [key: string]: any
}

export type SiteIdSource = 'default' | { custom: string }

// ============================================================================
// GENERIC ANALYTICS TYPES
// ============================================================================

export interface UserData {
  [key: string]: any // Generic user data - can include plan, user_id, etc.
}

export interface PageData {
  [key: string]: any // Generic page data - can include url, title, etc.
}

export interface EventData {
  [key: string]: any // Generic event data for any custom tracking
}

// ============================================================================
// LEGACY PARSELY TYPES (for backward compatibility)
// ============================================================================

export interface ParselyUserData extends UserData {
  plan?: string // User category (can be 'anonyme', 'registered', 'paid' or any custom value)
  accesibility_article?: number // Article accessibility (can be 0, 1 or any custom value)
  spyri_user_id?: string // User ID
}

// ============================================================================
// TRACKING TYPES
// ============================================================================

export interface TrackingPageData extends PageData {}

export interface TrackingUserData extends UserData {}

// ============================================================================
// ENHANCED HEARTBEAT AND ACTIVITY DETECTION TYPES
// ============================================================================

export interface HeartbeatConfig {
  enableHeartbeats?: boolean
  inactivityThresholdMs?: number // Time before user is considered inactive
  intervalMs?: number // How often to send heartbeat events
  maxDurationMs?: number // Maximum session duration
}

export interface ActivityDetectionConfig {
  enableTouchDetection?: boolean // Detects touch/tap events (handled by HeartbeatTouchBoundary)
  enableScrollDetection?: boolean // Detects scroll events (handled by HeartbeatTouchBoundary)
  touchThrottleMs?: number // Throttle for touch events
  scrollThrottleMs?: number // Throttle for scroll events
  scrollThreshold?: number // Minimum scroll distance to trigger activity
}

export interface TrackingHierarchyConfig {
  componentName?: string
  testID?: string
  accessibilityLabel?: string
  trackingId?: string
  props?: Record<string, any>
  disabled?: boolean
}

export interface ElementTrackingConfig {
  elementId: string
  elementType: string
  trackImpressions?: boolean
  trackViews?: boolean
  viewThreshold?: number
}

export interface TrackableComponentProps {
  componentName?: string
  trackingId?: string
  elementType?: string
  trackImpressions?: boolean
  trackViews?: boolean
  viewThreshold?: number
  enableScrollTracking?: boolean
}

export interface HeartbeatStatus {
  isActive: boolean
  lastActivity: number
  sessionDuration: number
  totalActivities: number
  totalHeartbeats: number
}

// ============================================================================
// TRACKING METHOD PARAMETER TYPES
// ============================================================================

export interface TrackPageViewParams {
  url: string // URL de la page ou chemin relatif
  urlRef?: string // URL de provenance
  metadata?: TrackingPageData // Métadonnées Parsely
  extraData?: ExtraData // Données supplémentaires
  siteId?: string // ID du site (optionnel)
  action?: string // Custom action for events (e.g., "_share", "_conversion")
  data?: Record<string, any> // Custom event data (appears as extra_data in raw pipeline)
}

export interface TrackEngagementParams {
  url: string // URL de la page ou chemin relatif
  urlRef?: string // URL de provenance
  extraData?: ExtraData // Données supplémentaires
  siteId?: string // ID du site (optionnel)
}
