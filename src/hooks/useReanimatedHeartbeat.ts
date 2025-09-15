import { useCallback, useEffect, useMemo } from 'react'
import { runOnJS, runOnUI, useSharedValue } from 'react-native-reanimated'

import { HeartbeatConfig } from '../ExpoParsely.types'
import ExpoParsely from '../ExpoParselyModule'
import { ANALYTICS_CONFIG, isDev } from '../constants'

const debugLog = (message: string, data?: any) => {
  if (isDev) {
    console.log(`💓 [Parse.ly Heartbeat] ${message}`, data || '')
  }
}

// https://docs.parse.ly/engaged-time/
export const useReanimatedHeartbeat = (config: Partial<HeartbeatConfig> = {}) => {
  const finalConfig = useMemo(
    () => ({
      enableHeartbeats: ANALYTICS_CONFIG.heartbeat.enableHeartbeats || true,
      inactivityThresholdMs: ANALYTICS_CONFIG.heartbeat.activeTimeout * 1000,
      intervalMs: ANALYTICS_CONFIG.heartbeat.secondsBetweenHeartbeats * 1000, // Convert seconds to milliseconds
      maxDurationMs: ANALYTICS_CONFIG.heartbeat.maxSessionDurationMinutes * 60 * 1000, // Convert minutes to milliseconds
      ...config // Allow overrides
    }),
    [config]
  )
  // Track heartbeat using ExpoParsely module
  const trackHeartbeat = useCallback((engagementTimeSeconds: number) => {
    if (isDev) {
      console.log(`💓 [Parse.ly] Recording heartbeat at ${engagementTimeSeconds}s`)
    }
    // Send heartbeat event to Parse.ly
    ExpoParsely.recordActivity()
  }, [])

  const isHeartbeatEnabled = finalConfig.enableHeartbeats !== false

  useEffect(() => {
    debugLog('Hook initialized with config:', finalConfig)
  }, [finalConfig])

  const lastActivity = useSharedValue(Date.now())
  const sessionStart = useSharedValue(Date.now())
  const isActive = useSharedValue(false)
  const heartbeatTimer = useSharedValue<any>(null)

  const recordActivity = () => {
    'worklet'
    const now = Date.now()
    const previousActivity = lastActivity.value
    const timeSincePrevious = now - previousActivity

    // Fast path: immediate shared value updates on UI thread
    const wasActive = isActive.value
    lastActivity.value = now

    if (!wasActive) {
      isActive.value = true
      runOnJS(debugLog)('🎯 ACTIVITY DETECTED - SESSION ACTIVATED', {
        timeSincePrevious: `${timeSincePrevious}ms`,
        timestamp: now
      })
    } else {
      runOnJS(debugLog)('🎯 ACTIVITY RECORDED', {
        timeSincePrevious: `${timeSincePrevious}ms`,
        timestamp: now
      })
    }
  }

  const performHeartbeatCheckInternal = (currentlyScrolling: boolean) => {
    // Skip all heartbeat logic if disabled per Parse.ly specification
    if (!isHeartbeatEnabled) return

    const now = Date.now()
    const timeSinceActivity = now - lastActivity.value
    const totalSessionTime = now - sessionStart.value

    debugLog('ENGAGEMENT CHECK', {
      currentlyScrolling,
      isActive: isActive.value,
      parselySettings: {
        activeTimeout: `${finalConfig.inactivityThresholdMs}ms`,
        heartbeatInterval: `${Math.floor(finalConfig.intervalMs / 1000)}s`,
        maxDurationMs: `${Math.floor(finalConfig.maxDurationMs / 1000)}s`
      },
      shouldGoInactive:
        !currentlyScrolling && timeSinceActivity > finalConfig.inactivityThresholdMs,
      timeSinceActivity: `${timeSinceActivity}ms`,
      totalSessionTime: `${Math.floor(totalSessionTime / 1000)}s`
    })

    // Check for inactivity only if NOT currently scrolling
    if (
      !currentlyScrolling &&
      (timeSinceActivity > finalConfig.inactivityThresholdMs ||
        totalSessionTime > finalConfig.maxDurationMs)
    ) {
      isActive.value = false
      if (heartbeatTimer.value) {
        clearTimeout(heartbeatTimer.value)
        heartbeatTimer.value = null
      }

      const reason =
        timeSinceActivity > finalConfig.inactivityThresholdMs ? 'inactivity' : 'max duration'
      debugLog(`💀 HEARTBEAT STOPPED - ${reason}`, {
        timeSinceActivity: `${timeSinceActivity}ms`,
        totalSessionTime: `${Math.floor(totalSessionTime / 1000)}s`
      })
      return
    }

    // If currently scrolling, skip inactivity check but continue with heartbeat
    // Parse.ly counts scroll as engagement: https://docs.parse.ly/engaged-time/
    if (currentlyScrolling) {
      debugLog(
        'SCROLL ENGAGEMENT - Preventing inactivity check, continuing heartbeat (Parse.ly methodology)'
      )
    }

    const engagementTimeSeconds = Math.floor(totalSessionTime / 1000)
    debugLog('💓 Sending heartbeat event', { engagementTimeSeconds })
    trackHeartbeat(engagementTimeSeconds)

    setTimeout(() => performHeartbeatCheck(), finalConfig.intervalMs)

    debugLog(`⏰ Next heartbeat scheduled in ${finalConfig.intervalMs}ms`)
  }

  const performHeartbeatCheck = () => {
    // Get scroll state from JS thread, then continue with optimized logic
    const currentlyScrolling = ExpoParsely.isCurrentlyScrolling()
    performHeartbeatCheckInternal(currentlyScrolling)
  }

  const stopHeartbeat = () => {
    debugLog('Stopping heartbeat manually')
    isActive.value = false
    if (heartbeatTimer.value) {
      clearTimeout(heartbeatTimer.value)
      heartbeatTimer.value = null
    }
  }

  const startTracking = () => {
    'worklet'
    const now = Date.now()
    sessionStart.value = now
    lastActivity.value = now
    isActive.value = true
    runOnJS(debugLog)('Starting tracking session', {
      config: finalConfig,
      sessionStart: now
    })
    runOnJS(performHeartbeatCheck)()
  }

  useEffect(() => {
    if (isHeartbeatEnabled) {
      runOnUI(startTracking)()
    } else {
      debugLog('Heartbeats disabled - not starting tracking')
    }

    return () => {
      debugLog('useEffect cleanup - stopping heartbeat')
      if (isHeartbeatEnabled) {
        stopHeartbeat()
      }
    }
  }, [isHeartbeatEnabled])

  const globalRecordActivity = useCallback(() => {
    if (!isHeartbeatEnabled) return // Skip if heartbeats disabled

    debugLog('Manual activity recorded from external call')
    runOnUI(recordActivity)()
  }, [isHeartbeatEnabled])

  const heartbeatStatus = useCallback(
    () => ({
      isActive: isActive.value,
      lastActivity: lastActivity.value
    }),
    [isActive.value, lastActivity.value]
  )

  // Return disabled state if heartbeats are disabled per Parse.ly specification
  if (!isHeartbeatEnabled) {
    debugLog('Heartbeats disabled - returning no-op functions')
    return {
      heartbeatStatus: {
        isActive: false,
        timeSinceActivity: 0,
        totalEngagedTime: 0
      },
      recordActivity: () => {} // No-op function when disabled
    }
  }

  return {
    heartbeatStatus,
    recordActivity: globalRecordActivity
  }
}
