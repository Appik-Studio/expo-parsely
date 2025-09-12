import React, {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";
import ExpoParsely from "../ExpoParselyModule";

interface ComponentInfo {
  componentName: string;
  testID?: string;
  accessibilityLabel?: string;
  trackingId?: string;
  props?: Record<string, any>;
}

interface HierarchyData {
  componentNames: string[];
  testIDs: string[];
  trackingIds: string[];
  sameTagIndexes: number[];
}

interface TrackingContextValue {
  /** Record user activity for heartbeat tracking */
  recordActivity: () => void;
  /** Track link clicks with hierarchy context */
  trackLinkClick: (href: string, text?: string) => void;
  /** Track screen changes */
  trackScreen: (context?: Record<string, any>) => void;
  /** Register a component in the tracking hierarchy */
  registerComponent: (info: ComponentInfo) => () => void;
  /** Get current component hierarchy data */
  getHierarchy: () => HierarchyData;
  /** Get current hierarchy depth */
  getCurrentDepth: () => number;
  /** Set scroll state for activity detection */
  setScrollState: (isScrolling: boolean) => void;
  /** Get current scroll state */
  isScrolling: () => boolean;
}

export const TrackingContext = createContext<TrackingContextValue | null>(null);

export const useTrackingContext = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error(
      "useTrackingContext must be used within a TrackingProvider"
    );
  }
  return context;
};

interface TrackingProviderProps extends PropsWithChildren {
  /** Callback when user activity is detected */
  onActivityDetected?: () => void;
  /** Whether to enable debug logging */
  enableDebugLogging?: boolean;
}

export const TrackingProvider = ({
  children,
  onActivityDetected,
  enableDebugLogging = false,
}: TrackingProviderProps) => {
  const hierarchyStack = useRef<ComponentInfo[]>([]);

  useEffect(() => {
    if (enableDebugLogging) {
      console.log("🔵 [TrackingProvider] Provider initialized");
    }
  }, [enableDebugLogging]);

  const recordActivity = useCallback(() => {
    // Record activity in the native module
    ExpoParsely.recordActivity();

    // Call the optional callback
    onActivityDetected?.();

    if (enableDebugLogging) {
      console.log("🎯 [TrackingProvider] Activity recorded");
    }
  }, [onActivityDetected, enableDebugLogging]);

  const trackLinkClick = useCallback(
    (href: string, text?: string) => {
      recordActivity();

      // Track the link click with hierarchy context
      const hierarchy = getHierarchy();
      ExpoParsely.trackElement(
        "click",
        "link",
        href,
        JSON.stringify({
          text: text || href,
          hierarchy: hierarchy.trackingIds,
        })
      );

      if (enableDebugLogging) {
        console.log("🔗 [TrackingProvider] Link click tracked:", href);
      }
    },
    [recordActivity, enableDebugLogging]
  );

  const trackScreen = useCallback(
    (context?: Record<string, any>) => {
      // Screen tracking doesn't count as activity
      if (enableDebugLogging) {
        console.log("📱 [TrackingProvider] Screen tracked:", context);
      }

      // Could be extended to track screen views
      // For now, this is a placeholder for screen-specific tracking
    },
    [enableDebugLogging]
  );

  const registerComponent = useCallback(
    (info: ComponentInfo) => {
      hierarchyStack.current.push(info);

      if (enableDebugLogging) {
        console.log(
          "📝 [TrackingProvider] Component registered:",
          info.componentName
        );
      }

      // Return cleanup function
      return () => {
        const index = hierarchyStack.current.findIndex((c) => c === info);
        if (index >= 0) {
          hierarchyStack.current.splice(index, 1);
          if (enableDebugLogging) {
            console.log(
              "🗑️ [TrackingProvider] Component unregistered:",
              info.componentName
            );
          }
        }
      };
    },
    [enableDebugLogging]
  );

  const getHierarchy = useCallback((): HierarchyData => {
    const stack = hierarchyStack.current;
    const componentCounts: Record<string, number> = {};

    const hierarchyData: HierarchyData = {
      componentNames: [],
      sameTagIndexes: [],
      testIDs: [],
      trackingIds: [],
    };

    stack.forEach((component) => {
      // Track component names
      hierarchyData.componentNames.push(component.componentName);

      // Track testIDs
      hierarchyData.testIDs.push(component.testID || "null");

      // Track trackingIds
      hierarchyData.trackingIds.push(component.trackingId || "null");

      // Calculate same-tag index
      componentCounts[component.componentName] =
        (componentCounts[component.componentName] || 0) + 1;
      hierarchyData.sameTagIndexes.push(
        componentCounts[component.componentName]
      );
    });

    return hierarchyData;
  }, []);

  const getCurrentDepth = useCallback(() => hierarchyStack.current.length, []);

  const setScrollState = useCallback(
    (isScrolling: boolean) => {
      ExpoParsely.setScrollState(isScrolling);

      if (enableDebugLogging) {
        console.log("📜 [TrackingProvider] Scroll state set:", isScrolling);
      }
    },
    [enableDebugLogging]
  );

  const isScrolling = useCallback(() => {
    return ExpoParsely.isCurrentlyScrolling();
  }, []);

  const value: TrackingContextValue = {
    recordActivity,
    trackLinkClick,
    trackScreen,
    registerComponent,
    getHierarchy,
    getCurrentDepth,
    setScrollState,
    isScrolling,
  };

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
};

export default TrackingProvider;
