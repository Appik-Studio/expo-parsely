export const isDev = __DEV__

// Default Parse.ly analytics configuration
export const ANALYTICS_CONFIG = {
  heartbeat: {
    enableHeartbeats: true,
    activeTimeout: 30, // seconds
    secondsBetweenHeartbeats: 10, // seconds
    maxSessionDurationMinutes: 120 // minutes
  },
  activity: {
    enableTouchDetection: true,
    enableScrollDetection: true,
    touchThrottleMs: 100,
    scrollThrottleMs: 1000,
    scrollThreshold: 5
  }
}
