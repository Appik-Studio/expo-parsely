# Parsely Analytics - Legacy Specification

⚠️ **Note**: This document describes a specific implementation approach for Parsely analytics.
The Expo Parsely library is now **generic** and can be configured for any analytics requirements.

For implementation guidance using the generic library to achieve these specifications, see [`TRACKING_USAGE_GUIDE.md`](./TRACKING_USAGE_GUIDE.md).

---

On utilise Parsely pour des analytics orientées contenu et engagement.

## Paramètres communs

Ces paramètres sont envoyés avec tous les évènements

| Paramètre              | Description                          | Exemple                         |
| ---------------------- | ------------------------------------ | ------------------------------- |
| `plan`                 | Catégorie d'utilisateur              | `anonyme`, `registered`, `paid` |
| `accesibility_article` | Accessibilité de l'article (booléen) | `0` (gratuit), `1` (payant)     |
| `spyri_user_id`        | ID Spyri de l'utilisateur            | `12345`                         |

## Types d'évènements

### trackPageView

Évènement Parsely de base lors d'un page load. Envoyé avec les paramètres communs ci-dessus.

---

### conversions.trackLeadCapture

Envoyé immédiatement après l'inscription d'un utilisateur.

| Paramètre | Description          | Exemple  |
| --------- | -------------------- | -------- |
| `type`    | Type de lead capture | `SignUp` |

---

### conversions.trackNewsletterSignup

Envoyé lors de l'inscription à une newsletter.
Aucun paramètre supplémentaire.

---

### conversions.trackSubscription

Envoyé sur la page de confirmation après un achat d'abonnement.
Aucun paramètre supplémentaire.

---

### conversions.trackCustom

Envoyé pour des conversions personnalisées.

| Évènement   | Description                                |
| ----------- | ------------------------------------------ |
| `WallClick` | Clic sur un wall (paywall, freewall, etc.) |

---

## Mesure d'engagement (Heartbeat)

Parsely implémente un système de "heartbeat" qui mesure le temps d'engagement actif de l'utilisateur:

- L'utilisateur est considéré comme inactif après 5 secondes sans interaction
- Les interactions trackées : `mousedown` (touch), `keydown` (keyboard), `scroll`, `mousemove` (touch move)
- Un évènement `nonIdle` est envoyé toutes les 15 secondes avec le temps d'engagement
- Le temps maximum tracké est d'1 heure (3600000 ms)
- Configuration par défaut :
  - `inactivityThresholdMs`: 5000 (5 secondes)
  - `intervalMs`: 15000 (15 secondes)
  - `maxDurationMs`: 3600000 (1 heure)
