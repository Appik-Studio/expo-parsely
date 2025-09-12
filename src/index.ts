import ExpoParsely from './ExpoParselyModule'

// Export enhanced components
export { default as HeartbeatDebugOverlay } from './components/HeartbeatDebugOverlay'
export { default as HeartbeatTouchBoundary } from './components/HeartbeatTouchBoundary'
export { default as NavigationTracker } from './components/NavigationTracker'
export { default as ParselyProvider } from './components/ParselyProvider'
export { default as TrackableTouchable } from './components/TrackableTouchable'

// Export enhanced hooks
export { default as useElementTracking } from './hooks/useElementTracking'
export { default as useHeartbeat } from './hooks/useHeartbeat'
export { useHeartbeatDebug } from './hooks/useHeartbeatDebug'
export { useNavigationTracking, withNavigationTracking } from './hooks/useNavigationTracking'
export { default as useTrackingHierarchy } from './hooks/useTrackingHierarchy'

// Export contexts
export {
  TrackingContext,
  default as TrackingProvider,
  useTrackingContext
} from './contexts/TrackingContext'

// Export utilities
export * from './utils/hierarchyHelpers'

// Export constants
export * from './constants'

// Export types
export * from './ExpoParsely.types'

// Export main module
export default ExpoParsely
