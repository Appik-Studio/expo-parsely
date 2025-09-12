import { Component, PropsWithChildren, ReactNode } from 'react'
import { GestureResponderEvent, View } from 'react-native'

const isDev = __DEV__

interface HeartbeatTouchBoundaryProps extends PropsWithChildren {
  onTouchActivity?: () => void
}

let isGloballyScrolling = false

export const isCurrentlyScrolling = isGloballyScrolling

interface TouchState {
  isScrolling: boolean
}

export class HeartbeatTouchBoundary extends Component<HeartbeatTouchBoundaryProps> {
  public static displayName = 'HeartbeatTouchBoundary'

  public readonly name = 'HeartbeatTouchBoundary'

  private lastTouchMoveTime = 0
  private touchStartY = 0
  private touchStartX = 0
  private touchState: TouchState = {
    isScrolling: false
  }
  private readonly TOUCH_MOVE_THROTTLE_MS = 1000 // Only record touch move once per second
  private readonly SCROLL_THRESHOLD = 10 // Pixels - if a move is primarily vertical, consider it scrolling
  private readonly SCROLL_TIMEOUT_MS = 2000 // Reset scroll state after 2 seconds
  private scrollTimeoutId: ReturnType<typeof setTimeout> | null = null

  public componentWillUnmount(): void {
    // Clean up timeout to prevent memory leaks
    if (this.scrollTimeoutId) {
      clearTimeout(this.scrollTimeoutId)
      this.scrollTimeoutId = null
    }
    isGloballyScrolling = false
  }

  public render(): ReactNode {
    return (
      <View
        style={{ flex: 1 }}
        onTouchCancel={this._onTouchEnd}
        onTouchEnd={this._onTouchEnd}
        onTouchMove={this._onTouchMove}
        onTouchStart={this._onTouchStart}>
        {this.props.children}
      </View>
    )
  }

  private _onTouchStart = (e: GestureResponderEvent): void => {
    this.touchStartY = e.nativeEvent.pageY
    this.touchStartX = e.nativeEvent.pageX
    this.touchState.isScrolling = false
    isGloballyScrolling = false

    isDev && console.log('🎯 [HeartbeatTouchBoundary] Touch start detected - recording activity')
    this.props.onTouchActivity?.()
  }

  private _onTouchMove = (e: GestureResponderEvent): void => {
    // Calculate movement distance
    const deltaY = Math.abs(e.nativeEvent.pageY - this.touchStartY)
    const deltaX = Math.abs(e.nativeEvent.pageX - this.touchStartX)

    const isProbablyScrolling = deltaY > this.SCROLL_THRESHOLD && deltaY > deltaX

    if (isProbablyScrolling && !this.touchState.isScrolling) {
      this.touchState.isScrolling = true
      isGloballyScrolling = true

      // Set a timeout to reset scroll state in case touch events get lost
      if (this.scrollTimeoutId) {
        clearTimeout(this.scrollTimeoutId)
      }
      this.scrollTimeoutId = setTimeout(() => {
        isDev && console.log('🎯 [HeartbeatTouchBoundary] SCROLL TIMEOUT - Resetting scroll state')
        isGloballyScrolling = false
        this.touchState.isScrolling = false
      }, this.SCROLL_TIMEOUT_MS)

      isDev &&
        console.log(
          '🎯 [HeartbeatTouchBoundary] SCROLLING DETECTED - Recording as activity (Parse.ly compatible)'
        )
    }

    // Record activity for scroll and non-scroll movements (Parse.ly tracks scroll as engagement)
    // But throttle to prevent excessive events
    const currentTime = Date.now()
    if (currentTime - this.lastTouchMoveTime >= this.TOUCH_MOVE_THROTTLE_MS) {
      const activityType = this.touchState.isScrolling ? 'scroll' : 'touch move'
      isDev &&
        console.log(
          `🎯 [HeartbeatTouchBoundary] ${activityType.toUpperCase()} activity detected - recording (throttled)`
        )
      this.props.onTouchActivity?.()
      this.lastTouchMoveTime = currentTime
    }
  }

  private _onTouchEnd = (): void => {
    // Clear scroll timeout if it exists
    if (this.scrollTimeoutId) {
      clearTimeout(this.scrollTimeoutId)
      this.scrollTimeoutId = null
    }

    isDev &&
      (this.touchState.isScrolling || isGloballyScrolling) &&
      console.log(
        '🎯 [HeartbeatTouchBoundary] Touch ended - scroll gesture complete, resetting ALL state'
      )

    this.touchState.isScrolling = false
    isGloballyScrolling = false
  }
}

export default HeartbeatTouchBoundary
