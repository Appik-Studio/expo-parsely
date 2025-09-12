import { forwardRef, useCallback } from 'react'
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native'

import { useElementTracking } from '../hooks/useElementTracking'
import { useTrackingHierarchy } from '../hooks/useTrackingHierarchy'

const isDev = __DEV__

interface TrackableTouchableProps extends TouchableOpacityProps {
  componentName?: string
  trackingId?: string
  elementType?: string
  trackImpressions?: boolean
  trackViews?: boolean
  viewThreshold?: number
}

const TrackableTouchable = forwardRef<View, TrackableTouchableProps>(
  (
    {
      componentName,
      elementType = 'button',
      onPress,
      trackImpressions = false,
      trackingId,
      trackViews = false,
      viewThreshold = 1000,
      ...props
    },
    ref
  ) => {
    // Register in tracking hierarchy if componentName is provided
    useTrackingHierarchy({
      componentName: componentName || 'Touchable',
      disabled: !componentName,
      trackingId
    })

    // Always call useElementTracking (hooks must be called unconditionally)
    // but only track if trackingId is provided and tracking is enabled
    const elementTracking = useElementTracking({
      elementId: trackingId || '',
      elementType,
      trackImpressions: trackImpressions && !!trackingId,
      trackViews: trackViews && !!trackingId,
      viewThreshold
    })

    const handlePress = useCallback(
      (event: any) => {
        if (isDev) {
          console.log(`🎯 [TrackableTouchable] Button press activity recorded`)
        }

        if (trackingId) {
          elementTracking.trackClick()
        }

        onPress?.(event)
      },
      [trackingId, elementTracking, onPress]
    )

    return <TouchableOpacity ref={ref} onPress={handlePress} {...props} />
  }
)

export default TrackableTouchable
