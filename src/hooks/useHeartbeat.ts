import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'

import type {
  HeartbeatConfig,
  HeartbeatStatus,
  ActivityDetectionConfig
} from '../ExpoParsely.types'
import ExpoParsely from '../ExpoParselyModule'

export interface UseHeartbeatOptions {
  /** Enable/disable heartbeat tracking */
  enabled?: boolean
  /** Heartbeat configuration */
  heartbeatConfig?: Partial<HeartbeatConfig>
  /** Activity detection configuration */
  activityConfig?: Partial<ActivityDetectionConfig>
  /** Callback when heartbeat is sent */
  onHeartbeat?: (status: HeartbeatStatus) => void
  /** Callback when activity is recorded */
  onActivity?: (activityType: 'touch' | 'scroll') => void
  /** Callback when session becomes inactive */
  onInactive?: () => void
  /** Callback when session becomes active */
  onActive?: () => void
}

export interface HeartbeatHookReturn {
  /** Current heartbeat status */
  status: HeartbeatStatus
  /** Record manual activity */
  recordActivity: (activityType?: 'touch' | 'scroll') => void
  /** Start heartbeat tracking */
  startTracking: () => void
  /** Stop heartbeat tracking */
  stopTracking: () => void
  /** Update heartbeat configuration */
  updateConfig: (config: Partial<HeartbeatConfig>) => void
  /** Update activity detection configuration */
  updateActivityConfig: (config: Partial<ActivityDetectionConfig>) => void
  /** Set scroll state */
  setScrollState: (isScrolling: boolean) => void
  /** Check if currently scrolling */
  isScrolling: boolean
}

/**
 * Generic heartbeat hook for Parsely analytics
 * Provides automatic activity detection, configurable heartbeats, and session management
 */
export const useHeartbeat = ({
  enabled = true,
  heartbeatConfig = {},
  activityConfig = {},
  onHeartbeat,
  onActivity,
  onInactive,
  onActive
}: UseHeartbeatOptions = {}): HeartbeatHookReturn => {
  const [status, setStatus] = useState<HeartbeatStatus>({
    isActive: false,
    lastActivity: 0,
    sessionDuration: 0,
    totalActivities: 0,
    totalHeartbeats: 0
  })
  const [isScrolling, setIsScrollingState] = useState(false)

  const previousActiveRef = useRef(false)
  const appStateRef = useRef(AppState.currentState)

  // Configure heartbeat on mount and when config changes
  useEffect(() => {
    if (enabled) {
      const defaultHeartbeatConfig: HeartbeatConfig = {
        enableHeartbeats: true,
        inactivityThresholdMs: 5000, // 5 seconds
        intervalMs: 10000, // 10 seconds
        maxDurationMs: 3600000, // 1 hour
        ...heartbeatConfig
      }

      const defaultActivityConfig: ActivityDetectionConfig = {
        enableTouchDetection: true,
        enableScrollDetection: true,
        touchThrottleMs: 1000,
        scrollThrottleMs: 1000,
        scrollThreshold: 10,
        ...activityConfig
      }

      ExpoParsely.configureHeartbeat(defaultHeartbeatConfig)
      ExpoParsely.configureActivityDetection(defaultActivityConfig)
    }
  }, [enabled, heartbeatConfig, activityConfig])

  // Monitor app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current === 'active' && nextAppState !== 'active') {
        // App going to background - pause tracking
        ExpoParsely.stopHeartbeatTracking()
      } else if (appStateRef.current !== 'active' && nextAppState === 'active') {
        // App coming to foreground - resume tracking
        if (enabled) {
          ExpoParsely.startHeartbeatTracking()
        }
      }
      appStateRef.current = nextAppState
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      subscription.remove()
    }
  }, [enabled])

  // Start/stop tracking based on enabled state
  useEffect(() => {
    if (enabled) {
      ExpoParsely.startHeartbeatTracking()
    } else {
      ExpoParsely.stopHeartbeatTracking()
    }

    return () => {
      ExpoParsely.stopHeartbeatTracking()
    }
  }, [enabled])

  // Poll status periodically
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      const currentStatus = ExpoParsely.getHeartbeatStatus()
      setStatus(currentStatus)

      // Check for status changes
      if (currentStatus.isActive !== previousActiveRef.current) {
        if (currentStatus.isActive) {
          onActive?.()
        } else {
          onInactive?.()
        }
        previousActiveRef.current = currentStatus.isActive
      }

      // Update scroll state
      const scrolling = ExpoParsely.isCurrentlyScrolling()
      setIsScrollingState(scrolling)
    }, 1000) // Poll every second

    return () => clearInterval(interval)
  }, [enabled, onActive, onInactive])

  const recordActivity = useCallback(
    (activityType: 'touch' | 'scroll' = 'touch') => {
      if (!enabled) return

      ExpoParsely.recordActivity()
      onActivity?.(activityType)
    },
    [enabled, onActivity]
  )

  const startTracking = useCallback(() => {
    ExpoParsely.startHeartbeatTracking()
  }, [])

  const stopTracking = useCallback(() => {
    ExpoParsely.stopHeartbeatTracking()
  }, [])

  const updateConfig = useCallback((config: Partial<HeartbeatConfig>) => {
    ExpoParsely.configureHeartbeat(config)
  }, [])

  const updateActivityConfig = useCallback((config: Partial<ActivityDetectionConfig>) => {
    ExpoParsely.configureActivityDetection(config)
  }, [])

  const setScrollState = useCallback((isScrolling: boolean) => {
    ExpoParsely.setScrollState(isScrolling)
    setIsScrollingState(isScrolling)
  }, [])

  return {
    status,
    recordActivity,
    startTracking,
    stopTracking,
    updateConfig,
    updateActivityConfig,
    setScrollState,
    isScrolling
  }
}

export default useHeartbeat
