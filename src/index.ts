import ExpoParsely from './ExpoParselyModule'

// Export enhanced components
export { default as HeartbeatDebugOverlay } from './components/HeartbeatDebugOverlay'
export { HeartbeatTouchBoundary } from './components/HeartbeatTouchBoundary'
export { NavigationTracker } from './components/NavigationTracker'
export { default as ParselyProvider } from './components/ParselyProvider'

// Export enhanced hooks
export { useHeartbeatDebug } from './hooks/useHeartbeatDebug'
export { useReanimatedHeartbeat } from './hooks/useReanimatedHeartbeat'

// Export contexts
export { TrackingContext, TrackingProvider, useTrackingContext } from './contexts/TrackingContext'

// Export utilities
// Note: hierarchyHelpers removed for simplicity

// Export constants
export * from './constants'

// Export types
export * from './ExpoParsely.types'

// Export main module
export default ExpoParsely
