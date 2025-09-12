import { useEffect, useRef } from "react";
import { useTrackingContext } from "../contexts/TrackingContext";

interface NavigationTrackerProps {
  /** Current navigation path */
  navigationPath?: string;
  /** Whether to enable debug logging */
  enableDebugLogging?: boolean;
  /** Custom navigation event handler */
  onNavigation?: (from: string, to: string) => void;
  /** Debounce time for navigation events (ms) */
  debounceMs?: number;
}

/**
 * Generic component that tracks navigation changes for analytics
 * Integrates with the TrackingContext to record navigation as user activity
 * Accepts navigationPath as prop to avoid expo-router dependency
 */
export const NavigationTracker = ({
  navigationPath = "",
  enableDebugLogging = false,
  onNavigation,
  debounceMs = 1000,
}: NavigationTrackerProps) => {
  const { recordActivity, trackScreen } = useTrackingContext();
  const previousPath = useRef<string>("");
  const lastNavigationTime = useRef<number>(0);

  useEffect(() => {
    const currentPath = navigationPath;

    if (currentPath !== previousPath.current && currentPath) {
      const now = Date.now();
      const shouldRecordActivity =
        now - lastNavigationTime.current > debounceMs;

      if (shouldRecordActivity) {
        const timeSinceLastNav = now - lastNavigationTime.current;
        recordActivity();
        lastNavigationTime.current = now;

        if (enableDebugLogging) {
          console.log("Navigation activity recorded:", {
            from: previousPath.current || "initial",
            timeSinceLastNav: timeSinceLastNav + "ms",
            to: currentPath,
          });
        }
      } else if (enableDebugLogging) {
        console.log("Navigation detected (activity skipped - debounced):", {
          from: previousPath.current || "initial",
          to: currentPath,
        });
      }

      // Track screen change
      trackScreen({
        title: currentPath.split("/").pop() || "Screen",
        url: currentPath.startsWith("/") ? currentPath : "/" + currentPath,
        navigation: {
          from: previousPath.current || "initial",
          to: currentPath,
        },
      });

      // Call custom navigation handler
      onNavigation?.(previousPath.current || "initial", currentPath);

      if (enableDebugLogging) {
        console.log("Navigation tracked:", {
          from: previousPath.current || "initial",
          fullPath: currentPath.startsWith("/")
            ? currentPath
            : "/" + currentPath,
          to: currentPath,
        });
      }
    }

    previousPath.current = currentPath;
  }, [
    navigationPath,
    recordActivity,
    trackScreen,
    onNavigation,
    debounceMs,
    enableDebugLogging,
  ]);

  useEffect(() => {
    if (enableDebugLogging) {
      console.log(
        "NavigationTracker initialized, current path:",
        navigationPath
      );
    }
  }, [enableDebugLogging, navigationPath]);

  return null;
};

export default NavigationTracker;
