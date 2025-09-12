import { useCallback, useEffect, useState } from 'react'

import ExpoParsely from '../ExpoParselyModule'

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
  const [status, setStatus] = useState({
    isActive: false,
    lastActivity: 0,
    sessionDuration: 0,
    totalActivities: 0,
    totalHeartbeats: 0
  })
  const [startTime] = useState(Date.now())

  // Poll heartbeat status from the main system
  useEffect(() => {
    const interval = setInterval(() => {
      const currentStatus = ExpoParsely.getHeartbeatStatus()
      setStatus(currentStatus)
    }, 1000) // Poll every second

    return () => clearInterval(interval)
  }, [])

  // Determine if active based on recent activity (within last 5 seconds)
  const isActive = status.lastActivity > 0 && Date.now() - status.lastActivity < 5000

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
    // Note: Reset functionality would need to be implemented in the native module
    console.log('💓 [HeartbeatDebug] Reset stats requested - not yet implemented')
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
