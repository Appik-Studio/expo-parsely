import ExpoParsely from 'expo-parsely';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

const RootLayout = () => {
  useEffect(() => {
    ExpoParsely.init('example.com', {
      flushInterval: 5000,
      dryRun: false
    });
    
    ExpoParsely.configureHeartbeat({
      enableHeartbeats: true,
      inactivityThresholdMs: 30000,
      intervalMs: 10000,
      maxDurationMs: 1800000
    });
    
    ExpoParsely.configureActivityDetection({
      enableTouchDetection: true,
      enableScrollDetection: true,
      touchThrottleMs: 100,
      scrollThrottleMs: 100,
      scrollThreshold: 10.0
    });
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Parse.ly SDK' }} />
      </Stack>
    </>
  );
};

export default RootLayout;
