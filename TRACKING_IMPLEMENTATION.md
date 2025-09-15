# Parsely Analytics - 1:1 Implementation

This document provides a **1:1 implementation** of the requirements specified in [`tracking.md`](./tracking.md) using the Expo Parsely library.

## Overview

This implementation exactly matches the specifications in `tracking.md`, including:

- Common parameters sent with all events
- Event types and their parameters
- Heartbeat engagement measurement configuration
- React Native Reanimated optimization for performance
- Cross-platform support (iOS and Android)

## Setup

```typescript
import { ParselyProvider } from 'expo-parsely'

// Wrap your entire app with ParselyProvider for automatic tracking
function App() {
  return (
    <ParselyProvider
      siteId="your-site-id"
      heartbeatConfig={{
        secondsBetweenHeartbeats: 150, // Parse.ly standard: 150 seconds
        activeTimeout: 5, // Parse.ly standard: 5 seconds
        enableHeartbeats: true, // Enable heartbeat tracking
        onHeartbeat: (engagedSeconds) => console.log(`Engaged: ${engagedSeconds}s`)
      }}
    >
      {/* Your app content - automatic activity tracking included */}
    </ParselyProvider>
  )
}
```

## Key Features

### React Native Reanimated Integration

The library uses React Native Reanimated for optimal performance:

- **UI Thread Optimization**: Activity detection runs on the UI thread for minimal latency
- **Graceful Fallback**: Automatically falls back to standard React hooks if Reanimated is not available
- **Performance**: Heartbeat calculations and activity tracking optimized for 60fps performance

### Cross-Platform Native Integration

- **Android**: Integrates with Parse.ly Android SDK 4.1.1 using Kotlin
- **iOS**: Integrates with Parse.ly iOS SDK using Swift
- **Unified API**: Single TypeScript interface for both platforms

### Advanced Configuration

`ParselyProvider` supports additional configuration options:

```typescript
<ParselyProvider
  siteId="your-site-id"
  autoInitialize={true} // Auto-initialize Parse.ly SDK (default: true)
  heartbeatConfig={{
    enableHeartbeats: true, // Enable/disable heartbeats (default: true)
    secondsBetweenHeartbeats: 150, // Parse.ly standard: 150 seconds between heartbeats
    activeTimeout: 5, // Parse.ly standard: 5 seconds after interaction
    onHeartbeat: (engagedSeconds) => {
      // Parse.ly callback: called after each heartbeat with engaged time
      console.log(`User engaged for ${engagedSeconds} seconds`)
    },
    videoPlaying: false // Parse.ly video tracking (set to true when video plays)
  }}
  activityDetectionConfig={{
    touchThrottleMs: 100, // Throttle touch events (default: 100ms)
    scrollThrottleMs: 1000, // Throttle scroll events (default: 1000ms)
    scrollThreshold: 5 // Minimum scroll distance (default: 5px)
  }}
>
  {/* Your app content */}
</ParselyProvider>
```

### Heartbeat Hook Usage

For advanced heartbeat control, use the `useReanimatedHeartbeat` hook directly:

```typescript
import { useReanimatedHeartbeat } from 'expo-parsely'

function MyComponent() {
  const {
    startHeartbeat,
    stopHeartbeat,
    recordActivity,
    isHeartbeatActive,
    setVideoPlaying,
    getDebugInfo
  } = useReanimatedHeartbeat({
    enableHeartbeats: true,
    secondsBetweenHeartbeats: 150,
    activeTimeout: 5,
    onHeartbeat: (engagedSeconds) => {
      console.log(`Heartbeat: ${engagedSeconds}s engaged`)
    }
  })

  React.useEffect(() => {
    // Start heartbeat when component mounts
    startHeartbeat('https://example.com/current-page')

    // Stop when component unmounts
    return () => stopHeartbeat()
  }, [startHeartbeat, stopHeartbeat])

  const handleUserInteraction = () => {
    // Manually record activity
    recordActivity()
  }

  const handleVideoPlay = () => {
    // Enable video tracking mode
    setVideoPlaying(true)
  }

  const handleVideoPause = () => {
    // Disable video tracking mode
    setVideoPlaying(false)
  }

  return (
    <View>
      {/* Your component content */}
    </View>
  )
}
```

## Common Parameters Implementation

As specified in `tracking.md`, these parameters are sent with all events:

```typescript
// User context management
interface UserContext {
  plan: 'anonyme' | 'registered' | 'paid'
  accesibility_article: 0 | 1 // 0 = gratuit, 1 = payant
  spyri_user_id: string
}

let currentUser: UserContext | null = null

function setUserContext(user: UserContext) {
  currentUser = user
}

function getUserMetadata() {
  if (!currentUser) return {}

  return {
    plan: currentUser.plan,
    accesibility_article: currentUser.accesibility_article,
    spyri_user_id: currentUser.spyri_user_id
  }
}
```

## Event Implementations

### trackPageView

**Specification**: Basic Parsely event sent on page load with common parameters.

```typescript
import ExpoParsely from 'expo-parsely'

function trackPageView(url: string, additionalData?: any) {
  ExpoParsely.trackPageView({
    url,
    metadata: getUserMetadata(), // Includes plan, accesibility_article, spyri_user_id
    extraData: additionalData || {}
  })
}

// Usage example
trackPageView('https://example.com/article/my-article')
```

### Native Module API

The library provides direct access to native Parse.ly SDK methods:

```typescript
import ExpoParsely from 'expo-parsely'

// Initialize Parse.ly SDK
ExpoParsely.init('your-site-id')

// Track page view with metadata
ExpoParsely.trackPageView({
  url: 'https://example.com/article',
  metadata: {
    title: 'Article Title',
    section: 'news',
    authors: ['Author Name']
  },
  extraData: {
    plan: 'registered',
    spyri_user_id: '12345'
  }
})

// Start engagement tracking
ExpoParsely.startEngagement({
  url: 'https://example.com/article',
  extraData: { plan: 'registered' }
})

// Stop engagement tracking
ExpoParsely.stopEngagement()

// Video tracking
ExpoParsely.trackPlay({
  url: 'https://example.com/video',
  videoID: 'video123',
  duration: 300,
  metadata: { title: 'Video Title' }
})

ExpoParsely.trackPause()
ExpoParsely.resetVideo('https://example.com/video', 'video123')
```

### conversions.trackLeadCapture

**Specification**: Sent immediately after user registration with `type: 'SignUp'`.

```typescript
function trackLeadCapture(currentUrl?: string) {
  ExpoParsely.trackPageView({
    url: currentUrl || 'mobile://registration/complete', // Use current screen URL or default
    action: '_LeadCapture', // Prefix with underscore for custom events
    data: {
      type: 'SignUp' // As specified in tracking.md
    },
    metadata: getUserMetadata()
  })
}

// Usage example - call after successful user registration
trackLeadCapture()
```

### conversions.trackNewsletterSignup

**Specification**: Sent when user signs up for newsletter. No additional parameters.

```typescript
function trackNewsletterSignup(currentUrl?: string) {
  ExpoParsely.trackPageView({
    url: currentUrl || 'mobile://newsletter/signup', // Use current screen URL or default
    action: '_NewsletterSignup', // Prefix with underscore for custom events
    data: {}, // No additional parameters as specified
    metadata: getUserMetadata()
  })
}

// Usage example - call after successful newsletter signup
trackNewsletterSignup()
```

### conversions.trackSubscription

**Specification**: Sent on subscription confirmation page. No additional parameters.

```typescript
function trackSubscription(currentUrl?: string) {
  ExpoParsely.trackPageView({
    url: currentUrl || 'mobile://subscription/confirm', // Use current screen URL or default
    action: '_Subscription', // Prefix with underscore for custom events
    data: {}, // No additional parameters as specified
    metadata: getUserMetadata()
  })
}

// Usage example - call on subscription confirmation page
trackSubscription()
```

### conversions.trackCustom

**Specification**: Sent for custom conversions, with `WallClick` example.

```typescript
function trackCustomConversion(eventType: string, currentUrl?: string, additionalData?: any) {
  ExpoParsely.trackPageView({
    url: currentUrl || 'mobile://current/screen', // Use current screen URL or default
    action: `_${eventType}`, // Prefix with underscore for custom events
    data: additionalData || {},
    metadata: getUserMetadata()
  })
}

// Usage examples
trackCustomConversion('WallClick') // As specified in tracking.md
trackCustomConversion('CustomEvent', { customParam: 'value' })
```

## Activity Recording Implementation

**Specification**: Track user interactions for heartbeat system.

```typescript
import { useReanimatedHeartbeat } from 'expo-parsely'

const { recordActivity } = useReanimatedHeartbeat()

// Record user activity for heartbeat system (as specified in tracking.md)
function recordUserActivity() {
  // This corresponds to mousedown/touch and scroll events in tracking.md
  recordActivity()
}

// Usage in components - automatically handled by HeartbeatTouchBoundary
// But you can also manually record activity when needed
function handleCustomInteraction() {
  recordUserActivity() // Manually record activity for custom interactions
}
```

### Activity Detection Components

The library provides components for automatic activity detection:

```typescript
import { HeartbeatTouchBoundary, ParselyProvider } from 'expo-parsely'

// Automatic activity detection (recommended)
function App() {
  return (
    <ParselyProvider siteId="your-site-id">
      {/* All touch and scroll events automatically detected */}
      <YourAppContent />
    </ParselyProvider>
  )
}

// Manual activity detection (advanced usage)
function MyScreen() {
  return (
    <HeartbeatTouchBoundary>
      {/* Touch and scroll events in this boundary are detected */}
      <YourScreenContent />
    </HeartbeatTouchBoundary>
  )
}
```

### Debug Overlay

For development and testing, use the debug overlay:

```typescript
import { HeartbeatDebugOverlay } from 'expo-parsely'

function App() {
  return (
    <ParselyProvider siteId="your-site-id">
      <YourAppContent />
      {__DEV__ && <HeartbeatDebugOverlay />}
    </ParselyProvider>
  )
}
```

The debug overlay shows:

- Current heartbeat status
- Time since last activity
- Total engaged time
- Heartbeat count
- Activity count

## Complete Implementation Class

Here's a complete implementation class that provides all functionality specified in `tracking.md`:

```typescript
import ExpoParsely from 'expo-parsely'
import { useReanimatedHeartbeat, HeartbeatTouchBoundary } from 'expo-parsely'

interface UserContext {
  plan: 'anonyme' | 'registered' | 'paid'
  accesibility_article: 0 | 1
  spyri_user_id: string
}

class ParselyTracker {
  private currentUser: UserContext | null = null

  // Initialize according to tracking.md specifications
  init(siteId: string) {
    ExpoParsely.init(siteId)

    // Note: Heartbeat functionality should be initialized in React components using useReanimatedHeartbeat hook
  }

  // Set user context for common parameters
  setUser(user: UserContext) {
    this.currentUser = user
  }

  // Get common parameters as specified in tracking.md
  private getUserMetadata() {
    if (!this.currentUser) return {}

    return {
      plan: this.currentUser.plan,
      accesibility_article: this.currentUser.accesibility_article,
      spyri_user_id: this.currentUser.spyri_user_id
    }
  }

  // trackPageView - Basic Parsely event
  trackPageView(url: string, additionalData?: any) {
    ExpoParsely.trackPageView({
      url,
      metadata: this.getUserMetadata(),
      extraData: additionalData || {}
    })
  }

  // conversions.trackLeadCapture - User registration
  trackLeadCapture(currentUrl?: string) {
    ExpoParsely.trackPageView({
      url: currentUrl || 'mobile://registration/complete',
      action: '_LeadCapture',
      data: { type: 'SignUp' }, // As specified in tracking.md
      metadata: this.getUserMetadata()
    })
  }

  // conversions.trackNewsletterSignup - Newsletter signup
  trackNewsletterSignup(currentUrl?: string) {
    ExpoParsely.trackPageView({
      url: currentUrl || 'mobile://newsletter/signup',
      action: '_NewsletterSignup',
      data: {}, // No additional parameters
      metadata: this.getUserMetadata()
    })
  }

  // conversions.trackSubscription - Subscription confirmation
  trackSubscription(currentUrl?: string) {
    ExpoParsely.trackPageView({
      url: currentUrl || 'mobile://subscription/confirm',
      action: '_Subscription',
      data: {}, // No additional parameters
      metadata: this.getUserMetadata()
    })
  }

  // conversions.trackCustom - Custom conversions
  trackCustomConversion(eventType: string, currentUrl?: string, additionalData?: any) {
    ExpoParsely.trackPageView({
      url: currentUrl || 'mobile://current/screen',
      action: `_${eventType}`,
      data: additionalData || {},
      metadata: this.getUserMetadata()
    })
  }

  // Activity recording for heartbeat system
  // Note: This method is for illustration only.
  // In actual usage, use the useReanimatedHeartbeat hook directly in React components
  recordActivity() {
    // This would be handled by the useReanimatedHeartbeat hook in React components
    console.log('Activity recorded (use hook directly in components)')
  }
}

// Export singleton instance
export const parselyTracker = new ParselyTracker()
```

## Usage Example

```typescript
import { parselyTracker } from './parsely-tracker'

// Initialize
parselyTracker.init('your-site-id')

// Set user context
parselyTracker.setUser({
  plan: 'registered',
  accesibility_article: 0,
  spyri_user_id: '12345'
})

// Track page view
parselyTracker.trackPageView('https://example.com/article/123')

// Track conversions
parselyTracker.trackLeadCapture() // After user registration
parselyTracker.trackNewsletterSignup() // After newsletter signup
parselyTracker.trackSubscription() // On subscription confirmation
parselyTracker.trackCustomConversion('WallClick') // Custom wall click

// In React components, use the useReanimatedHeartbeat hook:
// const { startHeartbeat, stopHeartbeat, recordActivity } = useReanimatedHeartbeat()
// startHeartbeat() // Start engagement tracking
// stopHeartbeat() // Stop when user leaves page
// recordActivity() // Manual activity recording

// For tracking conversions and page views, use the class methods
parselyTracker.trackLeadCapture() // After user registration
parselyTracker.trackNewsletterSignup() // After newsletter signup
parselyTracker.trackSubscription() // On subscription confirmation
```

## React Component Integration

With `ParselyProvider`, components automatically get tracking context:

```tsx
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { parselyTracker } from './parsely-tracker'
import { useTrackingContext } from 'expo-parsely'

function ArticlePage({ article, user }) {
  const { trackPageView } = useTrackingContext()

  React.useEffect(() => {
    // Set user context
    parselyTracker.setUser(user)

    // Track page view using context
    trackPageView({
      url: 'mobile://article/' + article.id,
      metadata: {
        section: article.category || 'article',
        title: article.title
      }
    })
  }, [article, user, trackPageView])

  const handleUserRegistration = () => {
    // Handle registration logic
    // ...

    // Track conversion
    parselyTracker.trackLeadCapture()
  }

  const handleNewsletterSignup = () => {
    // Handle newsletter signup logic
    // ...

    // Track conversion
    parselyTracker.trackNewsletterSignup()
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>{article.title}</Text>
      {/* Article content - activity tracking handled automatically by ParselyProvider */}
      <TouchableOpacity
        style={{ backgroundColor: 'blue', padding: 10, marginBottom: 10 }}
        onPress={handleUserRegistration}>
        <Text style={{ color: 'white' }}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ backgroundColor: 'green', padding: 10 }}
        onPress={handleNewsletterSignup}>
        <Text style={{ color: 'white' }}>Subscribe to Newsletter</Text>
      </TouchableOpacity>
    </View>
  )
}
```

### Screen Tracking with Navigation

For React Navigation integration:

```tsx
import { useReanimatedHeartbeat } from 'expo-parsely'
import { useFocusEffect } from '@react-navigation/native'

function ArticleScreen({ route }) {
  const { articleId } = route.params
  const { startHeartbeat, stopHeartbeat } = useReanimatedHeartbeat()

  useFocusEffect(
    React.useCallback(() => {
      // Start heartbeat when screen comes into focus
      startHeartbeat(`mobile://article/${articleId}`)

      // Stop heartbeat when screen loses focus
      return () => stopHeartbeat()
    }, [articleId, startHeartbeat, stopHeartbeat])
  )

  return <View>{/* Screen content */}</View>
}
```

### Custom Tracking Logic

For components that need custom tracking logic beyond automatic page views:

```tsx
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { parselyTracker } from './parsely-tracker'
import { useTrackingContext } from 'expo-parsely'

function ArticlePage({ article, user }) {
  const { trackPageView } = useTrackingContext()

  React.useEffect(() => {
    // Set user context
    parselyTracker.setUser(user)

    // Track page view with custom metadata
    trackPageView({
      url: 'mobile://article/' + article.id,
      section: article.category || 'article',
      title: article.title
    })
  }, [article, user, trackPageView])

  const handleCustomAction = () => {
    // Custom tracking logic
    parselyTracker.trackCustomConversion('ArticleShare', 'mobile://article/' + article.id, {
      articleId: article.id,
      platform: 'mobile'
    })
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>{article.title}</Text>
      <TouchableOpacity
        style={{ backgroundColor: 'blue', padding: 10, marginBottom: 10 }}
        onPress={handleCustomAction}>
        <Text style={{ color: 'white' }}>Share Article</Text>
      </TouchableOpacity>
    </View>
  )
}
```

## HeartbeatTouchBoundary Integration

`HeartbeatTouchBoundary` is automatically managed by `ParselyProvider` and detects touch/scroll activity according to `tracking.md` specifications. It's not typically used directly - instead, wrap your app with `ParselyProvider` for automatic activity tracking.

```tsx
import { ParselyProvider } from 'expo-parsely'

function App() {
  return (
    <ParselyProvider siteId='your-site-id'>
      {/* Your app content - HeartbeatTouchBoundary automatically applied */}
    </ParselyProvider>
  )
}
```

### Direct Usage (Advanced)

For manual control:

```tsx
import { HeartbeatTouchBoundary } from 'expo-parsely'

function MyComponent() {
  return (
    <HeartbeatTouchBoundary>
      {/* Component content with automatic activity detection */}
    </HeartbeatTouchBoundary>
  )
}
```

## Implementation Status

### ✅ Completed Features

- **Cross-platform native integration** (iOS and Android)
- **React Native Reanimated optimization** with graceful fallback
- **Heartbeat engagement tracking** with Parse.ly methodology
- **Activity detection** (touch and scroll events)
- **Debug overlay** for development
- **TypeScript support** with full type definitions
- **Parse.ly SDK integration** (Android 4.1.1, iOS latest)

### 🔧 Technical Implementation

- **Android**: Kotlin native module using Parse.ly Android SDK 4.1.1
- **iOS**: Swift native module using Parse.ly iOS SDK
- **Performance**: UI thread optimization with React Native Reanimated
- **Fallback**: Standard React hooks when Reanimated is unavailable
- **Memory**: Efficient shared value management and cleanup

### 📱 Platform Support

- **React Native**: 0.76.9+
- **Expo**: SDK 52+
- **iOS**: 13.0+
- **Android**: API 21+ (Android 5.0)

This implementation provides a **1:1 mapping** of the `tracking.md` specifications to the Expo Parsely library, ensuring complete compliance with the original requirements while adding performance optimizations and cross-platform native integration.
