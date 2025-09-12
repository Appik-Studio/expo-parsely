export interface ParselyMetadata {
  canonical_url?: string;
  pub_date?: Date | number;
  title?: string;
  authors?: string[];
  image_url?: string;
  section?: string;
  tags?: string[];
  duration?: number;
}

export interface ParselyVideoMetadata extends ParselyMetadata {
  videoId: string;
  duration: number;
}

export interface ExtraData {
  [key: string]: any;
}

export type SiteIdSource = "default" | { custom: string };

// Enhanced Heartbeat and Activity Detection Types
export interface HeartbeatConfig {
  enableHeartbeats?: boolean;
  inactivityThresholdMs?: number;
  intervalMs?: number;
  maxDurationMs?: number;
}

export interface ActivityDetectionConfig {
  enableTouchDetection?: boolean;
  enableScrollDetection?: boolean;
  touchThrottleMs?: number;
  scrollThrottleMs?: number;
  scrollThreshold?: number;
}

export interface TrackingHierarchyConfig {
  componentName?: string;
  testID?: string;
  accessibilityLabel?: string;
  trackingId?: string;
  props?: Record<string, any>;
  disabled?: boolean;
}

export interface ElementTrackingConfig {
  elementId: string;
  elementType: string;
  trackImpressions?: boolean;
  trackViews?: boolean;
  viewThreshold?: number;
}

export interface TrackableComponentProps {
  componentName?: string;
  trackingId?: string;
  elementType?: string;
  trackImpressions?: boolean;
  trackViews?: boolean;
  viewThreshold?: number;
  enableScrollTracking?: boolean;
}

export interface HeartbeatStatus {
  isActive: boolean;
  lastActivity: number;
  sessionDuration: number;
  totalActivities: number;
  totalHeartbeats: number;
}
