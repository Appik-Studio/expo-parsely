import { useEffect } from 'react'

import type { ParselyTrackablePageViewProps } from '../ExpoParsely.types'
import ExpoParsely from '../ExpoParselyModule'
import { useTrackingContext } from './ParselyProvider'

export const ParselyTrackablePageView = ({
  screenName,
  screenUrl,
  analyticsContext,
  children
}: ParselyTrackablePageViewProps) => {
  const { trackPageView } = useTrackingContext()

  useEffect(() => {
    const url = screenUrl || `/${screenName.toLowerCase().replace(/\s+/g, '-')}`

    // Track page view
    trackPageView({
      title: screenName,
      url,
      ...analyticsContext
    })

    // Start engagement tracking for this specific page
    ExpoParsely.startEngagement(url, {
      extraData: {
        screen_name: screenName,
        ...analyticsContext
      }
    })

    // Stop engagement when component unmounts or URL changes
    return () => {
      ExpoParsely.stopEngagement()
    }
  }, [screenName, screenUrl, analyticsContext, trackPageView])

  return <>{children}</>
}

export default ParselyTrackablePageView
