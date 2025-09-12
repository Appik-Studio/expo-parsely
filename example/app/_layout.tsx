import { ParselyProvider } from 'expo-parsely'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import HeartbeatDebugOverlay from 'expo-parsely/components/HeartbeatDebugOverlay'

const RootLayout = () => {
  return (
    <ParselyProvider
      siteId='example.com'
      autoInitialize={true}
      flushInterval={5000}
      dryRun={false}
      enableDebugLogging={__DEV__}
      heartbeatConfig={{
        enableHeartbeats: true,
        inactivityThresholdMs: 30000,
        intervalMs: 10000,
        maxDurationMs: 1800000
      }}
      activityDetectionConfig={{
        enableTouchDetection: true,
        enableScrollDetection: true,
        touchThrottleMs: 100,
        scrollThrottleMs: 100,
        scrollThreshold: 10.0
      }}
      navigationTracking={{
        enabled: true,
        trackPageViews: true,
        trackScreens: true,
        urlPrefix: 'https://example-app.com'
      }}>
      <StatusBar style='auto' />
      <HeartbeatDebugOverlay />
      <Stack>
        <Stack.Screen name='index' options={{ title: 'Parse.ly SDK' }} />
      </Stack>
    </ParselyProvider>
  )
}

export default RootLayout
