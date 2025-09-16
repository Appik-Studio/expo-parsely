import { useCallback, useEffect, useRef } from 'react'
import { GestureResponderEvent, View } from 'react-native'

import type { HeartbeatTouchBoundaryProps } from '../ExpoParsely.types'
import { heartbeatDebugStore } from '../stores/heartbeatDebugStore'
import { useTrackingContext } from './ParselyProvider'

let isGloballyScrolling = false
let globalScrollTimeoutId: ReturnType<typeof setTimeout> | null = null
export const isCurrentlyScrolling = isGloballyScrolling

const resetGlobalScrollState = () => {
  isGloballyScrolling = false
  heartbeatDebugStore.updateScrollState(false)
  if (globalScrollTimeoutId) {
    clearTimeout(globalScrollTimeoutId)
    globalScrollTimeoutId = null
  }
}

interface HeartbeatTouchBoundaryInternalProps extends HeartbeatTouchBoundaryProps {
  children: React.ReactNode
}

export const HeartbeatTouchBoundary: React.FC<HeartbeatTouchBoundaryInternalProps> = ({ children }) => {
  const { recordActivity } = useTrackingContext()

  const handleRecordActivity = useCallback(() => {
    recordActivity()
  }, [recordActivity])

  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const lastScrollActivityTime = useRef(0)

  const SCROLL_THRESHOLD = 5
  const SCROLL_ACTIVITY_THROTTLE_MS = 50
  const SCROLL_INACTIVITY_TIMEOUT_MS = 800

  const _onTouchStart = useCallback(
    (e: GestureResponderEvent): void => {
      touchStartY.current = e.nativeEvent.pageY
      touchStartX.current = e.nativeEvent.pageX
      isGloballyScrolling = false

      // Clear any existing global scroll inactivity timeout
      if (globalScrollTimeoutId) {
        clearTimeout(globalScrollTimeoutId)
        globalScrollTimeoutId = null
      }

      handleRecordActivity()
    },
    [handleRecordActivity]
  )

  const _onTouchMove = useCallback(
    (e: GestureResponderEvent): void => {
      // Calculate movement distance
      const deltaY = Math.abs(e.nativeEvent.pageY - touchStartY.current)
      const deltaX = Math.abs(e.nativeEvent.pageX - touchStartX.current)

      const isProbablyScrolling = deltaY > SCROLL_THRESHOLD && deltaY > deltaX

      if (isProbablyScrolling && !isGloballyScrolling) {
        isGloballyScrolling = true
        heartbeatDebugStore.updateScrollState(true)
        handleRecordActivity()
      }

      if (isGloballyScrolling) {
        if (globalScrollTimeoutId) {
          clearTimeout(globalScrollTimeoutId)
        }

        globalScrollTimeoutId = setTimeout(() => {
          resetGlobalScrollState()
        }, SCROLL_INACTIVITY_TIMEOUT_MS)

        const currentTime = Date.now()
        if (currentTime - lastScrollActivityTime.current >= SCROLL_ACTIVITY_THROTTLE_MS) {
          handleRecordActivity()
          lastScrollActivityTime.current = currentTime
        }
      }
    },
    [handleRecordActivity]
  )

  const _onTouchEnd = useCallback((): void => {
    resetGlobalScrollState()
  }, [])

  const _onTouchCancel = useCallback((): void => {
    if (isGloballyScrolling) {
      if (globalScrollTimeoutId) {
        clearTimeout(globalScrollTimeoutId)
      }

      const momentumTimeout = 5000
      globalScrollTimeoutId = setTimeout(() => {
        resetGlobalScrollState()
      }, momentumTimeout)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (globalScrollTimeoutId) {
        clearTimeout(globalScrollTimeoutId)
        globalScrollTimeoutId = null
      }
      isGloballyScrolling = false
      heartbeatDebugStore.updateScrollState(false)
    }
  }, [])

  return (
    <View
      style={{ flex: 1 }}
      onTouchCancel={_onTouchCancel}
      onTouchEnd={_onTouchEnd}
      onTouchMove={_onTouchMove}
      onTouchStart={_onTouchStart}>
      {children}
    </View>
  )
}

HeartbeatTouchBoundary.displayName = 'HeartbeatTouchBoundary'
