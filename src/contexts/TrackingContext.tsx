import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef } from 'react'

import ExpoParsely from '../ExpoParselyModule'
import { isDev } from '../constants'

// Tracking Context for overall app tracking
interface TrackingContextValue {
  trackPageView: (context?: Partial<Record<string, any>>) => void
  recordActivity: () => void
  recordHeartbeatActivity?: () => void // For heartbeat timer reset
  isActive: boolean
}

const TrackingContext = createContext<TrackingContextValue | null>(null)

export const useTrackingContext = () => {
  const context = useContext(TrackingContext)
  if (!context) {
    throw new Error('useTrackingContext must be used within a TrackingProvider')
  }
  return context
}

interface TrackingProviderProps extends PropsWithChildren {
  autoInitialize?: boolean
  siteId?: string
  flushInterval?: number
  dryRun?: boolean
  heartbeatConfig?: {
    enableHeartbeats?: boolean
    inactivityThresholdMs?: number
    intervalMs?: number
    maxDurationMs?: number
  }
  activityDetectionConfig?: {
    enableTouchDetection?: boolean
    enableScrollDetection?: boolean
    touchThrottleMs?: number
    scrollThrottleMs?: number
    scrollThreshold?: number
  }
  enableDebugLogging?: boolean
  recordHeartbeatActivity?: () => void // Handler for heartbeat timer reset
}

export const TrackingProvider: React.FC<TrackingProviderProps> = ({
  children,
  autoInitialize = true,
  siteId,
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
  enableDebugLogging = false,
  recordHeartbeatActivity
}) => {
  const isActive = useRef(true)

  useEffect(() => {
    if (autoInitialize && siteId) {
      try {
        ExpoParsely.init(siteId, {
          flushInterval,
          dryRun
        })

        if (isDev) {
          console.log('🔵 [TrackingProvider] Parse.ly initialized successfully')
        }
      } catch (error) {
        console.error('Failed to initialize Parse.ly:', error)
      }
    }
  }, [autoInitialize, siteId, flushInterval, dryRun, enableDebugLogging])

  const trackPageView = useCallback((context?: Partial<Record<string, any>>) => {
    try {
      if (context?.url) {
        ExpoParsely.trackPageView(context.url, undefined, {
          section: context.title || 'Unknown',
          title: context.title || ''
        })
      }
    } catch (error) {
      if (isDev) console.error('TrackingProvider trackPageView failed:', error)
    }
  }, [])

  const recordActivity = useCallback(() => {
    try {
      ExpoParsely.recordActivity()

      // Also trigger heartbeat timer reset if available
      recordHeartbeatActivity?.()

      if (isDev) {
        console.log('🎯 [TrackingProvider] Activity recorded and heartbeat timer reset')
      }
    } catch (error) {
      if (isDev) console.error('Failed to record activity:', error)
    }
  }, [recordHeartbeatActivity])

  const value: TrackingContextValue = {
    trackPageView,
    recordActivity,
    recordHeartbeatActivity,
    isActive: isActive.current
  }

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>
}

// Export the TrackingContext for backward compatibility
export { TrackingContext }
