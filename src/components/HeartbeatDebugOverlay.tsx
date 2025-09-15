import React, { createContext, useContext, useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import ExpoParsely from '../ExpoParselyModule'

// Heartbeat debug context
interface HeartbeatDebugContextType {
  stats: {
    isActive: boolean
    lastActivity: string
    sessionDuration: number
    totalActivities: number
    totalHeartbeats: number
  }
  resetStats: () => void
  scrollState: boolean
}

interface HeartbeatDebugContextValue extends HeartbeatDebugContextType {
  updateDebugData: (newData: Partial<HeartbeatDebugContextType>) => void
}

export const HeartbeatDebugContext = createContext<HeartbeatDebugContextValue | null>(null)

export const useHeartbeatDebugContext = () => {
  const context = useContext(HeartbeatDebugContext)
  if (!context) {
    throw new Error('useHeartbeatDebugContext must be used within a HeartbeatDebugProvider')
  }
  return context
}

// Hook for accessing debug data (used by HeartbeatDebugOverlay)
export const useHeartbeatDebug = () => {
  const context = useContext(HeartbeatDebugContext)
  if (!context) {
    throw new Error('useHeartbeatDebug must be used within a HeartbeatDebugProvider')
  }

  const { stats, resetStats, scrollState, updateDebugData } = context
  return { stats, resetStats, scrollState, updateDebugData }
}

export const HeartbeatDebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [debugData, setDebugData] = useState<HeartbeatDebugContextType>({
    stats: {
      isActive: false,
      lastActivity: 'Never',
      sessionDuration: 0,
      totalActivities: 0,
      totalHeartbeats: 0
    },
    resetStats: () => {},
    scrollState: false
  })

  const value: HeartbeatDebugContextValue = {
    ...debugData,
    updateDebugData: (newData: Partial<HeartbeatDebugContextType>) => {
      setDebugData(prev => ({ ...prev, ...newData }))
    }
  }

  return <HeartbeatDebugContext.Provider value={value}>{children}</HeartbeatDebugContext.Provider>
}

const isDev = __DEV__

const HeartbeatDebugOverlay = () => {
  const { resetStats, stats } = useHeartbeatDebug()
  const [scrollState, setScrollState] = useState(false)

  // Update scroll state every 100ms
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

  if (!isDev) return null

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
