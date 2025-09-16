import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ParselyProvider } from '../../src/index'

const RootLayout = () => {
  console.log('🔧 RootLayout: Rendering with ParselyProvider...')

  return (
    <ParselyProvider
      siteId='example.com'
      autoInitialize={true}
      flushInterval={5000}
      dryRun={false}
      enableDebugLogging={true}
      heartbeatConfig={{
        enableHeartbeats: true, // Enable heartbeats to test the issue
        secondsBetweenHeartbeats: 150,
        activeTimeout: 5,
        videoPlaying: false
      }}
      activityDetectionConfig={{
        touchThrottleMs: 500,
        scrollThrottleMs: 1000,
        scrollThreshold: 5.0
      }}>
      <StatusBar style='auto' />
      <Stack>
        <Stack.Screen name='index' options={{ title: 'Parse.ly SDK' }} />
      </Stack>
    </ParselyProvider>
  )
}

export default RootLayout
