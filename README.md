# 📊 expo-parsely

Enhanced Parse.ly Analytics SDK for React Native and Expo - provides comprehensive engagement tracking, heartbeat monitoring, and cross-platform analytics.

## ✨ Features

- 📱 **Cross-platform support** (iOS & Android)
- 💓 **Enhanced Heartbeat System** - Automatic activity detection with configurable thresholds
- 👆 **Touch & Scroll Detection** - Smart activity recording with throttling
- 📊 **Element Tracking** - Impressions, views, and clicks for UI components
- 🏗️ **Hierarchy Tracking** - Component relationship analytics
- 🔧 **Configurable Sessions** - Customizable inactivity timeouts and session durations
- 📈 **Parse.ly Analytics Integration** - Full SDK integration with automatic event sending
- 🎯 **TypeScript Support** - Complete type definitions for all features
- ⚡ **Performance Optimized** - Efficient activity monitoring and event batching
- 📄 **Page View Analytics** - Comprehensive page view and engagement tracking

## 📊 Implementation Status

### Parse.ly SDK Feature Comparison

| Method/Feature                 | Parse.ly Official | iOS Implementation                                 | Android Implementation                               | Strategy                |
| ------------------------------ | ----------------- | -------------------------------------------------- | ---------------------------------------------------- | ----------------------- |
| **Core Analytics**             |
| `init`/`configure`             | ✅ Available      | ✅ **SDK-based**                                   | 🔄 **Production-ready stub** (SDK integration ready) | Progressive enhancement |
| `trackPageView`                | ✅ Available      | ✅ **SDK-based**                                   | 🔄 **Production-ready stub** (SDK integration ready) | Progressive enhancement |
| `startEngagement`              | ✅ Available      | ✅ **SDK-based** (includes heartbeat)              | 🔄 **Production-ready stub** (SDK integration ready) | Progressive enhancement |
| `stopEngagement`               | ✅ Available      | ✅ **SDK-based** (includes heartbeat)              | 🔄 **Production-ready stub** (SDK integration ready) | Progressive enhancement |
| **Enhanced Configuration**     |
| `configureHeartbeat`           | ❌ Not available  | ✅ **Full implementation**                         | ✅ **Full implementation**                           | Value-add feature       |
| `configureActivityDetection`   | ❌ Not available  | ✅ **Full implementation**                         | ✅ **Full implementation**                           | Value-add feature       |
| `recordActivity`               | ❌ Not available  | ✅ **Full implementation**                         | ✅ **Full implementation**                           | Value-add feature       |
| **Element Tracking**           |
| `trackPageView` (with actions) | ❌ Not available  | ✅ **Full implementation** (custom actions & data) | ✅ **Full implementation** (custom actions & data)   | Generic event tracking  |

### Legend

- ✅ **Full Implementation** - Feature completely implemented and functional
- ⚠️ **Fallback/Partial** - Basic functionality with fallback behavior
- 🔄 **In Progress** - Stub implementation, full feature planned
- ❌ **Not Available** - Feature not implemented or not available in official SDK

### Platform Strategy

**iOS Approach**: Uses official Parse.ly SDK for core analytics, custom implementations for enhanced features (heartbeat, activity detection).

**Android Approach**: Production-ready implementations for all enhanced features, with SDK-ready stubs for core Parsely analytics that can be easily activated when the official Android SDK becomes available.

**Unified JavaScript API**: Both platforms expose identical API surface for seamless cross-platform development. Enhanced features are fully functional on both platforms.

**Progressive Enhancement**: Core analytics use official SDKs where available (iOS) or maintain compatibility stubs (Android), while value-add features provide immediate functionality across platforms.

## 🚀 Installation

### From GitHub Package Registry

First, configure NPM to use GitHub Package Registry for @appik-studio packages:

```bash
# Create or update .npmrc in your project root
echo "@appik-studio:registry=https://npm.pkg.github.com" >> .npmrc
```

Then install the package:

```bash
npm install @appik-studio/expo-parsely
# or
yarn add @appik-studio/expo-parsely
# or
bun add @appik-studio/expo-parsely
```

### Authentication (if private repo)

If the repository is private, you'll need to authenticate:

```bash
npm login --scope=@appik-studio --registry=https://npm.pkg.github.com
# Use your GitHub username and a Personal Access Token with 'read:packages' permission
```

## ⚙️ Configuration

Configuration is done through the `ParselyProvider` component in your app:

### Configuration Options

| Option               | Type    | Required | Default   | Description                            |
| -------------------- | ------- | -------- | --------- | -------------------------------------- |
| `siteId`             | string  | ✅       | -         | Your Parse.ly site identifier          |
| `enableDebugLogging` | boolean | ❌       | `__DEV__` | Enable debug logging across the module |

## 📖 Usage

### 🚀 Quick Start with ParselyProvider (Recommended)

The easiest way to get started is with the `ParselyProvider` component that handles everything automatically:

```typescript
import { ParselyProvider } from '@appik-studio/expo-parsely'

export default function App() {
  return (
    <ParselyProvider
      siteId="your-site-id"
      autoInitialize={true}
      enableDebugLogging={__DEV__}
    >
      {/* Your app content */}
    </ParselyProvider>
  );
}
```

### Manual Setup

If you prefer manual control:

```typescript
import ExpoParsely from '@appik-studio/expo-parsely'

// Initialize the SDK
ExpoParsely.init('your-site-id', 60, false) // siteId, flushInterval, dryRun
```

### Page View Tracking

```typescript
import ExpoParsely, { ParselyMetadata, ExtraData } from '@appik-studio/expo-parsely'

// Basic page view
ExpoParsely.trackPageView('https://example.com/article')

// Advanced page view with metadata
const metadata: ParselyMetadata = {
  canonical_url: 'https://example.com/article',
  title: 'Amazing Article Title',
  authors: ['John Doe', 'Jane Smith'],
  section: 'Technology',
  tags: ['react-native', 'analytics', 'mobile'],
  pub_date: new Date(),
  image_url: 'https://example.com/image.jpg'
}

const extraData: ExtraData = {
  customField: 'customValue',
  userId: '12345'
}

ExpoParsely.trackPageView(
  'https://example.com/article',
  'https://example.com/home', // urlRef
  metadata,
  extraData,
  'custom-site-id' // optional custom site ID
)
```

### Engagement Tracking

```typescript
// Start engagement tracking
ExpoParsely.startEngagement(
  'https://example.com/article',
  'https://example.com/home', // urlRef
  extraData,
  'custom-site-id' // optional
)

// Stop engagement tracking
ExpoParsely.stopEngagement()
```

### Enhanced Heartbeat Tracking

```typescript
import { useHeartbeat } from '@appik-studio/expo-parsely'

function MyComponent() {
  const {
    status,
    recordActivity,
    startTracking,
    stopTracking,
    isActive
  } = useHeartbeat({
    enableHeartbeats: true,
    inactivityThresholdMs: 3000,
    intervalMs: 15000,
    maxDurationMs: 7200000 // 2 hours
  })

  useEffect(() => {
    // Note: startTracking/stopTracking now automatically integrate with engagement tracking
    startTracking()
    return () => stopTracking()
  }, [])

  const handleUserAction = () => {
    recordActivity() // Manually record user activity
    // ... your action logic
  }

  return (
    <View>
      <Text>Heartbeat Status: {status.isActive ? 'Active' : 'Inactive'}</Text>
      <Text>Session Duration: {status.sessionDuration}ms</Text>
      <Text>Total Activities: {status.totalActivities}</Text>
      <TouchableOpacity onPress={handleUserAction}>
        <Text>Record Activity</Text>
      </TouchableOpacity>
    </View>
  )
}
```

### Manual Element Tracking

For custom element tracking, use standard React Native components with `trackPageView`:

```typescript
import { TouchableOpacity, Text } from 'react-native'
import ExpoParsely from 'expo-parsely'

function MyScreen() {
  const handleButtonPress = () => {
    ExpoParsely.trackPageView({
      url: window.location.href,
      action: '_click',
      data: {
        elementId: 'header-cta-button',
        elementType: 'button',
        elementLocation: 'header'
      }
    })
    ExpoParsely.recordActivity()
  }

  return (
    <TouchableOpacity onPress={handleButtonPress}>
      <Text>Call to Action</Text>
    </TouchableOpacity>
  )
}
```

### 🎬 Parse.ly Video Tracking

Parse.ly's engaged-time methodology includes special support for video content. When video is playing, users are considered "engaged" even without other interactions.

```typescript
import { useReanimatedHeartbeat } from '@appik-studio/expo-parsely'

function VideoPlayer({ videoUrl }) {
  const { setVideoPlaying } = useReanimatedHeartbeat()

  const handleVideoStart = () => {
    // Notify Parse.ly that video is playing
    setVideoPlaying(true)
  }

  const handleVideoStop = () => {
    // Notify Parse.ly that video stopped
    setVideoPlaying(false)
  }

  return (
    <VideoComponent
      source={{ uri: videoUrl }}
      onPlay={handleVideoStart}
      onPause={handleVideoStop}
      onEnd={handleVideoStop}
    />
  )
}
```

**Parse.ly Engagement Formula:**

> `video playing OR (interacted recently AND window in focus)`

This matches Parse.ly's official [engaged-time documentation](https://docs.parse.ly/engaged-time/) methodology.

### Debug Overlay

For development and testing, use the HeartbeatDebugOverlay component:

```typescript
import { HeartbeatDebugOverlay } from '@appik-studio/expo-parsely'

function MyApp() {
  return (
    <View style={{ flex: 1 }}>
      {/* Your app content */}
      <YourAppContent />

      {/* Debug overlay - only shows in development */}
      <HeartbeatDebugOverlay />
    </View>
  )
}
```

**Features:**

- 💓 **Toggle Button** - Red heart in top-right corner to show/hide overlay
- 📊 **Real-time Stats** - Live tracking of activities, heartbeats, session duration
- 🔄 **Reset Button** - Clear debug counters
- 🎯 **Development Only** - Automatically hidden in production builds
- 📱 **Scroll Detection** - Shows current scroll state in real-time

### Activity Detection Configuration

```typescript
// Configure heartbeat settings
ExpoParsely.configureHeartbeat({
  enableHeartbeats: true,
  inactivityThresholdMs: 3000,
  intervalMs: 15000,
  maxDurationMs: 7200000 // 2 hours
})

// Configure activity detection
ExpoParsely.configureActivityDetection({
  enableTouchDetection: true,
  touchThrottleMs: 500,
  scrollThrottleMs: 2000,
  scrollThreshold: 5
})

// Heartbeat tracking is now automatically managed through engagement tracking
// Just start engagement and heartbeat will be handled automatically
ExpoParsely.startEngagement('https://example.com/article')
```

### Manual Activity Recording

```typescript
// Record user activity manually
ExpoParsely.recordActivity()

// Note: Heartbeat status, scroll state, and component tracking
// are now handled internally for optimal performance
```

### Common Parameters

Set parameters once that will be automatically included with all tracking calls:

```typescript
import ExpoParsely from '@appik-studio/expo-parsely'

// Set common parameters for all tracking calls
ExpoParsely.setCommonParameters({
  metadata: {
    section: 'mobile-app',
    authors: ['Mobile Team']
  },
  extraData: {
    app_version: '1.2.3',
    platform: 'ios',
    user_type: 'premium'
  },
  siteId: 'your-default-site-id'
})

// Now all trackPageView calls automatically include common parameters
// Method 1: URL as first parameter, options as second (iOS SDK style)
ExpoParsely.trackPageView('https://example.com/simple-article')

ExpoParsely.trackPageView('https://example.com/article/123', {
  metadata: {
    title: 'My Article' // Merged with common metadata
  }
})

// Method 2: Options object only (traditional style)
ExpoParsely.trackPageView({
  url: 'https://example.com/article/456',
  metadata: {
    title: 'Another Article',
    section: 'news'
  }
})

// Start engagement tracking (heartbeat)
// Method 1: URL as first parameter
ExpoParsely.startEngagement('https://example.com/article/123')

// Method 1: URL with options
ExpoParsely.startEngagement('https://example.com/article/123', {
  extraData: { reading_time: 300 }
})

// Method 2: Options object only
ExpoParsely.startEngagement({
  url: 'https://example.com/article/123',
  extraData: { reading_time: 300 }
})

// Get current common parameters
const params = ExpoParsely.getCommonParameters()

// Clear common parameters (e.g., on user logout)
ExpoParsely.clearCommonParameters()
```

## 🔧 API Reference

### ExpoParsely (Main Module)

Main class for Parse.ly SDK operations.

#### Core Methods

- `init(siteId: string): void` - Initialize SDK
- `trackPageView(urlOrPath: string, options?: Partial<PageViewOptions>): void` - Track page views with URL as first parameter
- `trackPageView(options: PageViewOptions): void` - Track page views with options object (must contain url property)
- `startEngagement(url: string, options?: Partial<EngagementOptions>): void` - Start engagement tracking with URL as first parameter
- `startEngagement(options: EngagementOptions): void` - Start engagement tracking with options object (must contain url property)
- `stopEngagement(): void` - Stop engagement tracking (includes automatic heartbeat cleanup)

#### Enhanced Methods

- `configureHeartbeat(config: HeartbeatConfig): void` - Configure heartbeat settings
- `configureActivityDetection(config: ActivityDetectionConfig): void` - Configure activity detection
- `recordActivity(): void` - Record user activity manually

#### Common Parameters Methods

- `setCommonParameters(params: CommonParameters): void` - Set parameters that will be automatically included with all tracking calls
- `getCommonParameters(): CommonParameters` - Get currently set common parameters
- `clearCommonParameters(): void` - Clear all common parameters

#### Element Tracking Methods

- `trackPageView(params: TrackPageViewParams): void` - Track page views with custom actions and data

### Components

#### ParselyProvider

Comprehensive provider component that automatically handles Parse.ly initialization, heartbeat tracking, activity detection, and navigation tracking.

**Props:**

- `siteId?: string` - Your Parse.ly site identifier
- `autoInitialize?: boolean` - Whether to auto-initialize the SDK (default: true)
- `flushInterval?: number` - Flush interval in seconds (default: 150)
- `dryRun?: boolean` - Whether to run in dry-run mode (default: false)
- `enableDebugLogging?: boolean` - Enable debug logging (default: false)
- `heartbeatConfig?: HeartbeatConfig` - Heartbeat configuration
- `activityDetectionConfig?: ActivityDetectionConfig` - Activity detection configuration

**Usage:**

```typescript
import { ParselyProvider } from '@appik-studio/expo-parsely'

export default function App() {
  return (
    <ParselyProvider
      siteId="your-site-id"
      heartbeatConfig={{
        enableHeartbeats: true,
        secondsBetweenHeartbeats: 150, // Parse.ly standard: 150 seconds
        activeTimeout: 5, // Parse.ly standard: 5 seconds
        onHeartbeat: (engagedSeconds) => console.log(`Engaged: ${engagedSeconds}s`),
        videoPlaying: false // Set to true when video content is playing
      }}
    >
      {/* Your app content */}
    </ParselyProvider>
  );
}
```

### 🔧 Debug Logging

The `enableDebugLogging` prop controls debug logging across the entire Parse.ly module. When enabled, you'll see detailed console messages prefixed with "💓 [Parse.ly Debug]" for:

- **Heartbeat Events**: Every 150 seconds when engaged
- **Activity Detection**: Touch, scroll, and interaction events
- **Engagement Tracking**: Session start/stop and engagement calculations
- **Video Tracking**: Video play/pause state changes
- **SDK Initialization**: Parse.ly SDK setup and configuration

```typescript
// Enable debug logging in development
<ParselyProvider
  siteId="your-site-id"
  enableDebugLogging={__DEV__} // true in dev, false in production
>
  {/* Your app */}
</ParselyProvider>

// Force enable for debugging in production
<ParselyProvider
  siteId="your-site-id"
  enableDebugLogging={true} // Always enabled
>
  {/* Your app */}
</ParselyProvider>
```

#### HeartbeatDebugOverlay

Development overlay for real-time heartbeat and activity monitoring.

**Usage:**

```typescript
import { HeartbeatDebugOverlay } from '@appik-studio/expo-parsely'

// Add to your app root - automatically hidden in production
<HeartbeatDebugOverlay />
```

**Features:**

- Auto-hidden in production (`__DEV__` check)
- Toggle button with heart emoji (💓)
- Real-time stats display
- Scroll state monitoring
- Reset functionality for debug counters

### Hooks

#### useReanimatedHeartbeat(config?: HeartbeatConfig)

Hook for managing heartbeat tracking with Parse.ly engagement integration.

**Returns:**

- `startHeartbeat: (url?: string) => Promise<void>` - Start heartbeat tracking, optionally with URL for engagement
- `stopHeartbeat: () => Promise<void>` - Stop heartbeat tracking and engagement
- `recordActivity: () => void` - Record user activity
- `isActive: boolean` - Current heartbeat status
- `config: HeartbeatConfig` - Final configuration used

#### useHeartbeatDebug()

Hook for accessing heartbeat debug information. Used internally by HeartbeatDebugOverlay.

**Returns:**

- `stats: HeartbeatDebugStats` - Current debug statistics
- `resetStats: () => void` - Reset debug counters

### Types

````typescript
interface ParselyMetadata {
  canonical_url?: string
  pub_date?: Date | number
  title?: string
  authors?: string[]
  image_url?: string
  section?: string
  tags?: string[]
  duration?: number
}

interface HeartbeatConfig {
  enableHeartbeats?: boolean // Enable/disable heartbeat tracking (default: true)
  secondsBetweenHeartbeats?: number // Parse.ly standard: 150 seconds between heartbeats
  activeTimeout?: number // Parse.ly standard: 5 seconds after interaction
  onHeartbeat?: (engagedSeconds: number) => void // Parse.ly callback for each heartbeat
  videoPlaying?: boolean // Parse.ly video tracking support
}

interface ActivityDetectionConfig {
  touchThrottleMs?: number
  scrollThrottleMs?: number
  scrollThreshold?: number
}

interface HeartbeatStatus {
  isActive: boolean
  lastActivity: number
  sessionDuration: number
  totalActivities: number
  totalHeartbeats: number
}

interface TrackingHierarchyConfig {
  componentName?: string
  testID?: string
  accessibilityLabel?: string
  trackingId?: string
  props?: Record<string, any>
}


## 🛠 Platform Requirements

### iOS

- iOS 12.0+
- Xcode 12+
- Swift 5.0+

### Android

- Android API 21+
- Kotlin support
- AndroidX

## 🔍 Troubleshooting

### iOS Issues

1. **Framework not found**: Ensure you have run `cd ios && pod install`
2. **Build errors**: Check that iOS deployment target is set to 12.0+
3. **Parse.ly SDK issues**: Verify Parse.ly iOS SDK is properly integrated

### Android Issues

1. **Module not found**: Ensure the Android SDK dependency is properly configured
2. **Build errors**: Check minimum SDK version is 21+
3. **Parse.ly dependency**: Ensure Parse.ly Android SDK is available in repositories

### Common Issues

1. **Site ID not working**: Verify your Parse.ly site ID is correct
2. **Events not appearing**: Check if `dryRun` mode is disabled in production
3. **Heartbeat not tracking**: Ensure `startEngagement()` is called after initialization (heartbeat is automatically managed)

## 🚧 Development

```bash
# Install dependencies
bun install

# Build the module
bun run build


# Lint
bun run lint

# Test
bun run test

# Open iOS project
bun run open:ios

# Open Android project
bun run open:android
````

### Testing Local Changes

```bash
# Link the local package
cd example
bun link ../

# Run the example app
bun run ios
# or
bun run android
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation for API changes
- Ensure cross-platform compatibility
- Test on both iOS and Android

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:

- [GitHub Issues](https://github.com/appik-studio/expo-parsely/issues)
- [GitHub Package Registry](https://github.com/appik-studio/expo-parsely/packages)
- [API Reference](./API_REFERENCE.md)
- [Release Guide](./RELEASE_GUIDE.md)
- [Parse.ly Documentation](https://docs.parse.ly/)
- [Expo Documentation](https://docs.expo.dev/)

## 📚 Related

- [Parse.ly iOS SDK](https://github.com/Parsely/AnalyticsSDK-iOS)
- [Parse.ly Android SDK](https://github.com/Parsely/parsely-android)
- [Parse.ly Dashboard](https://dash.parsely.com/)
- [Parse.ly API Documentation](https://www.parse.ly/help/integration/)

## 👨‍💻 Author

**Livio Gamassia** - [Appik-Studio](https://github.com/livio)

---

<div align="center">
  <p>Made with ❤️ for the React Native community</p>
  <p>
    <a href="https://www.parse.ly">Parse.ly</a> •
    <a href="https://expo.dev">Expo</a> •
    <a href="https://reactnative.dev">React Native</a>
  </p>
</div>
