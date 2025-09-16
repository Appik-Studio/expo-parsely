# 💓 Heartbeat Debug Guide

## 🎯 Debug System Overview

Le système de heartbeat ultra-performant est maintenant actif avec un système de debug complet pour tracer toutes les interactions et événements.

## 📊 Debug Features

### 1. **Console Logs Détaillés**

Tous les logs sont préfixés avec `💓 [Heartbeat]` pour faciliter le filtrage :

```bash
# Filtrer les logs heartbeat dans Metro/Flipper
💓 [Heartbeat] Hook initialized with config: {...}
💓 [Heartbeat] Starting tracking session: {...}
💓 [Heartbeat] Activity detected - session activated: {...}
💓 [Heartbeat] Heartbeat check: {...}
💓 [Heartbeat] Sending heartbeat event: {...}
💓 [Heartbeat] Heartbeat stopped - inactivity: {...}
```

### 2. **Visual Debug Overlay**

- **Toggle Button** : Bouton rouge 💓 en haut à droite
- **Stats en Temps Réel** :
  - Status (Active/Inactive)
  - Nombre d'activités détectées
  - Nombre de heartbeats envoyés
  - Durée de session
  - Dernière activité
- **Reset Button** : Remet les compteurs à zéro

### 3. **Boundary-Level Tracking**

Logs détaillés pour chaque interaction détectée automatiquement :

```bash
🎯 [HeartbeatTouchBoundary] Touch start detected - recording activity
🎯 [HeartbeatTouchBoundary] SCROLLING DETECTED - Recording as activity (Parse.ly compatible)
🎯 [HeartbeatTouchBoundary] SCROLL activity detected - recording (throttled)
🎯 [HeartbeatTouchBoundary] Touch ended - scroll gesture complete, resetting ALL state
```

## 🔍 How to Debug

### **1. Démarrer l'App en Dev Mode**

```bash
cd apps/app
bun run dev
```

### **2. Ouvrir les Dev Tools**

- **Metro** : Logs dans le terminal
- **Flipper** : React Native Logs
- **Chrome DevTools** : Si web

### **3. Activer l'Overlay Debug**

- Tap sur le bouton rouge 💓 en haut à droite
- L'overlay affiche les stats en temps réel

### **4. Tester les Interactions**

- **Touch** : Tap n'importe où dans l'app (automatiquement détecté par HeartbeatTouchBoundary - enregistre activité + reset timer heartbeat)
- **Scroll** : Scroll dans les listes/écrans (détection automatique du scroll - enregistre activité + reset timer heartbeat)
- **Screen Changes** : Wrapper manuellement les écrans avec TrackableScreen pour tracking explicite

### **5. Vérifier les Analytics**

Les événements `nonIdle` sont envoyés avec les logs :

```bash
📊 [Analytics] trackHeartbeat called: { engagementTime: 15 }
💓 [Analytics] trackHeartbeat called: { engagementTime: 15 }
```

## 🎯 Activity Recording System

Le système d'activité consolidé enregistre tous les types d'interactions utilisateur et reset automatiquement le timer heartbeat :

### **Types d'Activité**

1. **Touch Events** (`HeartbeatTouchBoundary`)
   - Détecte automatiquement tous les touch events (tap, scroll)
   - Déclenche le worklet useReanimatedHeartbeat
   - Logs: `🎯 [HeartbeatTouchBoundary]`

2. **Screen Tracking** (`ParselyTrackablePageView`)
   - Tracking manuel des écrans (pas automatique)
   - Déclenche le worklet useReanimatedHeartbeat
   - Logs: Screen tracking logs

3. **Worklet Processing** (`useReanimatedHeartbeat`)
   - Traite toutes les interactions utilisateur
   - Enregistre activité Parse.ly + reset timer heartbeat
   - Logs: `📊 [Parse.ly] Activity recorded from heartbeat worklet`

### **Flux d'Activité Simplifié**

```
Touch/Scroll Events → HeartbeatTouchBoundary → useReanimatedHeartbeat Worklet
Screen Changes → ParselyTrackablePageView → useReanimatedHeartbeat Worklet
    ↓
Worklet → ExpoParsely.recordActivity() → Parse.ly Recording + Heartbeat Timer Reset
```

Toutes les interactions utilisateur reset le timer heartbeat, assurant un tracking précis de l'engagement !

## 🏗️ Architecture Simplifiée

**Native Modules (Swift/Kotlin)**

- ✅ Modules natifs simplifiés - seulement les fonctions essentielles
- ✅ Plus de logique complexe heartbeat/scroll dans les modules natifs
- ✅ Logique gérée par le worklet React Native et les composants

**Worklet Processing**

- ✅ Toute la logique active/inactive et scroll gérée par `useReanimatedHeartbeat`
- ✅ `ExpoParsely.recordActivity()` appelé seulement depuis le worklet
- ✅ Performance optimale avec traitement UI thread

## 📱 Utilisation de ParselyTrackablePageView

Pour tracker manuellement les changements d'écran (nécessite ParselyProvider) :

```tsx
import { ParselyTrackablePageView } from 'expo-parsely'

// Wrapper votre écran principal
<ParselyTrackablePageView
  screenName="Home Screen"
  screenUrl="/home"
  analyticsContext={{ userType: 'premium' }}
>
  <YourHomeScreenContent />
</ParselyTrackablePageView>

// Ou dans un autre écran
<ParselyTrackablePageView
  screenName="Product Details"
  screenUrl="/products/123"
  analyticsContext={{ productId: '123', category: 'electronics' }}
>
  <ProductDetailsContent />
</ParselyTrackablePageView>
```

## 🎛️ Configuration Debug

### **Intervalles de Debug**

```typescript
// Dans useReanimatedHeartbeat.ts
const DEFAULT_CONFIG = {
  intervalMs: 15000, // Heartbeat toutes les 15s
  inactivityThresholdMs: 5000, // Inactif après 5s
  maxDurationMs: 3600000 // Max 1h de tracking
}
```

### **Debug Stats Update**

```typescript
// Dans _layout.tsx - Debug info toutes les 30s
const interval = setInterval(() => {
  debugInfo()
}, 30000)
```
