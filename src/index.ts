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

// Re-export hooks
export { useReanimatedHeartbeat } from './hooks/useReanimatedHeartbeat'

// Re-export debug utilities
export { DebugLoggerContext, createDebugLogger, useDebugLogger } from './utils/debugLogger'

// Re-export components
export {
  default as HeartbeatDebugOverlay,
  HeartbeatDebugProvider,
  useHeartbeatDebug
} from './components/HeartbeatDebugOverlay'
export { HeartbeatTouchBoundary, isCurrentlyScrolling } from './components/HeartbeatTouchBoundary'
export { ParselyProvider, useTrackingContext } from './components/ParselyProvider'
export { ParselyTrackablePageView } from './components/ParselyTrackablePageView'
