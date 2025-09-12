# 📊 expo-parsely

Enhanced Expo plugin for Parse.ly Analytics SDK - provides comprehensive engagement tracking, heartbeat monitoring, and cross-platform analytics for React Native and Expo apps.

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

| Method/Feature | Parse.ly Official | iOS Implementation | Android Implementation | Strategy |
|---|---|---|---|---|
| **Core Analytics** |
| `init`/`configure` | ✅ Available | ✅ **SDK-based** | 🔄 **Production-ready stub** (SDK integration ready) | Progressive enhancement |
| `trackPageView` | ✅ Available | ✅ **SDK-based** | 🔄 **Production-ready stub** (SDK integration ready) | Progressive enhancement |
| `startEngagement` | ✅ Available | ✅ **SDK-based** (includes heartbeat) | 🔄 **Production-ready stub** (SDK integration ready) | Progressive enhancement |
| `stopEngagement` | ✅ Available | ✅ **SDK-based** (includes heartbeat) | 🔄 **Production-ready stub** (SDK integration ready) | Progressive enhancement |
| **Enhanced Configuration** |
| `configureHeartbeat` | ❌ Not available | ✅ **Full implementation** | ✅ **Full implementation** | Value-add feature |
| `configureActivityDetection` | ❌ Not available | ✅ **Full implementation** | ✅ **Full implementation** | Value-add feature |
| `recordActivity` | ❌ Not available | ✅ **Full implementation** | ✅ **Full implementation** | Value-add feature |
| **Element Tracking** |
| `trackElement` | ❌ Not available | ✅ **Full implementation** (custom URL tracking + activity) | ✅ **Full implementation** (custom URL tracking + activity) | Differentiation feature |

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

Add the plugin to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      [
        "@appik-studio/expo-parsely",
        {
          "siteId": "your-parsely-site-id"
        }
      ]
    ]
  }
}
```

### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `siteId` | string | ✅ | - | Your Parse.ly site identifier |

## 📖 Usage

### Basic Setup

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

### Trackable Components

```typescript
import { TrackableTouchable } from '@appik-studio/expo-parsely'

function MyScreen() {
  return (
    <TrackableTouchable
      trackingId="header-cta-button"
      componentName="CTAButton"
      elementType="button"
      trackImpressions={true}
      trackViews={true}
      viewThreshold={1000} // Track view after 1 second
      onPress={() => console.log('Button pressed')}
    >
      <Text>Call to Action</Text>
    </TrackableTouchable>
  )
}
```

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

### Element Tracking

```typescript
import { useElementTracking } from '@appik-studio/expo-parsely'

function TrackedComponent() {
  const { trackElement, trackingId } = useElementTracking({
    elementId: 'product-card',
    elementType: 'card',
    trackImpressions: true,
    trackViews: true,
    viewThreshold: 500
  })

  const handleProductClick = () => {
    trackElement('click', 'card', 'product-card', '/shop/products')
  }

  return (
    <TouchableOpacity onPress={handleProductClick}>
      <Text>Product Card</Text>
    </TouchableOpacity>
  )
}
```

### Component Hierarchy Tracking

```typescript
import { useTrackingHierarchy } from '@appik-studio/expo-parsely'

function MyComponent({ children }) {
  const trackingId = useTrackingHierarchy({
    componentName: 'ProductList',
    testID: 'product-list',
    accessibilityLabel: 'List of products',
    props: { itemCount: 10, category: 'electronics' }
  })

  return (
    <View testID="product-list">
      {children}
    </View>
  )
}
```


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
  enableScrollDetection: true,
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

## 🔧 API Reference

### ExpoParsely (Main Module)

Main class for Parse.ly SDK operations.

#### Core Methods

- `init(siteId: string, flushInterval?: number, dryRun?: boolean): void` - Initialize SDK
- `trackPageView(url: string, urlRef?: string, metadata?: ParselyMetadata, extraData?: ExtraData, siteId?: string): void` - Track page views
- `startEngagement(url: string, urlRef?: string, extraData?: ExtraData, siteId?: string): void` - Start engagement tracking (includes automatic heartbeat monitoring)
- `stopEngagement(): void` - Stop engagement tracking (includes automatic heartbeat cleanup)


#### Enhanced Methods

- `configureHeartbeat(config: HeartbeatConfig): void` - Configure heartbeat settings  
- `configureActivityDetection(config: ActivityDetectionConfig): void` - Configure activity detection
- `recordActivity(): void` - Record user activity manually

#### Element Tracking Methods  

- `trackElement(action: string, elementType: string, elementId: string, location: string): void` - Track element interactions

### Components

#### TrackableTouchable

Enhanced TouchableOpacity with automatic tracking capabilities.

**Props:**
- `trackingId?: string` - Unique identifier for tracking
- `componentName?: string` - Component name for hierarchy tracking
- `elementType?: string` - Element type for analytics classification
- `trackImpressions?: boolean` - Track impressions when mounted
- `trackViews?: boolean` - Track views when visible
- `viewThreshold?: number` - Time threshold for "viewed" (ms)

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

#### useHeartbeat(config?: HeartbeatConfig)

Hook for managing heartbeat tracking.

**Returns:**
- `status: HeartbeatStatus` - Current heartbeat status
- `recordActivity: () => void` - Record activity manually
- `startTracking: () => void` - Start heartbeat tracking
- `stopTracking: () => void` - Stop heartbeat tracking
- `isActive: boolean` - Whether tracking is active

#### useElementTracking(config: ElementTrackingConfig)

Hook for element-specific tracking.

**Returns:**
- `trackElement: (action: string, elementType: string, elementId: string, location: string) => void`
- `trackingId: string` - Generated tracking ID

#### useTrackingHierarchy(config: TrackingHierarchyConfig)

Hook for component hierarchy tracking.

**Returns:**
- `trackingId: string` - Generated tracking ID for the component

#### useHeartbeatDebug()

Hook for accessing heartbeat debug information. Used internally by HeartbeatDebugOverlay.

**Returns:**
- `stats: HeartbeatDebugStats` - Current debug statistics
- `resetStats: () => void` - Reset debug counters

### Types

```typescript
interface ParselyMetadata {
  canonical_url?: string;
  pub_date?: Date | number;
  title?: string;
  authors?: string[];
  image_url?: string;
  section?: string;
  tags?: string[];
  duration?: number;
}


interface HeartbeatConfig {
  enableHeartbeats?: boolean;
  inactivityThresholdMs?: number;
  intervalMs?: number;
  maxDurationMs?: number;
}

interface ActivityDetectionConfig {
  enableTouchDetection?: boolean;
  enableScrollDetection?: boolean;
  touchThrottleMs?: number;
  scrollThrottleMs?: number;
  scrollThreshold?: number;
}

interface HeartbeatStatus {
  isActive: boolean;
  lastActivity: number;
  sessionDuration: number;
  totalActivities: number;
  totalHeartbeats: number;
}

interface TrackingHierarchyConfig {
  componentName?: string;
  testID?: string;
  accessibilityLabel?: string;
  trackingId?: string;
  props?: Record<string, any>;
}
```

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

# Build the plugin
bun run build:plugin

# Lint
bun run lint

# Test
bun run test

# Run example on iOS
bun run open:ios

# Run example on Android
bun run open:android

# Refresh iOS build
bun run ios:refresh

# Refresh Android build
bun run android:refresh
```

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
