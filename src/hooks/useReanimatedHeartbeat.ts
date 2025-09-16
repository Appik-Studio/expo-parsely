import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'

import type { HeartbeatConfig } from '../ExpoParsely.types'
import ExpoParsely from '../ExpoParselyModule'
import { heartbeatDebugStore } from '../stores/heartbeatDebugStore'
import { useDebugLogger } from '../utils/debugLogger'

const DEFAULT_HEARTBEAT_CONFIG: Required<HeartbeatConfig> = {
  enableHeartbeats: true,
  secondsBetweenHeartbeats: 150,
  activeTimeout: 5,
  onHeartbeat: () => {},
  videoPlaying: false
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

  const intervalMs = finalConfig.secondsBetweenHeartbeats * 1000
  const activeTimeoutMs = finalConfig.activeTimeout * 1000

  // Shared values for UI thread access
  const lastActivity = useSharedValue(0)
  const isActive = useSharedValue(false)

  // JS thread state
  const [sessionActive, setSessionActive] = useState(false)
  const [totalActivities, setTotalActivities] = useState(0)
  const [totalHeartbeats, setTotalHeartbeats] = useState(0)
  const [debugInfo, setDebugInfo] = useState({
    isActive: false,
    lastActivity: 0,
    sessionStart: 0,
    totalEngagedTime: 0
  })

  // Refs for timer management
  const heartbeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sessionStartRef = useRef(0)
  const lastHeartbeatRef = useRef(0)
  const totalEngagedTimeRef = useRef(0)

  // Clear any existing timer
  const clearHeartbeatTimer = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearTimeout(heartbeatTimerRef.current)
      heartbeatTimerRef.current = null
    }
  }, [])

  // Send heartbeat and schedule next one
  const sendHeartbeat = useCallback(() => {
    if (!sessionActive) return

    const now = Date.now()
    const timeSinceActivity = now - lastActivity.value
    const isEngaged = finalConfig.videoPlaying || timeSinceActivity <= activeTimeoutMs

    if (!isEngaged) {
      debugLogger.warn('💓 [Parse.ly Heartbeat]', 'Session inactive - stopping heartbeat')
      setSessionActive(false)
      isActive.value = false
      return
    }

    // Calculate engaged time increment
    const timeSinceLastHeartbeat = now - lastHeartbeatRef.current
    const engagedTimeIncrement = Math.floor(timeSinceLastHeartbeat / 1000)

    // Update totals
    totalEngagedTimeRef.current += engagedTimeIncrement
    lastHeartbeatRef.current = now

    setTotalHeartbeats(prev => prev + 1)
    setDebugInfo(prev => ({
      ...prev,
      totalEngagedTime: totalEngagedTimeRef.current
    }))

    // Call user callback
    if (finalConfig.onHeartbeat) {
      finalConfig.onHeartbeat(engagedTimeIncrement)
    }

    debugLogger.success('💓 [Parse.ly Heartbeat]', '💓 Heartbeat sent', {
      engagedTimeIncrement,
      totalEngagedTime: totalEngagedTimeRef.current
    })

    // Schedule next heartbeat
    heartbeatTimerRef.current = setTimeout(sendHeartbeat, intervalMs)
  }, [
    sessionActive,
    finalConfig.videoPlaying,
    finalConfig.onHeartbeat,
    activeTimeoutMs,
    intervalMs,
    debugLogger
  ])

  // Record activity
  const recordActivity = useCallback(() => {
    if (!finalConfig.enableHeartbeats) return

    const now = Date.now()
    const wasActive = isActive.value

    lastActivity.value = now
    isActive.value = true

    setTotalActivities(prev => prev + 1)
    setDebugInfo(prev => ({
      ...prev,
      isActive: true,
      lastActivity: now
    }))

    if (!wasActive) {
      debugLogger.success('💓 [Parse.ly Heartbeat]', '🎯 ACTIVITY DETECTED - SESSION ACTIVATED')
    }
  }, [finalConfig.enableHeartbeats, debugLogger])

  // Start heartbeat session
  const startHeartbeat = useCallback(
    async (url?: string) => {
      if (!finalConfig.enableHeartbeats) {
        debugLogger.log('💓 [Parse.ly Heartbeat]', 'Heartbeats disabled')
        return
      }

      if (sessionActive) {
        debugLogger.log('💓 [Parse.ly Heartbeat]', 'Session already active')
        return
      }

      try {
        if (url) {
          await ExpoParsely.startEngagement(url)
          debugLogger.log('💓 [Parse.ly Heartbeat]', 'Started engagement tracking for:', url)
        }

        const now = Date.now()

        // Initialize session
        sessionStartRef.current = now
        lastHeartbeatRef.current = now
        totalEngagedTimeRef.current = 0
        lastActivity.value = now
        isActive.value = true

        setSessionActive(true)
        setDebugInfo({
          isActive: true,
          lastActivity: now,
          sessionStart: now,
          totalEngagedTime: 0
        })

        debugLogger.log('💓 [Parse.ly Heartbeat]', 'Heartbeat session started')

        // Start heartbeat loop
        heartbeatTimerRef.current = setTimeout(sendHeartbeat, intervalMs)
      } catch (error) {
        debugLogger.error('💓 [Parse.ly Heartbeat]', 'Failed to start heartbeat:', error)
      }
    },
    [finalConfig.enableHeartbeats, sessionActive, intervalMs, sendHeartbeat, debugLogger]
  )

  // Stop heartbeat session
  const stopHeartbeat = useCallback(async () => {
    if (!sessionActive) {
      debugLogger.log('💓 [Parse.ly Heartbeat]', 'No active session to stop')
      return
    }

    try {
      clearHeartbeatTimer()
      await ExpoParsely.stopEngagement()

      setSessionActive(false)
      isActive.value = false

      setDebugInfo(prev => ({
        ...prev,
        isActive: false
      }))

      debugLogger.log('💓 [Parse.ly Heartbeat]', 'Heartbeat session stopped')
    } catch (error) {
      debugLogger.error('💓 [Parse.ly Heartbeat]', 'Failed to stop heartbeat:', error)
    }
  }, [sessionActive, clearHeartbeatTimer, debugLogger])

  // Video playing state
  const setVideoPlaying = useCallback(
    (playing: boolean) => {
      finalConfig.videoPlaying = playing
      debugLogger.log('💓 [Parse.ly Heartbeat]', `Video playing: ${playing}`)
    },
    [finalConfig, debugLogger]
  )

  // App state handling - use refs to avoid dependency loops
  const startHeartbeatRef = useRef(startHeartbeat)
  const stopHeartbeatRef = useRef(stopHeartbeat)

  useEffect(() => {
    startHeartbeatRef.current = startHeartbeat
    stopHeartbeatRef.current = stopHeartbeat
  })

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      debugLogger.log('💓 [Parse.ly Heartbeat]', `App state: ${nextAppState}`)

      if (nextAppState === 'background') {
        stopHeartbeatRef.current()
      } else if (nextAppState === 'active' && !sessionActive) {
        startHeartbeatRef.current()
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => {
      subscription.remove()
      stopHeartbeatRef.current()
    }
  }, [sessionActive, debugLogger])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHeartbeatTimer()
      stopHeartbeat()
    }
  }, [clearHeartbeatTimer, stopHeartbeat])

  // Update debug store when key data changes
  useEffect(() => {
    const now = Date.now()
    const sessionDuration = debugInfo.sessionStart
      ? Math.floor((now - debugInfo.sessionStart) / 1000)
      : 0
    const timeSinceLastActivity = debugInfo.lastActivity
      ? Math.floor((now - debugInfo.lastActivity) / 1000)
      : 0

    const formatLastActivity = (timestamp: number): string => {
      if (!timestamp) return 'Never'
      const seconds = Math.floor((now - timestamp) / 1000)
      if (seconds < 60) return `${seconds}s ago`
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return `${minutes}m ago`
      const hours = Math.floor(minutes / 60)
      return `${hours}h ago`
    }

    heartbeatDebugStore.updateDebugData({
      stats: {
        isActive: debugInfo.isActive,
        lastActivity: formatLastActivity(debugInfo.lastActivity),
        sessionDuration,
        totalActivities,
        totalHeartbeats,
        timeSinceLastActivity,
        totalEngagedTime: Math.floor(debugInfo.totalEngagedTime),
        heartbeatSessionActive: sessionActive
      }
    })
  }, [
    debugInfo.isActive,
    debugInfo.lastActivity,
    debugInfo.sessionStart,
    debugInfo.totalEngagedTime,
    totalActivities,
    totalHeartbeats,
    sessionActive
  ])

  // Update debug store every second for time-sensitive values only
  useEffect(() => {
    const interval = setInterval(() => {
      // Only update time-sensitive values to avoid dependency loops
      const now = Date.now()
      const sessionDuration = debugInfo.sessionStart
        ? Math.floor((now - debugInfo.sessionStart) / 1000)
        : 0
      const timeSinceLastActivity = debugInfo.lastActivity
        ? Math.floor((now - debugInfo.lastActivity) / 1000)
        : 0

      const formatLastActivity = (timestamp: number): string => {
        if (!timestamp) return 'Never'
        const seconds = Math.floor((now - timestamp) / 1000)
        if (seconds < 60) return `${seconds}s ago`
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        return `${hours}h ago`
      }

      heartbeatDebugStore.updateStats({
        lastActivity: formatLastActivity(debugInfo.lastActivity),
        sessionDuration,
        timeSinceLastActivity
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [debugInfo.sessionStart, debugInfo.lastActivity])

  // Debug info getter
  const getDebugInfo = useCallback(() => {
    const now = Date.now()
    return {
      isActive: debugInfo.isActive,
      timeSinceActivity: debugInfo.lastActivity ? now - debugInfo.lastActivity : 0,
      totalEngagedTime: debugInfo.totalEngagedTime * 1000,
      lastActivity: debugInfo.lastActivity,
      sessionStart: debugInfo.sessionStart
    }
  }, [debugInfo])

  return {
    startHeartbeat,
    stopHeartbeat,
    recordActivity,
    isHeartbeatActive: () => debugInfo.isActive,
    isActive: debugInfo.isActive,
    setVideoPlaying,
    totalEngagedTime: debugInfo.totalEngagedTime,
    getDebugInfo,
    config: finalConfig
  }
}

export default useReanimatedHeartbeat
