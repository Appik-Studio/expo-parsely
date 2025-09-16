import { HeartbeatDebugOverlay, ParselyProvider } from 'expo-parsely'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useMemo } from 'react'

const RootLayout = () => {
  // Memoize configs to prevent object recreation on every render
  const heartbeatConfig = useMemo(
    () => ({
      enableHeartbeats: true,
      secondsBetweenHeartbeats: 150,
      activeTimeout: 5,
      videoPlaying: false
    }),
    []
  )

  const activityDetectionConfig = useMemo(
    () => ({
      touchThrottleMs: 500,
      scrollThrottleMs: 1000,
      scrollThreshold: 5.0
    }),
    []
  )

  return (
    <ParselyProvider
      siteId='example.com'
      autoInitialize={true}
      flushInterval={5000}
      dryRun={false}
      enableDebugLogging={true}
      heartbeatConfig={heartbeatConfig}
      activityDetectionConfig={activityDetectionConfig}>
      <StatusBar style='auto' />
      <HeartbeatDebugOverlay />
      <Stack>
        <Stack.Screen name='index' options={{ title: 'Parse.ly SDK' }} />
      </Stack>
    </ParselyProvider>
  )
}

export default RootLayout
