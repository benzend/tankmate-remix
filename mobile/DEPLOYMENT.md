# TankMate Mobile — App Store Deployment Guide

This guide covers everything you need to do manually to get the mobile app into the iOS App Store and Google Play Store.

---

## Prerequisites

Before you start, make sure you have:

- [ ] An [Apple Developer account](https://developer.apple.com/) ($99/year)
- [ ] A [Google Play Developer account](https://play.google.com/console/) ($25 one-time)
- [ ] [EAS CLI](https://docs.expo.dev/eas/) installed: `npm install -g eas-cli`
- [ ] Logged in to EAS: `eas login`
- [ ] An [Expo account](https://expo.dev/) (free)

---

## 1. Initial EAS Setup

Run this once from the `mobile/` directory:

```bash
cd mobile
eas init
```

This creates an EAS project and populates the `extra.eas.projectId` in `app.config.ts`. Copy the project ID and set it as `EAS_PROJECT_ID` in your environment.

```bash
# Verify the config
eas config
```

---

## 2. Environment Variables

Create a `.env` file in `mobile/` (do NOT commit this):

```bash
# Production API URL (your Fly.io deployment)
API_URL=https://your-app.fly.dev

# EAS project ID (from step 1)
EAS_PROJECT_ID=your-eas-project-id

# UploadThing token (server-side only, but needed for builds)
UPLOADTHING_TOKEN=your-uploadthing-token
```

---

## 3. App Icons & Splash Screen

Replace these placeholder files with your actual assets:

| File | Size | Purpose |
|---|---|---|
| `assets/icon.png` | 1024x1024 | App icon (no transparency) |
| `assets/adaptive-icon.png` | 1024x1024 | Android adaptive icon foreground |
| `assets/splash-icon.png` | 200x200 | Splash screen logo |
| `assets/notification-icon.png` | 96x96 | Push notification icon (Android) |

Use a tool like [Figma](https://figma.com) or [Icon Kitchen](https://icon.kitchen) to generate the icons from your TankMate logo.

---

## 4. Prisma Migration

The `DevicePushToken` model was added to the schema. Run the migration on your production database before deploying:

```bash
# In the project root (not mobile/)
npx prisma migrate dev --name add-device-push-tokens

# For production (Fly.io)
fly ssh console -C "npx prisma migrate deploy"
```

---

## 5. Build for iOS

### First-time setup

```bash
# Generate iOS credentials (signing certificates + provisioning profiles)
# EAS will guide you through this interactively
eas credentials -p ios
```

You'll need to:
- Create an App Store Connect app (Bundle ID: `com.tankmate.app`)
- Generate a distribution certificate
- Create a provisioning profile

### Build

```bash
# Production build
eas build -p ios --profile production

# Or a preview build for TestFlight
eas build -p ios --profile preview
```

### Submit to App Store

```bash
eas submit -p ios
```

This uploads the build to App Store Connect. Then in [App Store Connect](https://appstoreconnect.apple.com/):

1. Go to **My Apps** → **TankMate**
2. Click **+ Version** to create a new version
3. Fill in:
   - **Screenshots**: Upload screenshots for iPhone 6.7" and 6.1" (required)
   - **Description**: Describe the app (see [suggested copy](#app-store-copy) below)
   - **Keywords**: aquarium, reef, tank, coral, water parameters, maintenance
   - **Support URL**: Your website or GitHub repo
   - **Privacy Policy URL**: Required — host a privacy policy page
4. Select the build from EAS
5. **Submit for Review**

Apple review typically takes 1-2 days.

---

## 6. Build for Android

### First-time setup

```bash
# Generate Android credentials (keystore)
eas credentials -p android
```

### Build

```bash
# Production AAB (Android App Bundle)
eas build -p android --profile production
```

### Submit to Google Play

```bash
eas submit -p android
```

Then in [Google Play Console](https://play.google.com/console/):

1. **Create app** → Fill in app details
2. **Store listing**:
   - **Short description**: (80 chars max)
   - **Full description**: (see [suggested copy](#app-store-copy) below)
   - **Screenshots**: Phone (min 2), 7-inch tablet, 10-inch tablet
   - **Feature graphic**: 1024x500 banner
   - **App icon**: 512x512
3. **Content rating**: Fill the IARC questionnaire
4. **Privacy policy**: Add URL (required)
5. **App access**: If the app requires login, provide test credentials to Google
6. **Release** → **Production** → Upload the AAB → **Review and release**

Google review typically takes a few hours to a few days.

---

## 7. Push Notifications Setup

### iOS (APNs)

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)
2. Create an **APNs Key** (Apple Push Notification service)
3. Download the `.p8` key file
4. In your Expo dashboard, go to **Credentials** → **iOS** → Upload the APNs key

### Android (FCM)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (or use existing)
3. Go to **Project Settings** → **Cloud Messaging**
4. Get the **Server Key** (or use FCM v1 credentials)
5. Download `google-services.json` and place it in `mobile/`
6. In your Expo dashboard, go to **Credentials** → **Android** → Upload FCM credentials

### Server-side sending

To actually send push notifications, you'll need to add Expo's push API to your server. Install `expo-server-sdk`:

```bash
# In the project root
npm install expo-server-sdk
```

Then create a push notification sender in `server/services/push.service.ts`:

```typescript
import { Expo } from 'expo-server-sdk'
const expo = new Expo()

export async function sendPushNotification(tokens: string[], title: string, body: string) {
  const messages = tokens
    .filter(token => Expo.isExpoPushToken(token))
    .map(token => ({ to: token, title, body, sound: 'default' as const }))

  const chunks = expo.chunkPushNotifications(messages)
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk)
  }
}
```

---

## 8. EAS Build Profiles

Add this to `mobile/eas.json`:

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "API_URL": "http://localhost:8081"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "API_URL": "https://your-staging.fly.dev"
      }
    },
    "production": {
      "env": {
        "API_URL": "https://your-app.fly.dev"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@apple.id",
        "ascAppId": "your-app-store-connect-app-id"
      },
      "android": {
        "serviceAccountKeyPath": "./play-store-key.json"
      }
    }
  }
}
```

---

## 9. OTA Updates

Expo supports over-the-air updates for JS bundle changes (no native code changes):

```bash
# Push an update to all production users
eas update --branch production --message "Fix parameter logging bug"
```

This doesn't require a new app store review. Use it for bug fixes, UI tweaks, and content changes.

---

## App Store Copy

### Short Description (80 chars)
> AI-powered aquarium management. Track water, analyze coral, log maintenance.

### Full Description
> TankMate is the all-in-one aquarium management app for reef keepers and freshwater enthusiasts.
>
> **Track Water Parameters** — Log temperature, alkalinity, calcium, magnesium, pH, nitrate, phosphate, and salinity. View trends with beautiful charts and catch problems early.
>
> **AI Coral Analysis** — Take a photo of your coral and get instant species identification, health scoring, and care recommendations powered by AI.
>
> **Maintenance Logging** — Record water changes, filter cleanings, and custom maintenance. Never forget when you last serviced your tank.
>
> **Tank Gallery** — Document your tank's journey with photos. Upload multiple images and build a visual history.
>
> **Secure & Private** — Your data is encrypted and stored securely. Face ID and fingerprint unlock keep your information safe.
>
> TankMate syncs with the TankMate web app — manage your tanks from any device.

---

## Checklist

### Before First Release
- [ ] Replace placeholder app icons and splash screen
- [ ] Run Prisma migration for DevicePushToken
- [ ] Set up EAS project (`eas init`)
- [ ] Configure environment variables (API_URL, EAS_PROJECT_ID)
- [ ] Create `eas.json` build profiles
- [ ] Set up APNs key (iOS push notifications)
- [ ] Set up FCM credentials (Android push notifications)
- [ ] Write privacy policy and host it
- [ ] Take app screenshots for store listings
- [ ] Build and test on physical devices
- [ ] Submit to TestFlight / internal testing track
- [ ] Submit for App Store / Google Play review

### For Each Update
- [ ] Bump version in `app.config.ts`
- [ ] Run `eas build` for both platforms
- [ ] Run `eas submit` to upload to stores
- [ ] Create release notes
- [ ] (Optional) Use `eas update` for JS-only changes
