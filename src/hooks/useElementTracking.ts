import { useCallback, useEffect, useRef, useState } from "react";
import ExpoParsely from "../ExpoParselyModule";
import type { ElementTrackingConfig } from "../ExpoParsely.types";

export interface UseElementTrackingOptions extends ElementTrackingConfig {
  /** Location/path context for tracking */
  location?: string;
  /** Callback when tracking event occurs */
  onTrackingEvent?: (event: string, data: any) => void;
}

export interface UseElementTrackingReturn {
  /** Function to call when element is clicked */
  trackClick: () => void;
  /** Function to call when element visibility changes */
  handleVisibilityChange: (visible: boolean) => void;
  /** Whether impression has been tracked */
  hasTrackedImpression: boolean;
  /** Whether view has been tracked */
  hasTrackedView: boolean;
}

/**
 * Generic hook for element tracking with impressions, views, and clicks
 * Provides comprehensive tracking functionality using Parsely analytics
 */
export const useElementTracking = ({
  elementId,
  elementType,
  trackImpressions = true,
  trackViews = true,
  viewThreshold = 1000,
  location = "",
  onTrackingEvent,
}: UseElementTrackingOptions): UseElementTrackingReturn => {
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const viewTimerRef = useRef<number | null>(null);

  // Track impressions on mount
  useEffect(() => {
    if (trackImpressions && elementId && !hasTrackedImpression) {
      ExpoParsely.trackElement("impression", elementType, elementId, location);
      setHasTrackedImpression(true);
      onTrackingEvent?.("impression", { elementType, elementId, location });
    }
  }, [
    trackImpressions,
    elementId,
    elementType,
    location,
    hasTrackedImpression,
    onTrackingEvent,
  ]);

  // Handle view tracking with visibility changes
  useEffect(() => {
    if (trackViews && elementId) {
      if (isVisible && !hasTrackedView) {
        viewTimerRef.current = setTimeout(() => {
          if (isVisible && !hasTrackedView) {
            ExpoParsely.trackElement("view", elementType, elementId, location);
            setHasTrackedView(true);
            onTrackingEvent?.("view", { elementType, elementId, location });
          }
        }, viewThreshold);
      } else if (!isVisible && viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
        viewTimerRef.current = null;
      }
    }

    return () => {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }
    };
  }, [
    isVisible,
    trackViews,
    elementId,
    elementType,
    location,
    viewThreshold,
    hasTrackedView,
    onTrackingEvent,
  ]);

  const trackClick = useCallback(() => {
    if (elementId) {
      ExpoParsely.trackElement("click", elementType, elementId, location);
      onTrackingEvent?.("click", { elementType, elementId, location });
    }
  }, [elementId, elementType, location, onTrackingEvent]);

  const handleVisibilityChange = useCallback((visible: boolean) => {
    setIsVisible(visible);
  }, []);

  return {
    trackClick,
    handleVisibilityChange,
    hasTrackedImpression,
    hasTrackedView,
  };
};

export default useElementTracking;
