import { useEffect } from 'react'

import { useMobileAnalytics } from '../hooks/useMobileAnalytics'

interface TrackableScreenProps<T = Record<string, any>> {
  screenName: string
  analyticsContext?: Partial<T>
  children?: React.ReactNode
}

export const TrackableScreen = <T = Record<string, any>,>({
  screenName,
  analyticsContext,
  children
}: TrackableScreenProps<T>) => {
  const { trackScreen } = useMobileAnalytics()

  useEffect(() => {
    trackScreen({ title: screenName, ...analyticsContext })
  }, [screenName, analyticsContext, trackScreen])

  return <>{children}</>
}
