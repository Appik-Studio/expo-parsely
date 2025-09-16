import { FC, ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'

import { useHeartbeatDebugStore } from '../stores/heartbeatDebugStore'

// Provider component that initializes the store
export const HeartbeatDebugProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // No need for scroll state polling - it's handled by HeartbeatTouchBoundary
  return <>{children}</>
}

const HeartbeatDebugOverlay = () => {
  const { stats, scrollState, resetStats } = useHeartbeatDebugStore()

  // Time updates are now handled by the heartbeat hook

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
          Status:{' '}
          <Text style={{ color: stats.isActive ? '#4ade80' : '#f87171' }}>
            {stats.isActive ? 'Active' : 'Inactive'}
          </Text>
        </Text>

        <Text style={{ fontSize: 12, color: 'white' }}>
          Activities: <Text style={{ color: '#60a5fa' }}>{stats.totalActivities}</Text>
        </Text>

        <Text style={{ fontSize: 12, color: 'white' }}>
          Heartbeats: <Text style={{ color: '#a78bfa' }}>{stats.totalHeartbeats}</Text>
        </Text>

        <Text style={{ fontSize: 12, color: 'white' }}>
          Duration: <Text style={{ color: '#fbbf24' }}>{stats.sessionDuration}s</Text>
        </Text>

        <Text style={{ fontSize: 12, color: 'white' }}>
          Last Activity: <Text style={{ color: '#9ca3af' }}>{stats.lastActivity}</Text>
        </Text>

        <Text style={{ fontSize: 12, color: 'white' }}>
          Scrolling: <Text style={{ color: scrollState ? '#fb923c' : '#4ade80' }}>{scrollState ? 'YES' : 'NO'}</Text>
        </Text>

        <Text style={{ fontSize: 12, color: 'white' }}>
          Since Activity: <Text style={{ color: '#f59e0b' }}>{stats.timeSinceLastActivity}s</Text>
        </Text>

        <Text style={{ fontSize: 12, color: 'white' }}>
          Engaged Time: <Text style={{ color: '#10b981' }}>{stats.totalEngagedTime}s</Text>
        </Text>

        <Text style={{ fontSize: 12, color: 'white' }}>
          Session:{' '}
          <Text style={{ color: stats.heartbeatSessionActive ? '#4ade80' : '#f87171' }}>
            {stats.heartbeatSessionActive ? 'Active' : 'Inactive'}
          </Text>
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
        onPress={resetStats}>
        <Text style={{ textAlign: 'center', fontSize: 12, color: 'white' }}>Reset</Text>
      </Pressable>
    </View>
  )
}

export default HeartbeatDebugOverlay
