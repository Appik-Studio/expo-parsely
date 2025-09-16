import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { runOnUI, useSharedValue } from 'react-native-reanimated'

import type { HeartbeatConfig } from '../ExpoParsely.types'
import ExpoParsely from '../ExpoParselyModule'
import { HeartbeatDebugContext } from '../components/HeartbeatDebugOverlay'
import { useDebugLogger } from '../utils/debugLogger'

// Default heartbeat configuration (matches Parse.ly engaged-time documentation)
const DEFAULT_HEARTBEAT_CONFIG: Required<HeartbeatConfig> = {
  enableHeartbeats: true,
  secondsBetweenHeartbeats: 150, // Parse.ly standard: 150 seconds
  activeTimeout: 5, // Parse.ly standard: 5 seconds
  onHeartbeat: () => {}, // Default no-op callback
  videoPlaying: false // Default: no video playing
}

/**
 * Reanimated-optimized heartbeat hook that integrates with ExpoParsely engagement tracking
 * Uses React Native Reanimated for native performance in activity detection
 */
// Internal hook for activity recording only (used by HeartbeatTouchBoundary)
export const useActivityRecording = () => {
  // Use Reanimated shared values for better performance
  const isActive = useSharedValue(false)

  // Record activity (resets inactivity timer) - optimized with Reanimated
  const recordActivity = useCallback(() => {
    runOnUI(() => {
      'worklet'
      isActive.value = true
    })()
  }, [])

  return { recordActivity, isActive: isActive.value }
}

export const useReanimatedHeartbeat = (config: Partial<HeartbeatConfig> = {}) => {
  const debugLogger = useDebugLogger()

  const finalConfig = useMemo(
    () => ({ ...DEFAULT_HEARTBEAT_CONFIG, ...config }),
    [
      config.enableHeartbeats,
      config.secondsBetweenHeartbeats,
      config.activeTimeout,
      config.onHeartbeat,
      config.videoPlaying
    ]
  )

  // Convert Parse.ly seconds to milliseconds for internal use
  const intervalMs = finalConfig.secondsBetweenHeartbeats * 1000
  const activeTimeoutMs = finalConfig.activeTimeout * 1000

  // Access debug context to update debug data
  const debugContext = useContext(HeartbeatDebugContext)

  // Use Reanimated shared values for better performance
  const heartbeatTimer = useSharedValue(null)
  const lastActivity = useSharedValue(Date.now())
  const sessionStart = useSharedValue(Date.now())
  const isActive = useSharedValue(false)
  const lastHeartbeatSent = useSharedValue(Date.now())
  const totalEngagedTime = useSharedValue(0)

  // Helper functions to access values consistently
  const getValue = (ref: any) => ref.value
  const setValue = (ref: any, value: any) => {
    ref.value = value
  }

  // Debug stats tracking
  const [totalActivities, setTotalActivities] = useState(0)
  const [totalHeartbeats, setTotalHeartbeats] = useState(0)
  const [scrollState, setScrollState] = useState(false)

  // Record activity (resets inactivity timer) - optimized with Reanimated
  const recordActivity = useCallback(() => {
    runOnUI(() => {
      'worklet'
      const now = Date.now()

      // Fast path: immediate shared value updates on UI thread
      const wasActive = isActive.value
      lastActivity.value = now

      // Note: setTotalActivities cannot be called directly in worklet
      // This will be handled outside the worklet

      if (!wasActive) {
        isActive.value = true
        // Logging cannot be done in worklet context
      }
    })()

    // Handle state updates and logging outside worklet
    const now = Date.now()
    const previousActivity = lastActivity.value
    const timeSincePrevious = now - previousActivity
    const wasActive = isActive.value

    setTotalActivities(prev => prev + 1)

    if (!wasActive) {
      debugLogger.success('💓 [Parse.ly Heartbeat]', '🎯 ACTIVITY DETECTED - SESSION ACTIVATED', {
        timeSincePrevious: `${timeSincePrevious}ms`,
        timestamp: now
      })
    } else {
      debugLogger.log('💓 [Parse.ly Heartbeat]', '🎯 ACTIVITY RECORDED', {
        timeSincePrevious: `${timeSincePrevious}ms`,
        timestamp: now
      })
    }
  }, [debugLogger])

  // Internal heartbeat check function
  const performHeartbeatCheckInternal = useCallback(
    (currentlyScrolling: boolean) => {
      const now = Date.now()
      const timeSinceActivity = now - getValue(lastActivity)

      // Parse.ly engagement formula: video playing OR (interacted recently AND window in focus)
      const isEngaged =
        finalConfig.videoPlaying || currentlyScrolling || timeSinceActivity <= activeTimeoutMs

      // If currently scrolling, skip inactivity check but continue with heartbeat
      // Parse.ly counts scroll as engagement: https://docs.parse.ly/engaged-time/
      if (currentlyScrolling) {
        debugLogger.log(
          '💓 [Parse.ly Heartbeat]',
          'Scroll engagement - Preventing inactivity check, continuing heartbeat (Parse.ly methodology)'
        )
      }

      if (!isEngaged) {
        setValue(isActive, false)
        const currentTimer = getValue(heartbeatTimer)
        if (currentTimer) {
          clearTimeout(currentTimer)
          setValue(heartbeatTimer, null)
        }

        const reason = timeSinceActivity > activeTimeoutMs ? 'inactivity' : 'max duration'
        debugLogger.warn('💓 [Parse.ly Heartbeat]', `💀 Heartbeat stopped - ${reason}`, {
          timeSinceActivity: `${timeSinceActivity}ms`,
          totalSessionTime: `${Math.floor((now - getValue(sessionStart)) / 1000)}s`
        })
        return
      }

      // Calculate engaged time since last heartbeat (Parse.ly methodology)
      const timeSinceLastHeartbeat = now - getValue(lastHeartbeatSent)
      const engagedTimeIncrement = Math.floor(timeSinceLastHeartbeat / 1000)

      // Update total engaged time
      setValue(totalEngagedTime, getValue(totalEngagedTime) + engagedTimeIncrement)
      setValue(lastHeartbeatSent, now)

      // Update heartbeat counter
      setTotalHeartbeats(prev => prev + 1)

      // Call Parse.ly onHeartbeat callback
      if (finalConfig.onHeartbeat) {
        finalConfig.onHeartbeat(engagedTimeIncrement)
      }

      debugLogger.success('💓 [Parse.ly Heartbeat]', '💓 Sending heartbeat event', {
        engagedTimeIncrement
      })
      debugLogger.info('💓 [Parse.ly Heartbeat]', `⏰ Next heartbeat scheduled in ${intervalMs}ms`)

      // Schedule next heartbeat check using Parse.ly interval
      setValue(heartbeatTimer, setTimeout(performHeartbeatCheck, intervalMs))
    },
    [finalConfig, activeTimeoutMs, intervalMs]
  )

  const performHeartbeatCheck = useCallback(() => {
    // For now, assume not scrolling (scroll detection not implemented yet)
    const currentlyScrolling = false
    performHeartbeatCheckInternal(currentlyScrolling)
  }, [performHeartbeatCheckInternal])

  // Start heartbeat tracking
  const startHeartbeat = useCallback(
    async (url?: string) => {
      if (!finalConfig.enableHeartbeats) {
        debugLogger.log('💓 [Parse.ly Heartbeat]', 'Heartbeats disabled - not starting tracking')
        return
      }

      try {
        // Start engagement tracking with Parse.ly SDK
        // FIXME: Check if url is required
        if (url) {
          await ExpoParsely.startEngagement(url)
          debugLogger.log('💓 [Parse.ly Heartbeat]', 'Started engagement tracking for URL:', url)
        } else {
          debugLogger.log(
            '💓 [Parse.ly Heartbeat]',
            'Started heartbeat without URL - manual engagement tracking required'
          )
        }

        runOnUI(() => {
          'worklet'
          isActive.value = true
          sessionStart.value = Date.now()
          lastActivity.value = Date.now()
        })()

        // Start the heartbeat loop
        performHeartbeatCheck()
      } catch (error) {
        debugLogger.error('💓 [Parse.ly Heartbeat]', 'Failed to start heartbeat:', error)
      }
    },
    [finalConfig, performHeartbeatCheck, debugLogger]
  )

  // Stop heartbeat tracking
  const stopHeartbeat = useCallback(async () => {
    if (!finalConfig.enableHeartbeats) return

    try {
      // Stop engagement tracking with Parse.ly SDK
      await ExpoParsely.stopEngagement()

      runOnUI(() => {
        'worklet'
        isActive.value = false
        const currentTimer = heartbeatTimer.value
        if (currentTimer) {
          clearInterval(currentTimer)
          heartbeatTimer.value = null
        }
      })()
    } catch (error) {
      debugLogger.error('💓 [Parse.ly Heartbeat]', 'Failed to stop heartbeat:', error)
    }
  }, [finalConfig, debugLogger])

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        debugLogger.log('💓 [Parse.ly Heartbeat]', 'App going to background - stopping heartbeat')
        stopHeartbeat()
      } else if (nextAppState === 'active' && !getValue(isActive)) {
        debugLogger.log(
          '💓 [Parse.ly Heartbeat]',
          'App coming to foreground - restarting heartbeat'
        )
        startHeartbeat()
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      debugLogger.log('💓 [Parse.ly Heartbeat]', 'useEffect cleanup - stopping heartbeat')
      subscription.remove()
      stopHeartbeat()
    }
  }, [startHeartbeat, stopHeartbeat, debugLogger])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat()
    }
  }, [stopHeartbeat])

  // Check heartbeat status
  const isHeartbeatActive = useCallback(async () => {
    return getValue(isActive)
  }, [isActive])

  // Parse.ly video tracking support
  const setVideoPlaying = useCallback(
    (playing: boolean) => {
      finalConfig.videoPlaying = playing
    },
    [finalConfig]
  )

  // Reset debug stats
  const resetStats = useCallback(() => {
    setTotalActivities(0)
    setTotalHeartbeats(0)
    debugLogger.debug('💓 [Parse.ly Heartbeat]', '💓 [HeartbeatDebug] Reset stats requested')
  }, [debugLogger])

  // Manual activity recording with logging
  const globalRecordActivity = useCallback(() => {
    if (!finalConfig.enableHeartbeats) return
    debugLogger.log('💓 [Parse.ly Heartbeat]', 'Manual activity recorded from external call')
    recordActivity()
  }, [finalConfig.enableHeartbeats, recordActivity, debugLogger])

  // Update debug context when stats change
  useEffect(() => {
    if (debugContext) {
      const sessionDuration = Math.floor((Date.now() - getValue(sessionStart)) / 1000)
      const lastActivityTimestamp = getValue(lastActivity)
      const isActiveNow = getValue(isActive)

      const formatLastActivity = (timestamp: number): string => {
        if (!timestamp || timestamp === getValue(sessionStart)) return 'Never'
        const seconds = Math.floor((Date.now() - timestamp) / 1000)
        if (seconds < 60) return `${seconds}s ago`
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        return `${hours}h ago`
      }

      debugContext.updateDebugData({
        stats: {
          isActive: isActiveNow,
          lastActivity: formatLastActivity(lastActivityTimestamp),
          sessionDuration,
          totalActivities,
          totalHeartbeats
        },
        resetStats,
        scrollState
      })
    }
  }, [debugContext, totalActivities, totalHeartbeats, scrollState, resetStats])

  // Log hook initialization
  useEffect(() => {
    debugLogger.log('💓 [Parse.ly Heartbeat]', 'Hook initialized with config:', finalConfig)
  }, [finalConfig, debugLogger])

  // Poll scroll state for debug overlay
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const scrolling = await ExpoParsely.isCurrentlyScrolling()
        setScrollState(scrolling)
      } catch {
        // Fallback if method not implemented yet
        setScrollState(false)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [debugLogger])

  // Expose debug information for HeartbeatDebugOverlay
  const getDebugInfo = useCallback(
    () => ({
      isActive: getValue(isActive),
      timeSinceActivity: Date.now() - getValue(lastActivity),
      totalEngagedTime: getValue(totalEngagedTime) * 1000, // Convert to milliseconds for consistency
      lastActivity: getValue(lastActivity),
      sessionStart: getValue(sessionStart)
    }),
    [isActive, lastActivity, totalEngagedTime, sessionStart]
  )

  return {
    startHeartbeat,
    stopHeartbeat,
    recordActivity: globalRecordActivity,
    isHeartbeatActive,
    isActive,
    setVideoPlaying,
    totalEngagedTime,
    getDebugInfo,
    config: finalConfig
  }
}

export default useReanimatedHeartbeat
