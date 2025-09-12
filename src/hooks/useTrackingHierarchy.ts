import { useEffect, useRef } from 'react'

import type { TrackingHierarchyConfig } from '../ExpoParsely.types'
import ExpoParsely from '../ExpoParselyModule'

export interface UseTrackingHierarchyOptions extends TrackingHierarchyConfig {
  /** Whether to disable tracking for this component */
  disabled?: boolean
}

export interface UseTrackingHierarchyReturn {
  /** The tracking ID assigned to this component */
  trackingId: string
  /** Whether the component is currently registered */
  isRegistered: boolean
}

/**
 * Generic hook for registering components in the tracking hierarchy
 * Enables hierarchical analytics tracking with component relationships
 */
export const useTrackingHierarchy = ({
  componentName,
  testID,
  accessibilityLabel,
  trackingId,
  props,
  disabled = false
}: UseTrackingHierarchyOptions): UseTrackingHierarchyReturn => {
  const registeredTrackingId = useRef<string>('')
  const isRegisteredRef = useRef(false)

  useEffect(() => {
    if (disabled) {
      // If disabled, unregister if previously registered
      if (isRegisteredRef.current && registeredTrackingId.current) {
        ExpoParsely.unregisterComponentTracking(registeredTrackingId.current)
        registeredTrackingId.current = ''
        isRegisteredRef.current = false
      }
      return
    }

    // Register the component
    const config: TrackingHierarchyConfig = {
      componentName,
      testID,
      accessibilityLabel,
      trackingId,
      props
    }

    registeredTrackingId.current = ExpoParsely.registerComponentTracking(config)
    isRegisteredRef.current = true

    // Cleanup on unmount
    return () => {
      if (registeredTrackingId.current) {
        ExpoParsely.unregisterComponentTracking(registeredTrackingId.current)
        registeredTrackingId.current = ''
        isRegisteredRef.current = false
      }
    }
  }, [componentName, testID, accessibilityLabel, trackingId, props, disabled])

  return {
    trackingId: registeredTrackingId.current,
    isRegistered: isRegisteredRef.current
  }
}

export default useTrackingHierarchy
