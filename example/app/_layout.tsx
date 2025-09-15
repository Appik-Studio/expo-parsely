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
      enableDebugLogging={true} // Enable debug logging for demonstration
      heartbeatConfig={{
        enableHeartbeats: true,
        secondsBetweenHeartbeats: 150, // Parse.ly standard: 150 seconds
        activeTimeout: 5, // Parse.ly standard: 5 seconds after interaction
        videoPlaying: false // Parse.ly video tracking support
      }}
      activityDetectionConfig={{
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
