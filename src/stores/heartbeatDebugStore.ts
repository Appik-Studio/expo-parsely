import { useCallback, useEffect, useState } from 'react'

// Types
export interface HeartbeatDebugData {
  stats: {
    isActive: boolean
    lastActivity: string
    sessionDuration: number
    totalActivities: number
    totalHeartbeats: number
    timeSinceLastActivity: number
    totalEngagedTime: number
    heartbeatSessionActive: boolean
  }
  scrollState: boolean
}

export interface HeartbeatDebugStore extends HeartbeatDebugData {
  // Actions
  updateStats: (stats: Partial<HeartbeatDebugData['stats']>) => void
  updateScrollState: (scrolling: boolean) => void
  resetStats: () => void
  updateDebugData: (data: Partial<HeartbeatDebugData>) => void
}

// Singleton store instance
class HeartbeatDebugStoreSingleton {
  private listeners: Set<() => void> = new Set()
  private data: HeartbeatDebugData = {
    stats: {
      isActive: false,
      lastActivity: 'Never',
      sessionDuration: 0,
      totalActivities: 0,
      totalHeartbeats: 0,
      timeSinceLastActivity: 0,
      totalEngagedTime: 0,
      heartbeatSessionActive: false
    },
    scrollState: false
  }

  // Subscribe to changes
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Get current data
  getData = (): HeartbeatDebugData => {
    return { ...this.data }
  }

  // Update stats
  updateStats = (stats: Partial<HeartbeatDebugData['stats']>) => {
    this.data.stats = { ...this.data.stats, ...stats }
    this.notify()
  }

  updateScrollState = (scrolling: boolean) => {
    this.data.scrollState = scrolling
    this.notify()
  }

  // Reset stats
  resetStats = () => {
    this.data.stats = {
      isActive: false,
      lastActivity: 'Never',
      sessionDuration: 0,
      totalActivities: 0,
      totalHeartbeats: 0,
      timeSinceLastActivity: 0,
      totalEngagedTime: 0,
      heartbeatSessionActive: false
    }
    this.notify()
  }

  // Update entire debug data
  updateDebugData = (newData: Partial<HeartbeatDebugData>) => {
    if (newData.stats) {
      this.data.stats = { ...this.data.stats, ...newData.stats }
    }
    if (newData.scrollState !== undefined) {
      this.data.scrollState = newData.scrollState
    }
    this.notify()
  }

  // Notify all listeners
  private notify = () => {
    this.listeners.forEach(listener => listener())
  }
}

// Create singleton instance
const heartbeatDebugStoreInstance = new HeartbeatDebugStoreSingleton()

// React hook to use the store
export const useHeartbeatDebugStore = (): HeartbeatDebugStore => {
  const [, forceUpdate] = useState({})

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = heartbeatDebugStoreInstance.subscribe(() => {
      forceUpdate({})
    })

    return unsubscribe
  }, [])

  return {
    ...heartbeatDebugStoreInstance.getData(),
    updateStats: useCallback(stats => heartbeatDebugStoreInstance.updateStats(stats), []),
    updateScrollState: useCallback(
      scrolling => heartbeatDebugStoreInstance.updateScrollState(scrolling),
      []
    ),
    resetStats: useCallback(() => heartbeatDebugStoreInstance.resetStats(), []),
    updateDebugData: useCallback(data => heartbeatDebugStoreInstance.updateDebugData(data), [])
  }
}

// Direct access to store instance for non-React usage
export const heartbeatDebugStore = {
  getData: heartbeatDebugStoreInstance.getData,
  updateStats: heartbeatDebugStoreInstance.updateStats,
  updateScrollState: heartbeatDebugStoreInstance.updateScrollState,
  resetStats: heartbeatDebugStoreInstance.resetStats,
  updateDebugData: heartbeatDebugStoreInstance.updateDebugData,
  subscribe: heartbeatDebugStoreInstance.subscribe
}
