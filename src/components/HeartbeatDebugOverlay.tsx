import { FC, ReactNode, useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { useHeartbeatDebugStore } from '../stores/heartbeatDebugStore'
import { heartbeatManager } from '../utils/HeartbeatManager'

// Provider component that initializes the store
export const HeartbeatDebugProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // No need for scroll state polling - it's handled by HeartbeatTouchBoundary
  return <>{children}</>
}

const HeartbeatDebugOverlay = () => {
  const { scrollState, resetStats } = useHeartbeatDebugStore()
  const [managerStats, setManagerStats] = useState(heartbeatManager.getStats())

  // Update stats from heartbeat manager
  useEffect(() => {
    const interval = setInterval(() => {
      setManagerStats(heartbeatManager.getStats())
    }, 200)

    return () => clearInterval(interval)
  }, [])

  // Format last activity
  const formatLastActivity = (timestamp: number): string => {
    if (!timestamp) return 'Never'
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  // Calculate derived stats
  const sessionDuration = managerStats.sessionStart ? Math.floor((Date.now() - managerStats.sessionStart) / 1000) : 0
  const timeSinceLastActivity = managerStats.lastActivity
    ? Math.floor((Date.now() - managerStats.lastActivity) / 1000)
    : 0
  const isActive = managerStats.lastActivity && timeSinceLastActivity <= 5

  return (
    <View
      style={{
        position: 'absolute',
        zIndex: 40,
        minWidth: 192,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        borderColor: '#333',
        borderWidth: 1,
        left: 20,
        top: 100
      }}>
      <Text style={{ marginBottom: 8, fontSize: 12, fontWeight: 'bold', color: 'white' }}>💓 Heartbeat Debug</Text>

      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 12, color: 'white' }}>
          Status: <Text style={{ color: isActive ? '#4ade80' : '#f87171' }}>{isActive ? 'Active' : 'Inactive'}</Text>
        </Text>

        <Text style={{ fontSize: 12, color: 'white' }}>
          Heartbeats: <Text style={{ color: '#a78bfa' }}>{managerStats.heartbeatCount}</Text>
        </Text>

        <Text style={{ fontSize: 12, color: 'white' }}>
          Duration: <Text style={{ color: '#fbbf24' }}>{sessionDuration}s</Text>
        </Text>

        <Text style={{ fontSize: 12, color: 'white' }}>
          Last Activity: <Text style={{ color: '#9ca3af' }}>{formatLastActivity(managerStats.lastActivity)}</Text>
        </Text>

        <Text style={{ fontSize: 12, color: 'white' }}>
          Scrolling: <Text style={{ color: scrollState ? '#fb923c' : '#4ade80' }}>{scrollState ? 'YES' : 'NO'}</Text>
        </Text>

        <Text style={{ fontSize: 12, color: 'white' }}>
          Since Activity: <Text style={{ color: '#f59e0b' }}>{timeSinceLastActivity}s</Text>
        </Text>

        <Text style={{ fontSize: 12, color: 'white' }}>
          Engaged Time: <Text style={{ color: '#10b981' }}>{managerStats.totalEngagedTime}s</Text>
        </Text>
      </View>

      <Pressable
        style={{
          marginTop: 12,
          borderRadius: 4,
          backgroundColor: '#dc2626',
          paddingHorizontal: 8,
          paddingVertical: 4
        }}
        onPress={() => {
          heartbeatManager.reset()
          resetStats()
        }}>
        <Text style={{ textAlign: 'center', fontSize: 12, color: 'white' }}>Reset</Text>
      </Pressable>
    </View>
  )
}

export default HeartbeatDebugOverlay
