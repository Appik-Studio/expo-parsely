# 📚 expo-parsely API Reference

Complete API documentation for implementing expo-parsely in your React Native or Expo project.

## 📦 Installation & Setup

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

### Expo Plugin Configuration

Add to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-parsely", 
        {
          "siteId": "your-parsely-site-id"
        }
      ]
    ]
  }
}
```

---

## 🎯 Core Module Functions

### ExpoParsely

Main class providing Parse.ly analytics functionality.

```typescript
import ExpoParsely from 'expo-parsely';
```

#### Core Analytics Methods

##### `init(siteId: string, options?: InitOptions): void`

Initialize the Parse.ly SDK.

```typescript
ExpoParsely.init('your-site-id', {
  flushInterval: 150, // seconds (Parse.ly default: 150)
  dryRun: false       // set true for testing
});
```

**Parameters:**
- `siteId` (string): Your Parse.ly site identifier
- `options.flushInterval?` (number): Seconds between data flushes (default: 150)
- `options.dryRun?` (boolean): Test mode flag (default: false)

##### `trackPageView(url: string, urlRef?: string, metadata?: ParselyMetadata, extraData?: ExtraData, siteId?: string): void`

Track page views with optional metadata.

```typescript
ExpoParsely.trackPageView(
  'https://example.com/article',
  'https://example.com/home', // referrer URL
  {
    title: 'Article Title',
    authors: ['John Doe'],
    section: 'Technology',
    tags: ['react-native', 'mobile']
  },
  { userId: '12345' },
  'custom-site-id' // optional override
);
```

##### `startEngagement(url: string, urlRef?: string, extraData?: ExtraData, siteId?: string): void`

Start engagement tracking for a URL.

```typescript
ExpoParsely.startEngagement(
  'https://example.com/article',
  'https://example.com/home',
  { sessionId: 'session-123' }
);
```

##### `stopEngagement(): void`

Stop current engagement tracking.

```typescript
ExpoParsely.stopEngagement();
```

#### Enhanced Heartbeat Methods

##### `configureHeartbeat(config: HeartbeatConfig): void`

Configure heartbeat tracking settings.

```typescript
ExpoParsely.configureHeartbeat({
  enableHeartbeats: true,
  inactivityThresholdMs: 5000,    // Parse.ly default: 5s
  intervalMs: 150000,             // Parse.ly default: 150s
  maxDurationMs: 3600000          // 1 hour
});
```

##### `configureActivityDetection(config: ActivityDetectionConfig): void`

Configure activity detection settings.

```typescript
ExpoParsely.configureActivityDetection({
  enableTouchDetection: true,
  enableScrollDetection: true,
  touchThrottleMs: 500,
  scrollThrottleMs: 2000,
  scrollThreshold: 5
});
```

##### `startHeartbeatTracking(): void`

Start heartbeat tracking session.

```typescript
ExpoParsely.startHeartbeatTracking();
```

##### `stopHeartbeatTracking(): void`

Stop heartbeat tracking session.

```typescript
ExpoParsely.stopHeartbeatTracking();
```

##### `recordActivity(): void`

Manually record user activity.

```typescript
ExpoParsely.recordActivity();
```

##### `getHeartbeatStatus(): HeartbeatStatus`

Get current heartbeat tracking status.

```typescript
const status = ExpoParsely.getHeartbeatStatus();
console.log('Active:', status.isActive);
console.log('Activities:', status.totalActivities);
```

#### Video Tracking Methods

##### `trackPlay(url: string, videoMetadata: ParselyVideoMetadata, urlRef?: string, extraData?: ExtraData, siteId?: string): void`

Track video play events.

```typescript
ExpoParsely.trackPlay(
  'https://example.com/video.mp4',
  {
    videoId: 'video-123',
    duration: 300,
    title: 'Tutorial Video'
  },
  'https://example.com/playlist'
);
```

##### `trackPause(): void`

Track video pause events.

```typescript
ExpoParsely.trackPause();
```

##### `resetVideo(): void`

Reset video tracking state.

```typescript
ExpoParsely.resetVideo();
```

#### Element Tracking Methods

##### `trackElement(action: string, elementType: string, elementId: string, location: string): void`

Track interactions with UI elements.

```typescript
ExpoParsely.trackElement(
  'click',           // action
  'button',          // element type
  'header-cta',      // element ID
  '/home/header'     // location context
);
```

##### `registerComponentTracking(config: TrackingHierarchyConfig): string`

Register a component for tracking hierarchy.

```typescript
const trackingId = ExpoParsely.registerComponentTracking({
  componentName: 'ProductCard',
  testID: 'product-card-123',
  props: { category: 'electronics', price: 99.99 }
});
```

##### `unregisterComponentTracking(trackingId: string): void`

Unregister component from tracking.

```typescript
ExpoParsely.unregisterComponentTracking(trackingId);
```

#### Scroll & Touch Detection Methods

##### `setScrollState(isScrolling: boolean): void`

Set current scroll state.

```typescript
ExpoParsely.setScrollState(true);  // user started scrolling
ExpoParsely.setScrollState(false); // user stopped scrolling
```

##### `isCurrentlyScrolling(): boolean`

Check if user is currently scrolling.

```typescript
const scrolling = ExpoParsely.isCurrentlyScrolling();
```

---

## 🎨 Components

### TrackableTouchable

Enhanced TouchableOpacity with automatic tracking.

```typescript
import { TrackableTouchable } from 'expo-parsely';

<TrackableTouchable
  trackingId="unique-button-id"
  componentName="CTAButton"
  elementType="button"
  trackImpressions={true}
  trackViews={true}
  viewThreshold={1000}
  location="/screen/section"
  onTrackingEvent={(event, data) => console.log(event, data)}
  onPress={handlePress}
>
  <Text>Call to Action</Text>
</TrackableTouchable>
```

**Props:**
- `trackingId?` (string): Unique identifier
- `componentName?` (string): Component name for hierarchy
- `elementType?` (string): Type classification
- `trackImpressions?` (boolean): Track when component mounts
- `trackViews?` (boolean): Track when component becomes visible
- `viewThreshold?` (number): Time in ms before counting as "viewed"
- `location?` (string): Context/path information
- `onTrackingEvent?` (function): Callback for tracking events
- All TouchableOpacity props

### HeartbeatTouchBoundary

Wrapper that detects touch activity for heartbeat tracking.

```typescript
import { HeartbeatTouchBoundary } from 'expo-parsely';

<HeartbeatTouchBoundary
  onTouchActivity={() => console.log('Activity detected')}
  enableScrollTracking={true}
  throttleMs={1000}
>
  <YourAppContent />
</HeartbeatTouchBoundary>
```

**Props:**
- `onTouchActivity?` (function): Called when activity is detected
- `enableScrollTracking?` (boolean): Track scroll as activity
- `throttleMs?` (number): Throttle activity detection
- `children` (ReactNode): Child components

### NavigationTracker

Automatic navigation tracking component.

```typescript
import { NavigationTracker } from 'expo-parsely';

<NavigationTracker
  navigationRef={navigationRef}
  trackScreenViews={true}
  trackRouteChanges={true}
/>
```

**Props:**
- `navigationRef` (NavigationContainerRef): React Navigation ref
- `trackScreenViews?` (boolean): Auto-track screen views
- `trackRouteChanges?` (boolean): Track route changes

---

## 🪝 Hooks

### useHeartbeat(config?: HeartbeatConfig)

Hook for managing heartbeat tracking.

```typescript
import { useHeartbeat } from 'expo-parsely';

function MyComponent() {
  const {
    status,
    recordActivity,
    startTracking,
    stopTracking,
    isActive
  } = useHeartbeat({
    enableHeartbeats: true,
    inactivityThresholdMs: 5000,
    intervalMs: 150000
  });

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);

  return (
    <View>
      <Text>Active: {isActive ? 'Yes' : 'No'}</Text>
      <Text>Activities: {status.totalActivities}</Text>
    </View>
  );
}
```

**Returns:**
- `status` (HeartbeatStatus): Current tracking status
- `recordActivity` (function): Manually record activity
- `startTracking` (function): Start tracking session
- `stopTracking` (function): Stop tracking session
- `isActive` (boolean): Whether tracking is active

### useElementTracking(config: ElementTrackingConfig)

Hook for element-specific tracking.

```typescript
import { useElementTracking } from 'expo-parsely';

function TrackedComponent() {
  const { trackElement, trackingId } = useElementTracking({
    elementId: 'product-card',
    elementType: 'card',
    trackImpressions: true,
    trackViews: true,
    viewThreshold: 500
  });

  const handleClick = () => {
    trackElement('click', 'card', 'product-card', '/products');
  };

  return (
    <TouchableOpacity onPress={handleClick}>
      <Text>Product Card</Text>
    </TouchableOpacity>
  );
}
```

**Parameters:**
- `config` (ElementTrackingConfig): Tracking configuration

**Returns:**
- `trackElement` (function): Track element interactions
- `trackingId` (string): Generated tracking ID

### useTrackingHierarchy(config: TrackingHierarchyConfig)

Hook for component hierarchy tracking.

```typescript
import { useTrackingHierarchy } from 'expo-parsely';

function MyComponent({ children }) {
  const trackingId = useTrackingHierarchy({
    componentName: 'ProductList',
    testID: 'product-list',
    props: { itemCount: 10, category: 'electronics' }
  });

  return (
    <View testID="product-list">
      {children}
    </View>
  );
}
```

**Parameters:**
- `config` (TrackingHierarchyConfig): Hierarchy configuration

**Returns:**
- `trackingId` (string): Generated tracking ID

---

## 🌐 Context

### TrackingProvider & useTrackingContext

Global tracking context for the app.

```typescript
import { TrackingProvider, useTrackingContext } from 'expo-parsely';

// App root
function App() {
  return (
    <TrackingProvider>
      <YourApp />
    </TrackingProvider>
  );
}

// In any child component
function SomeComponent() {
  const { recordActivity, isActive } = useTrackingContext();
  
  return (
    <TouchableOpacity onPress={recordActivity}>
      <Text>Status: {isActive ? 'Active' : 'Inactive'}</Text>
    </TouchableOpacity>
  );
}
```

---

## 📝 TypeScript Interfaces

### Core Types

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

interface ParselyVideoMetadata extends ParselyMetadata {
  videoId: string;
  duration: number; // required for video
}

interface ExtraData {
  [key: string]: any;
}
```

### Configuration Types

```typescript
interface HeartbeatConfig {
  enableHeartbeats?: boolean;
  inactivityThresholdMs?: number;  // Parse.ly default: 5000
  intervalMs?: number;             // Parse.ly default: 150000
  maxDurationMs?: number;          // default: 3600000 (1 hour)
}

interface ActivityDetectionConfig {
  enableTouchDetection?: boolean;
  enableScrollDetection?: boolean;
  touchThrottleMs?: number;
  scrollThrottleMs?: number;
  scrollThreshold?: number;
}

interface TrackingHierarchyConfig {
  componentName?: string;
  testID?: string;
  accessibilityLabel?: string;
  trackingId?: string;
  props?: Record<string, any>;
  disabled?: boolean;
}

interface ElementTrackingConfig {
  elementId: string;
  elementType: string;
  trackImpressions?: boolean;
  trackViews?: boolean;
  viewThreshold?: number;
}
```

### Status Types

```typescript
interface HeartbeatStatus {
  isActive: boolean;
  lastActivity: number;      // timestamp
  sessionDuration: number;   // milliseconds
  totalActivities: number;
  totalHeartbeats: number;
}

interface TrackableComponentProps {
  componentName?: string;
  trackingId?: string;
  elementType?: string;
  trackImpressions?: boolean;
  trackViews?: boolean;
  viewThreshold?: number;
  enableScrollTracking?: boolean;
}
```

---

## 🚀 Quick Start Examples

### Basic Setup

```typescript
import ExpoParsely, { TrackingProvider } from 'expo-parsely';

// 1. Initialize
ExpoParsely.init('your-site-id');

// 2. Wrap app with provider
function App() {
  return (
    <TrackingProvider>
      <YourAppContent />
    </TrackingProvider>
  );
}

// 3. Track page views
ExpoParsely.trackPageView('https://myapp.com/screen/home');
```

### Advanced Heartbeat Setup

```typescript
import { useHeartbeat, HeartbeatTouchBoundary } from 'expo-parsely';

function AppWithHeartbeat() {
  const { startTracking, stopTracking } = useHeartbeat({
    enableHeartbeats: true,
    inactivityThresholdMs: 5000,
    intervalMs: 150000
  });

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);

  return (
    <HeartbeatTouchBoundary onTouchActivity={() => console.log('Activity!')}>
      <YourAppContent />
    </HeartbeatTouchBoundary>
  );
}
```

### Element Tracking Setup

```typescript
import { TrackableTouchable, useElementTracking } from 'expo-parsely';

function ProductCard({ product }) {
  const { trackElement } = useElementTracking({
    elementId: `product-${product.id}`,
    elementType: 'card',
    trackImpressions: true,
    trackViews: true
  });

  return (
    <TrackableTouchable
      trackingId={`product-${product.id}`}
      elementType="card"
      onPress={() => trackElement('click', 'card', `product-${product.id}`, '/products')}
    >
      <Text>{product.name}</Text>
    </TrackableTouchable>
  );
}
```

---

## ⚙️ Platform Support

- **iOS**: 12.0+ with Parse.ly iOS SDK integration
- **Android**: API 21+ with Parse.ly Android SDK integration
- **TypeScript**: Full type definitions included
- **Expo**: Compatible with Expo SDK 48+

---

## 📊 Implementation Status

| Feature | iOS | Android | Status |
|---------|-----|---------|--------|
| Core Analytics | ✅ SDK | 🔄 Custom | Ready |
| Heartbeat Tracking | ✅ Custom | ✅ Custom | Ready |
| Element Tracking | ✅ Custom | ✅ Custom | Ready |
| Video Analytics | ⚠️ Fallback | 🔄 Custom | Beta |

---

This API reference provides everything needed to integrate expo-parsely into your React Native or Expo project. For implementation examples and troubleshooting, see the main README.md file.
