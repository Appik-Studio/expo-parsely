import { ReactNode, useCallback } from 'react'

import ExpoParsely from '../ExpoParselyModule'
import { TrackingProvider, useReanimatedHeartbeat } from '../index'
import { HeartbeatTouchBoundary } from './HeartbeatTouchBoundary'

interface ParselyProviderProps {
  children: ReactNode
  /** Site ID for Parse.ly */
  siteId?: string
  /** Whether to auto-initialize Parse.ly SDK */
  autoInitialize?: boolean
  /** Flush interval for Parse.ly */
  flushInterval?: number
  /** Whether to run in dry-run mode */
  dryRun?: boolean
  /** Heartbeat configuration */
  heartbeatConfig?: {
    enableHeartbeats?: boolean
    inactivityThresholdMs?: number
    intervalMs?: number
    maxDurationMs?: number
  }
  /** Activity detection configuration */
  activityDetectionConfig?: {
    enableTouchDetection?: boolean
    enableScrollDetection?: boolean
    touchThrottleMs?: number
    scrollThrottleMs?: number
    scrollThreshold?: number
  }
  /** Whether to enable debug logging */
  enableDebugLogging?: boolean
}

// Hook to get heartbeat recordActivity function
const useHeartbeatActivity = (heartbeatConfig?: ParselyProviderProps['heartbeatConfig']) => {
  const { recordActivity: heartbeatRecordActivity } = useReanimatedHeartbeat(heartbeatConfig)
  return heartbeatRecordActivity
}

// Internal component that uses useReanimatedHeartbeat hook
const HeartbeatWrapper: React.FC<{
  children: ReactNode
  heartbeatConfig?: ParselyProviderProps['heartbeatConfig']
  enableDebugLogging?: boolean
  onHeartbeatActivity?: () => void
}> = ({ children, heartbeatConfig, enableDebugLogging, onHeartbeatActivity }) => {
  const handleTouchActivity = useCallback(() => {
    // Record activity for Parse.ly native module
    ExpoParsely.recordActivity()

    // Reset heartbeat timer
    onHeartbeatActivity?.()

    if (__DEV__ && enableDebugLogging) {
      console.log('🎯 [ParselyProvider] Touch activity detected - recorded in Parse.ly and reset heartbeat timer')
    }
  }, [onHeartbeatActivity, enableDebugLogging])

  return (
    <HeartbeatTouchBoundary onTouchActivity={handleTouchActivity} onHeartbeatActivity={onHeartbeatActivity}>
      {children}
    </HeartbeatTouchBoundary>
  )
}

/**
 * Comprehensive Parse.ly provider that wraps the entire app
 * with tracking functionality, automatic initialization, and navigation tracking
 */
export const ParselyProvider: React.FC<ParselyProviderProps> = ({
  children,
  siteId,
  autoInitialize = true,
  flushInterval = 150,
  dryRun = false,
  heartbeatConfig = {
    enableHeartbeats: true,
    inactivityThresholdMs: 30000,
    intervalMs: 10000,
    maxDurationMs: 7200000 // 2 hours
  },
  activityDetectionConfig = {
    enableTouchDetection: true,
    enableScrollDetection: true,
    touchThrottleMs: 100,
    scrollThrottleMs: 1000,
    scrollThreshold: 5
  },
  enableDebugLogging = false
}) => {
  // Conditionally wrap with HeartbeatTouchBoundary if heartbeats are enabled
  const enableHeartbeats = heartbeatConfig?.enableHeartbeats ?? true

  // Get heartbeat recordActivity function
  const heartbeatRecordActivity = useHeartbeatActivity(heartbeatConfig)

  const content = enableHeartbeats ? (
    <HeartbeatWrapper
      heartbeatConfig={heartbeatConfig}
      enableDebugLogging={enableDebugLogging}
      onHeartbeatActivity={heartbeatRecordActivity}>
      {children}
    </HeartbeatWrapper>
  ) : (
    <>{children}</>
  )

  return (
    <TrackingProvider
      autoInitialize={autoInitialize}
      siteId={siteId}
      flushInterval={flushInterval}
      dryRun={dryRun}
      heartbeatConfig={heartbeatConfig}
      activityDetectionConfig={activityDetectionConfig}
      enableDebugLogging={enableDebugLogging}
      recordHeartbeatActivity={heartbeatRecordActivity}>
      {content}
    </TrackingProvider>
  )
}

export default ParselyProvider
