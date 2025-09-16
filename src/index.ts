// Re-export types
export type {
  ActivityDetectionConfig,
  CommonParameters,
  EngagementOptions,
  HeartbeatConfig,
  HeartbeatDebugInfo,
  HeartbeatDebugOverlayProps,
  HeartbeatTouchBoundaryProps,
  PageViewOptions,
  ParselyMetadata,
  ParselyProviderProps,
  ParselyTrackablePageViewProps,
  TrackableScreenProps,
  TrackingContextValue,
  VideoOptions
} from './ExpoParsely.types'

// Re-export the native module
export { default } from './ExpoParselyModule'

// Re-export heartbeat manager
export { heartbeatManager } from './utils/HeartbeatManager'

// Re-export debug utilities
export { DebugLoggerContext, createDebugLogger, useDebugLogger } from './utils/debugLogger'

// Re-export components
export {
  default as HeartbeatDebugOverlay,
  HeartbeatDebugProvider
} from './components/HeartbeatDebugOverlay'

// Re-export store
export { HeartbeatTouchBoundary, isCurrentlyScrolling } from './components/HeartbeatTouchBoundary'
export { ParselyProvider, useTrackingContext } from './components/ParselyProvider'
export { ParselyTrackablePageView } from './components/ParselyTrackablePageView'
export { heartbeatDebugStore, useHeartbeatDebugStore } from './stores/heartbeatDebugStore'
