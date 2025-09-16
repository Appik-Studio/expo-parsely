import React, { useCallback, useRef } from 'react'
import { GestureResponderEvent, View } from 'react-native'

import type { HeartbeatTouchBoundaryProps } from '../ExpoParsely.types'
import ExpoParsely from '../ExpoParselyModule'
import { useDebugLogger } from '../utils/debugLogger'

let isGloballyScrolling = false
export const isCurrentlyScrolling = isGloballyScrolling

interface TouchState {
  isScrolling: boolean
}

interface HeartbeatTouchBoundaryInternalProps extends HeartbeatTouchBoundaryProps {
  children: React.ReactNode
}

export const HeartbeatTouchBoundary: React.FC<HeartbeatTouchBoundaryInternalProps> = ({ children }) => {
  const debugLogger = useDebugLogger()

  // Record activity function - calls Parse.ly native recordActivity method
  const recordActivity = useCallback(() => {
    debugLogger.log('🎯 [HeartbeatTouchBoundary]', 'Recording activity with Parse.ly')
    ExpoParsely.recordActivity()
  }, [debugLogger])

  const lastTouchMoveTime = useRef(0)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const touchState = useRef<TouchState>({ isScrolling: false })
  const scrollTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null)

  const TOUCH_MOVE_THROTTLE_MS = 1000 // Only record touch move once per second
  const SCROLL_THRESHOLD = 10 // Pixels - if a move is primarily vertical, consider it scrolling
  const SCROLL_TIMEOUT_MS = 2000 // Reset scroll state after 2 seconds

  const _onTouchStart = useCallback(
    (e: GestureResponderEvent): void => {
      touchStartY.current = e.nativeEvent.pageY
      touchStartX.current = e.nativeEvent.pageX
      touchState.current.isScrolling = false
      isGloballyScrolling = false

      debugLogger.success('🎯 [HeartbeatTouchBoundary]', 'Touch start - recording activity')
      recordActivity()
    },
    [debugLogger, recordActivity]
  )

  const _onTouchMove = useCallback(
    (e: GestureResponderEvent): void => {
      // Calculate movement distance
      const deltaY = Math.abs(e.nativeEvent.pageY - touchStartY.current)
      const deltaX = Math.abs(e.nativeEvent.pageX - touchStartX.current)

      const isProbablyScrolling = deltaY > SCROLL_THRESHOLD && deltaY > deltaX

      if (isProbablyScrolling && !touchState.current.isScrolling) {
        touchState.current.isScrolling = true
        isGloballyScrolling = true

        // Set a timeout to reset scroll state in case touch events get lost
        if (scrollTimeoutId.current) {
          clearTimeout(scrollTimeoutId.current)
        }
        scrollTimeoutId.current = setTimeout(() => {
          debugLogger.log('🎯 [HeartbeatTouchBoundary]', 'Scroll timeout - resetting state')
          isGloballyScrolling = false
          touchState.current.isScrolling = false
        }, SCROLL_TIMEOUT_MS)

        debugLogger.info('🎯 [HeartbeatTouchBoundary]', 'Scrolling detected - recording activity')
      }

      // Record activity for scroll and non-scroll movements (Parse.ly tracks scroll as engagement)
      // But throttle to prevent excessive events
      const currentTime = Date.now()
      if (currentTime - lastTouchMoveTime.current >= TOUCH_MOVE_THROTTLE_MS) {
        debugLogger.debug('🎯 [HeartbeatTouchBoundary]', 'Touch move - recording activity (throttled)')
        recordActivity()
        lastTouchMoveTime.current = currentTime
      }
    },
    [debugLogger, recordActivity]
  )

  const _onTouchEnd = useCallback((): void => {
    // Clear scroll timeout if it exists
    if (scrollTimeoutId.current) {
      clearTimeout(scrollTimeoutId.current)
      scrollTimeoutId.current = null
    }

    if (touchState.current.isScrolling || isGloballyScrolling) {
      debugLogger.log('🎯 [HeartbeatTouchBoundary]', 'Touch ended - resetting scroll state')
    }

    touchState.current.isScrolling = false
    isGloballyScrolling = false
  }, [debugLogger])

  React.useEffect(() => {
    return () => {
      // Clean up timeout to prevent memory leaks
      if (scrollTimeoutId.current) {
        clearTimeout(scrollTimeoutId.current)
        scrollTimeoutId.current = null
      }
      isGloballyScrolling = false
    }
  }, [])

  return (
    <View
      style={{ flex: 1 }}
      onTouchCancel={_onTouchEnd}
      onTouchEnd={_onTouchEnd}
      onTouchMove={_onTouchMove}
      onTouchStart={_onTouchStart}>
      {children}
    </View>
  )
}

HeartbeatTouchBoundary.displayName = 'HeartbeatTouchBoundary'
