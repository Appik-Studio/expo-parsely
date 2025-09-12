import { useCallback, useState } from 'react'
import { useHeartbeat } from './useHeartbeat'

interface HeartbeatDebugStats {
  isActive: boolean
  lastActivity: string
  sessionDuration: number
  totalActivities: number
  totalHeartbeats: number
}

interface UseHeartbeatDebugReturn {
  stats: HeartbeatDebugStats
  resetStats: () => void
}

export const useHeartbeatDebug = (): UseHeartbeatDebugReturn => {
  const heartbeatHook = useHeartbeat({
    enabled: true,
    heartbeatConfig: {
      enableHeartbeats: true,
      inactivityThresholdMs: 5000,
      intervalMs: 150000,
    },
    activityConfig: {
      enableTouchDetection: true,
      enableScrollDetection: true,
    }
  })

  const [startTime] = useState(Date.now())
  
  // Extract status and determine if active based on recent activity
  const status = heartbeatHook.status
  const isActive = status.lastActivity > 0 && (Date.now() - status.lastActivity) < 5000

  const formatLastActivity = useCallback((timestamp: number): string => {
    if (!timestamp) return 'Never'
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }, [])

  const resetStats = useCallback(() => {
    // Note: This would ideally reset the actual heartbeat stats
    // For now, it's a placeholder - the actual reset would need to be implemented
    // in the native module
    console.log('💓 [HeartbeatDebug] Reset stats requested')
  }, [])

  const stats: HeartbeatDebugStats = {
    isActive,
    lastActivity: formatLastActivity(status.lastActivity),
    sessionDuration: Math.floor((Date.now() - startTime) / 1000),
    totalActivities: status.totalActivities,
    totalHeartbeats: status.totalHeartbeats
  }

  return {
    stats,
    resetStats
  }
}
