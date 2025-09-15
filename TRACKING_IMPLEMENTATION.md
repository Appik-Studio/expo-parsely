# Parsely Analytics - 1:1 Implementation

This document provides a **1:1 implementation** of the requirements specified in [`tracking.md`](./tracking.md) using the Expo Parsely library.

## Overview

This implementation exactly matches the specifications in `tracking.md`, including:

- Common parameters sent with all events
- Event types and their parameters
- Heartbeat engagement measurement configuration

## Setup

```typescript
import ExpoParsely from 'expo-parsely'

// Initialize with your site ID
ExpoParsely.init('your-site-id', {
  flushInterval: 150, // 2.5 minutes
  dryRun: false
})

// Configure heartbeat according to tracking.md specifications
ExpoParsely.configureHeartbeat({
  inactivityThresholdMs: 5000, // 5 seconds (as per tracking.md)
  intervalMs: 15000, // 15 seconds (as per tracking.md)
  maxDurationMs: 3600000 // 1 hour (as per tracking.md)
})

// Configure activity detection for touch and scroll
ExpoParsely.configureActivityDetection({
  enableTouchDetection: true, // For mousedown/touch events
  enableScrollDetection: true // For scroll events
})
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

### conversions.trackLeadCapture

**Specification**: Sent immediately after user registration with `type: 'SignUp'`.

```typescript
function trackLeadCapture() {
  ExpoParsely.trackPageView({
    url: window.location.href,
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
function trackNewsletterSignup() {
  ExpoParsely.trackPageView({
    url: window.location.href,
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
function trackSubscription() {
  ExpoParsely.trackPageView({
    url: window.location.href,
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
function trackCustomConversion(eventType: string, additionalData?: any) {
  ExpoParsely.trackPageView({
    url: window.location.href,
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
// Record different types of user activity as specified in tracking.md
function recordUserActivity(activityType: 'touch' | 'scroll') {
  switch (activityType) {
    case 'touch':
      // Corresponds to mousedown/touch in tracking.md
      ExpoParsely.recordActivity()
      break
    case 'scroll':
      // Corresponds to scroll in tracking.md
      ExpoParsely.setScrollState(true)
      break
  }
}

// Usage in components
function handleTouchStart() {
  recordUserActivity('touch')
}

function handleScrollStart() {
  recordUserActivity('scroll')
}
```

## Complete Implementation Class

Here's a complete implementation class that provides all functionality specified in `tracking.md`:

```typescript
import ExpoParsely from 'expo-parsely'

interface UserContext {
  plan: 'anonyme' | 'registered' | 'paid'
  accesibility_article: 0 | 1
  spyri_user_id: string
}

class ParselyTracker {
  private currentUser: UserContext | null = null

  // Initialize according to tracking.md specifications
  init(siteId: string) {
    ExpoParsely.init(siteId, {
      flushInterval: 150,
      dryRun: false
    })

    // Configure heartbeat exactly as specified in tracking.md
    ExpoParsely.configureHeartbeat({
      inactivityThresholdMs: 5000, // 5 seconds
      intervalMs: 15000, // 15 seconds
      maxDurationMs: 3600000 // 1 hour
    })

    // Configure activity detection for specified interactions
    ExpoParsely.configureActivityDetection({
      enableTouchDetection: true, // For mousedown/touch
      enableScrollDetection: true // For scroll
    })
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
  trackLeadCapture() {
    ExpoParsely.trackPageView({
      url: window.location.href,
      action: '_LeadCapture',
      data: { type: 'SignUp' }, // As specified in tracking.md
      metadata: this.getUserMetadata()
    })
  }

  // conversions.trackNewsletterSignup - Newsletter signup
  trackNewsletterSignup() {
    ExpoParsely.trackPageView({
      url: window.location.href,
      action: '_NewsletterSignup',
      data: {}, // No additional parameters
      metadata: this.getUserMetadata()
    })
  }

  // conversions.trackSubscription - Subscription confirmation
  trackSubscription() {
    ExpoParsely.trackPageView({
      url: window.location.href,
      action: '_Subscription',
      data: {}, // No additional parameters
      metadata: this.getUserMetadata()
    })
  }

  // conversions.trackCustom - Custom conversions
  trackCustomConversion(eventType: string, additionalData?: any) {
    ExpoParsely.trackPageView({
      url: window.location.href,
      action: `_${eventType}`,
      data: additionalData || {},
      metadata: this.getUserMetadata()
    })
  }

  // Activity recording for heartbeat system
  recordActivity(activityType: 'touch' | 'scroll') {
    switch (activityType) {
      case 'touch':
        ExpoParsely.recordActivity()
        break
      case 'scroll':
        ExpoParsely.setScrollState(true)
        break
    }
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

// Record user activity for heartbeat
parselyTracker.recordActivity('touch') // User touch interaction
parselyTracker.recordActivity('scroll') // User scroll interaction
```

## React Component Integration

```tsx
import React, { useEffect } from 'react'
import { parselyTracker } from './parsely-tracker'

function ArticlePage({ article, user }) {
  useEffect(() => {
    // Set user context
    parselyTracker.setUser(user)

    // Track page view
    parselyTracker.trackPageView(window.location.href, {
      articleId: article.id,
      title: article.title
    })

    // Start engagement tracking
    ExpoParsely.startHeartbeatTracking()

    return () => {
      // Stop engagement tracking
      ExpoParsely.stopHeartbeatTracking()
    }
  }, [article, user])

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
    <div>
      <h1>{article.title}</h1>
      {/* Article content */}
      <button onClick={handleUserRegistration}>Register</button>
      <button onClick={handleNewsletterSignup}>Subscribe to Newsletter</button>
    </div>
  )
}
```

## HeartbeatTouchBoundary Integration

For automatic activity detection as specified in `tracking.md`:

```tsx
import { HeartbeatTouchBoundary } from 'expo-parsely'

function App() {
  return (
    <HeartbeatTouchBoundary onTouchActivity={() => parselyTracker.recordActivity('touch')}>
      {/* Your app content */}
    </HeartbeatTouchBoundary>
  )
}
```

This implementation provides a **1:1 mapping** of the `tracking.md` specifications to the Expo Parsely library, ensuring complete compliance with the original requirements.
