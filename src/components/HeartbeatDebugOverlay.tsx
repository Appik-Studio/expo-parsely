import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'

import { isDev } from '../constants'
import ExpoParsely from '../ExpoParselyModule'
import Text from './Text'
import { useHeartbeatDebug } from '../hooks/useHeartbeatDebug'

const HeartbeatDebugOverlay = () => {
  const { resetStats, stats } = useHeartbeatDebug()
  const [isVisible, setIsVisible] = useState(false)
  const [position] = useState({ x: 20, y: 100 })
  const [scrollState, setScrollState] = useState(false)

  // Update scroll state every 100ms when visible
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setScrollState(ExpoParsely.isCurrentlyScrolling())
    }, 100)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isDev) return null

  return (
    <>
      <Pressable
        style={{
          position: 'absolute',
          right: 16,
          top: 64,
          zIndex: 50,
          height: 48,
          width: 48,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 24,
          backgroundColor: '#ef4444',
          opacity: 0.8
        }}
        onPress={() => setIsVisible(!isVisible)}>
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white' }}>💓</Text>
      </Pressable>

      {isVisible && (
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
            left: position.x,
            top: position.y
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
              Scrolling:{' '}
              <Text style={{ color: scrollState ? '#fb923c' : '#4ade80' }}>{scrollState ? 'YES' : 'NO'}</Text>
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
      )}
    </>
  )
}

export default HeartbeatDebugOverlay
