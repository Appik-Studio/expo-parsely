import { ParselyProvider } from 'expo-parsely'
import HeartbeatDebugOverlay from 'expo-parsely/components/HeartbeatDebugOverlay'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

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
