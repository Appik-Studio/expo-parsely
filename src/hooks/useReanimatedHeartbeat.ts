import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'

// Try to import Reanimated, but gracefully handle if it's not available
let useSharedValue: any
let runOnUI: any
let hasReanimated = false

try {
  const reanimated = require('react-native-reanimated')
  useSharedValue = reanimated.useSharedValue
  runOnUI = reanimated.runOnUI
  hasReanimated = true
} catch (error) {
  // Fallback implementations when Reanimated is not available
  useSharedValue = (initialValue: any) => ({ value: initialValue })
  runOnUI = (fn: any) => fn
  hasReanimated = false
}

import type { HeartbeatConfig } from '../ExpoParsely.types'
import ExpoParsely from '../ExpoParselyModule'
import { HeartbeatDebugContext } from '../components/HeartbeatDebugOverlay'

// Simple debug logging function
const debugLog = (message: string, data?: any) => {
  if (__DEV__) {
    console.log(`💓 [Parse.ly Heartbeat] ${message}`, data || '')
  }
}

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
  const isActive = hasReanimated ? useSharedValue(false) : useRef(false)

  // Record activity (resets inactivity timer) - optimized with Reanimated
  const recordActivity = useCallback(() => {
    if (hasReanimated) {
      runOnUI(() => {
        'worklet'
        isActive.value = true
      })()
    } else {
      isActive.current = true
    }
  }, [])

  return { recordActivity, isActive: hasReanimated ? isActive.value : isActive.current }
}

export const useReanimatedHeartbeat = (config: Partial<HeartbeatConfig> = {}) => {
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

  // Use Reanimated shared values for better performance, or regular refs as fallback
  const heartbeatTimer = hasReanimated
    ? useSharedValue(null)
    : useRef<number | null>(null)
  const lastActivity = hasReanimated ? useSharedValue(Date.now()) : useRef(Date.now())
  const sessionStart = hasReanimated ? useSharedValue(Date.now()) : useRef(Date.now())
  const isActive = hasReanimated ? useSharedValue(false) : useRef(false)
  const lastHeartbeatSent = hasReanimated ? useSharedValue(Date.now()) : useRef(Date.now())
  const totalEngagedTime = hasReanimated ? useSharedValue(0) : useRef(0)

  // Helper functions to access values consistently
  const getValue = (ref: any) => (hasReanimated ? ref.value : ref.current)
  const setValue = (ref: any, value: any) => {
    if (hasReanimated) {
      ref.value = value
    } else {
      ref.current = value
    }
  }

  // Debug stats tracking
  const [totalActivities, setTotalActivities] = useState(0)
  const [totalHeartbeats, setTotalHeartbeats] = useState(0)
  const [scrollState, setScrollState] = useState(false)

  // Record activity (resets inactivity timer) - optimized with Reanimated
  const recordActivity = useCallback(() => {
    const activityFunction = () => {
      const now = Date.now()
      const previousActivity = getValue(lastActivity)
      const timeSincePrevious = now - previousActivity

      // Fast path: immediate shared value updates on UI thread
      const wasActive = getValue(isActive)
      setValue(lastActivity, now)

      setTotalActivities(prev => prev + 1)

      if (!wasActive) {
        setValue(isActive, true)
        debugLog('🎯 ACTIVITY DETECTED - SESSION ACTIVATED', {
          timeSincePrevious: `${timeSincePrevious}ms`,
          timestamp: now
        })
      } else {
        debugLog('🎯 ACTIVITY RECORDED', {
          timeSincePrevious: `${timeSincePrevious}ms`,
          timestamp: now
        })
      }
    }

    if (hasReanimated) {
      runOnUI(() => {
        'worklet'
        activityFunction()
      })()
    } else {
      activityFunction()
    }
  }, [hasReanimated])

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
        debugLog(
          'SCROLL ENGAGEMENT - Preventing inactivity check, continuing heartbeat (Parse.ly methodology)'
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
        debugLog(`💀 HEARTBEAT STOPPED - ${reason}`, {
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

      debugLog('💓 Sending heartbeat event', { engagedTimeIncrement })
      debugLog(`⏰ Next heartbeat scheduled in ${intervalMs}ms`)

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
        debugLog('Heartbeats disabled - not starting tracking')
        return
      }

      try {
        // Start engagement tracking with Parse.ly SDK
        if (url) {
          await ExpoParsely.startEngagement(url)
          debugLog('Started engagement tracking for URL:', url)
        } else {
          debugLog('Started heartbeat without URL - manual engagement tracking required')
        }

        const initFunction = () => {
          setValue(isActive, true)
          setValue(sessionStart, Date.now())
          setValue(lastActivity, Date.now())
        }

        if (hasReanimated) {
          runOnUI(() => {
            'worklet'
            initFunction()
          })()
        } else {
          initFunction()
        }

        // Start the heartbeat loop
        performHeartbeatCheck()
      } catch (error) {
        console.error('Failed to start heartbeat:', error)
      }
    },
    [finalConfig, performHeartbeatCheck, hasReanimated]
  )

  // Stop heartbeat tracking
  const stopHeartbeat = useCallback(async () => {
    if (!finalConfig.enableHeartbeats) return

    try {
      // Stop engagement tracking with Parse.ly SDK
      await ExpoParsely.stopEngagement()

      const stopFunction = () => {
        setValue(isActive, false)
        const currentTimer = getValue(heartbeatTimer)
        if (currentTimer) {
          clearInterval(currentTimer)
          setValue(heartbeatTimer, null)
        }
      }

      if (hasReanimated) {
        runOnUI(() => {
          'worklet'
          stopFunction()
        })()
      } else {
        stopFunction()
      }
    } catch (error) {
      console.error('Failed to stop heartbeat:', error)
    }
  }, [finalConfig, hasReanimated])

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        debugLog('App going to background - stopping heartbeat')
        stopHeartbeat()
      } else if (nextAppState === 'active' && !getValue(isActive)) {
        debugLog('App coming to foreground - restarting heartbeat')
        startHeartbeat()
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      debugLog('useEffect cleanup - stopping heartbeat')
      subscription.remove()
      stopHeartbeat()
    }
  }, [startHeartbeat, stopHeartbeat])

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
    debugLog('💓 [HeartbeatDebug] Reset stats requested')
  }, [])

  // Manual activity recording with logging
  const globalRecordActivity = useCallback(() => {
    if (!finalConfig.enableHeartbeats) return // Skip if heartbeats disabled

    debugLog('Manual activity recorded from external call')
    recordActivity()
  }, [finalConfig.enableHeartbeats, recordActivity])

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
    debugLog('Hook initialized with config:', finalConfig)
  }, [finalConfig])

  // Poll scroll state for debug overlay
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const scrolling = await ExpoParsely.isCurrentlyScrolling()
        setScrollState(scrolling)
      } catch (error) {
        // Fallback if method not implemented yet
        setScrollState(false)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

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
    isActive: isActive.value,
    setVideoPlaying, // Parse.ly video tracking
    totalEngagedTime: totalEngagedTime.value,
    getDebugInfo, // Debug information for overlay
    config: finalConfig
  }
}

export default useReanimatedHeartbeat
