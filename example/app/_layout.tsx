import ExpoParsely, { ParselyProvider } from 'expo-parsely'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import HeartbeatDebugOverlay from 'expo-parsely/components/HeartbeatDebugOverlay'
import { HeartbeatTouchBoundary } from 'expo-parsely/components/HeartbeatTouchBoundary'

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
        inactivityThresholdMs: 5000,
        intervalMs: 10000,
        maxDurationMs: 1800000
      }}
      activityDetectionConfig={{
        enableTouchDetection: true,
        enableScrollDetection: true,
        touchThrottleMs: 500,
        scrollThrottleMs: 1000,
        scrollThreshold: 5.0
      }}
      navigationTracking={{
        enabled: true,
        trackPageViews: true,
        trackScreens: true,
        urlPrefix: 'https://example-app.com'
      }}>
      <HeartbeatTouchBoundary
        onTouchActivity={() => {
          // Record activity for heartbeat tracking
          ExpoParsely.recordActivity()
          if (__DEV__) {
            console.log('🎯 [RootLayout] Touch activity detected and recorded')
          }
        }}>
        <StatusBar style='auto' />
        <HeartbeatDebugOverlay />
        <Stack>
          <Stack.Screen name='index' options={{ title: 'Parse.ly SDK' }} />
        </Stack>
      </HeartbeatTouchBoundary>
    </ParselyProvider>
  )
}

export default RootLayout
