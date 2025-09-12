import React, { useEffect, useRef } from 'react'

import ExpoParsely from '../ExpoParselyModule'
import { useTrackingContext } from '../contexts/TrackingContext'

// Dynamic imports for expo-router (optional dependency)
let usePathname: () => string = () => ''
let useSearchParams: () => URLSearchParams = () => new URLSearchParams()
let hasExpoRouter = false

try {
  const expoRouter = require('expo-router')
  usePathname = expoRouter.usePathname
  useSearchParams = expoRouter.useSearchParams
  hasExpoRouter = true
} catch {
  // expo-router not available
}

interface NavigationTrackingConfig {
  /** Whether to enable navigation tracking */
  enabled?: boolean
  /** Whether to track page views on navigation */
  trackPageViews?: boolean
  /** Custom URL prefix for page views */
  urlPrefix?: string
  /** Whether to track screen changes */
  trackScreens?: boolean
  /** Custom screen name formatter */
  screenNameFormatter?: (pathname: string, params?: Record<string, any>) => string
}

interface NavigationTrackingOptions extends NavigationTrackingConfig {
  /** Debug logging */
  debug?: boolean
}

/**
 * Hook for automatic navigation tracking with Expo Router
 * Tracks page views and screen changes automatically
 */
export const useNavigationTracking = (options: NavigationTrackingOptions = {}) => {
  const {
    enabled = true,
    trackPageViews = true,
    trackScreens = true,
    urlPrefix = 'https://app',
    screenNameFormatter,
    debug = false
  } = options

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { trackScreen } = useTrackingContext()
  const previousPathname = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!enabled || !hasExpoRouter) {
      if (debug && enabled && !hasExpoRouter) {
        console.warn('📱 [NavigationTracking] expo-router not found. Navigation tracking disabled.')
      }
      return
    }

    const currentPathname = pathname
    const currentParams = Object.fromEntries(searchParams.entries())

    // Skip if pathname hasn't changed
    if (previousPathname.current === currentPathname) return

    try {
      // Track page view if enabled
      if (trackPageViews) {
        const url = `${urlPrefix}${currentPathname}`
        const metadata = {
          canonical_url: url,
          title: screenNameFormatter?.(currentPathname, currentParams) || formatScreenName(currentPathname),
          section: 'app',
          tags: ['navigation', 'expo-router']
        }

        ExpoParsely.trackPageView(url, undefined, metadata)

        if (debug) {
          console.log('📱 [NavigationTracking] Page view tracked:', {
            url,
            pathname: currentPathname,
            params: currentParams,
            metadata
          })
        }
      }

      // Track screen change if enabled
      if (trackScreens) {
        const screenName = screenNameFormatter?.(currentPathname, currentParams) || formatScreenName(currentPathname)
        const screenContext = {
          screenName,
          pathname: currentPathname,
          params: currentParams,
          previousPathname: previousPathname.current,
          timestamp: Date.now()
        }

        trackScreen(screenContext)

        if (debug) {
          console.log('📱 [NavigationTracking] Screen tracked:', screenContext)
        }
      }

      previousPathname.current = currentPathname
    } catch (error) {
      console.error('❌ [NavigationTracking] Error tracking navigation:', error)
    }
  }, [
    pathname,
    searchParams,
    enabled,
    trackPageViews,
    trackScreens,
    urlPrefix,
    screenNameFormatter,
    debug,
    trackScreen
  ])
}

/**
 * Utility function to format screen names from pathnames
 */
function formatScreenName(pathname: string): string {
  if (pathname === '/') return 'Home'

  // Remove leading slash and split by segments
  const segments = pathname.slice(1).split('/')

  // Capitalize each segment and join
  return segments
    .map(segment => {
      // Handle dynamic routes like [id] -> Id
      if (segment.startsWith('[') && segment.endsWith(']')) {
        return segment.slice(1, -1).replace(/^\w/, c => c.toUpperCase())
      }
      // Handle kebab-case and snake_case
      return segment
        .split(/[-_]/)
        .map(word => word.replace(/^\w/, c => c.toUpperCase()))
        .join('')
    })
    .join(' ')
}

/**
 * Higher-order component for automatic navigation tracking
 * Wraps a screen component and adds navigation tracking
 */
export const withNavigationTracking = <P extends object>(
  Component: React.ComponentType<P>,
  options: NavigationTrackingOptions = {}
) => {
  const WrappedComponent = (props: P) => {
    useNavigationTracking(options)
    return <Component {...props} />
  }

  WrappedComponent.displayName = `withNavigationTracking(${Component.displayName || Component.name})`

  return WrappedComponent
}

export default useNavigationTracking
