/**
 * Generic utilities for tracking component hierarchies in React Native
 * Provides DOM-like hierarchy analysis for analytics tracking
 */

export interface ElementInfo {
  componentName: string;
  testID?: string;
  accessibilityLabel?: string;
  trackingId?: string;
  props?: Record<string, any>;
}

export interface HierarchyPosition {
  /** CSS-like nth-child positions */
  nthChild: number[];
  /** Positions among siblings of same component type */
  sameTagIndex: number[];
}

export interface ElementPosition {
  /** Element bounding rectangle */
  boundingRect?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  };
  /** Hierarchy position data */
  hierarchy: HierarchyPosition;
}

/**
 * Calculate nth-child positions for an element in the hierarchy
 * @param element The element to analyze
 * @param hierarchy The component hierarchy stack
 * @returns Array of nth-child positions
 */
export const calculateNthChildPosition = (
  element: ElementInfo,
  hierarchy: ElementInfo[]
): number[] => {
  const positions: number[] = [];
  const elementIndex = hierarchy.findIndex(h => h === element);

  if (elementIndex >= 0) {
    // Calculate position among all siblings at each level
    for (let depth = 0; depth <= elementIndex; depth++) {
      const siblings = hierarchy.slice(0, depth + 1);
      const position = siblings.filter(h => h.componentName === element.componentName).length;
      positions.push(position);
    }
  }

  return positions;
};

/**
 * Calculate same-tag index positions for an element
 * @param element The element to analyze
 * @param hierarchy The component hierarchy stack
 * @returns Array of same-tag index positions
 */
export const calculateSameTagNthChild = (
  element: ElementInfo,
  hierarchy: ElementInfo[]
): number[] => {
  const positions: number[] = [];
  const elementIndex = hierarchy.findIndex(h => h === element);

  if (elementIndex >= 0) {
    // Count occurrences of same component type up to current element
    let sameTagCount = 0;
    for (let i = 0; i <= elementIndex; i++) {
      if (hierarchy[i].componentName === element.componentName) {
        sameTagCount++;
        if (i === elementIndex) {
          positions.push(sameTagCount);
        }
      }
    }
  }

  return positions;
};

/**
 * Get comprehensive position data for an element
 * @param element The element to analyze
 * @param hierarchy The component hierarchy stack
 * @param boundingRect Optional bounding rectangle data
 * @returns Complete position information
 */
export const getElementPosition = (
  element: ElementInfo,
  hierarchy: ElementInfo[],
  boundingRect?: { left: number; right: number; top: number; bottom: number; width: number; height: number }
): ElementPosition => {
  return {
    boundingRect,
    hierarchy: {
      nthChild: calculateNthChildPosition(element, hierarchy),
      sameTagIndex: calculateSameTagNthChild(element, hierarchy),
    },
  };
};

/**
 * Extract tracking IDs from hierarchy for analytics
 * @param hierarchy The component hierarchy stack
 * @returns Array of tracking IDs
 */
export const getHierarchyTrackingIds = (hierarchy: ElementInfo[]): string[] => {
  return hierarchy
    .map(h => h.trackingId || 'null')
    .filter(id => id !== 'null');
};

/**
 * Extract component names from hierarchy
 * @param hierarchy The component hierarchy stack
 * @returns Array of component names
 */
export const getHierarchyComponentNames = (hierarchy: ElementInfo[]): string[] => {
  return hierarchy.map(h => h.componentName);
};

/**
 * Extract test IDs from hierarchy
 * @param hierarchy The component hierarchy stack
 * @returns Array of test IDs
 */
export const getHierarchyTestIds = (hierarchy: ElementInfo[]): string[] => {
  return hierarchy.map(h => h.testID || 'null');
};

/**
 * Build a flattened hierarchy representation for analytics
 * @param hierarchy The component hierarchy stack
 * @returns Flattened hierarchy data
 */
export const buildHierarchyData = (hierarchy: ElementInfo[]) => {
  const componentCounts: Record<string, number> = {};

  return hierarchy.map(component => {
    // Calculate same-tag index
    componentCounts[component.componentName] = (componentCounts[component.componentName] || 0) + 1;
    const sameTagIndex = componentCounts[component.componentName];

    return {
      componentName: component.componentName,
      testID: component.testID,
      trackingId: component.trackingId,
      accessibilityLabel: component.accessibilityLabel,
      sameTagIndex,
    };
  });
};

/**
 * Find the closest ancestor with a specific component name
 * @param element The starting element
 * @param hierarchy The component hierarchy stack
 * @param componentName The component name to search for
 * @returns The closest ancestor or null if not found
 */
export const findClosestAncestor = (
  element: ElementInfo,
  hierarchy: ElementInfo[],
  componentName: string
): ElementInfo | null => {
  const elementIndex = hierarchy.findIndex(h => h === element);

  if (elementIndex >= 0) {
    // Search backwards from the element's position
    for (let i = elementIndex - 1; i >= 0; i--) {
      if (hierarchy[i].componentName === componentName) {
        return hierarchy[i];
      }
    }
  }

  return null;
};

/**
 * Get the depth of an element in the hierarchy
 * @param element The element to check
 * @param hierarchy The component hierarchy stack
 * @returns The depth (0-based) or -1 if not found
 */
export const getElementDepth = (
  element: ElementInfo,
  hierarchy: ElementInfo[]
): number => {
  return hierarchy.findIndex(h => h === element);
};

/**
 * Check if an element is a descendant of another element
 * @param descendant The potential descendant
 * @param ancestor The potential ancestor
 * @param hierarchy The component hierarchy stack
 * @returns True if descendant is a child of ancestor
 */
export const isDescendantOf = (
  descendant: ElementInfo,
  ancestor: ElementInfo,
  hierarchy: ElementInfo[]
): boolean => {
  const descendantIndex = hierarchy.findIndex(h => h === descendant);
  const ancestorIndex = hierarchy.findIndex(h => h === ancestor);

  return descendantIndex > ancestorIndex && descendantIndex >= 0 && ancestorIndex >= 0;
};
