# CodeNection-2025
Track: Campus Management 
Problem statement: Campus safety app

Figma:
https://www.figma.com/design/mLcpUZ3HdWBvbSxGnIXSOA/Untitled?node-id=0-1&t=fzLYqizRUc6nplVl-1

Presentation slides:
https://docs.google.com/presentation/d/1eDKEIi2O5Syw7v9Hz6t9k_gjS3hCp5SD/edit?usp=sharing&ouid=113214149090892789609&rtpof=true&sd=true

YouTube: 
https://youtu.be/k-touAUszq8?si=WPy-iBYMNaCJjCP_

# Welcome to your GUARDU 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Core features

SOS Button: Instantly alert your emergency contacts with your live location

Hazard Reporting & Map View: Submit and view nearby hazards in real-time.

Walk With Me: Match with a trusted buddy to walk with you

## Tech Stack

Frontend: React Native + Expo
Backend: Firebase

The app follows a modular architecture using Expo Router for navigation and Firebase for backend services. It’s divided into functional tabs:

## File Structure

- **Home Tab**: Buddy matching, hazard reporting
- **Profile Tab**: Emergency contact management, volunteer sign-up
- **Global Screens**: SOS trigger, map view, notifications

##Core features (in details)
### ⚠️ Hazard Reporting

The app includes a full-featured hazard reporting system to help users flag unsafe conditions in real time.

#### Features:
- Interactive map with location selection
- GPS-based autofill or manual tap
- Hazard type selection (e.g. Poor Lighting, Suspicious Activity)
- Severity levels with color-coded urgency
- Description field with validation (10–1000 characters)
- Firebase Firestore integration for secure storage
- Initial upvote from reporter; others can vote via `toggleUpvote()`

#### UX Highlights:
- Responsive design with `KeyboardAvoidingView`
- Real-time feedback via `ActivityIndicator`
- Clear error messages for permission, validation, and submission issues
- Cancel button to safely exit the flow

Hazards are stored in the `hazardReports` collection with metadata including location (`GeoPoint`), severity, timestamp, and reporter ID.

#### 🗺️ Hazard Map

The `map.tsx` screen displays a live map of reported hazards using data from Firestore. It includes:

- **User Location**: Automatically centers on current location or fallback
- **Hazard Markers**: Color-coded pins based on severity
- **Interactive Callouts**: Show hazard details and allow upvoting
- **Report Button**: Opens the hazard report form with location pre-filled

Hazard data is fetched from the `hazardReports` collection and updated in real time. Upvotes are handled via atomic Firestore operations.

### 🚨 SOS Page

Quick access to emergency types:

-Robbery/Theft
-Fire
-Accident
-Medical
-Others

Designed for rapid interaction and future alert integration.

#### Voice Message Screen

🎙️ Emergency Voice Session
The Emergency Voice Session is a real-time support feature designed for high-stress situations. When a user triggers an SOS alert, this screen activates voice recording, location sharing, and security notification — all while providing calming visual feedback and clear instructions.

🔧 Core Capabilities

-Auto-started emergency session with simulated backend connection
-Press-and-hold mic button to record voice messages
-Press-and-hold mic button with animated waveform
-Location sharing confirmation

### 🧍‍♂️ Buddy Up System

The `buddyUp.tsx` screen allows users to plan a safe walk by entering a starting location and destination. It supports:
- Swapping locations
- Using current location
- Triggering a journey with safety features like:
  - Real-time location sharing
  - Buddy tracking
  - Hazard alerts

This screen uses a reusable `LocationInput` component and integrates with future map or tracking logic. It’s designed for clarity, speed, and safety.

#### 📋 Request Detail Screen

This screen presents all relevant information about a buddy walk request and guides volunteers through the decision to accept or decline.

- Requester profile with rating and verification
- Route, time, duration, and notes
- Active safety features (location tracking, SOS, messaging)
- Volunteer guidelines for respectful and safe conduct
- Accept/Decline buttons with confirmation and navigation logic

Accepting a request leads to the `OutfitPromptScreen`, where volunteers provide identification and meeting details.

#### 👕 Outfit Prompt Screen

After accepting a buddy request, volunteers are prompted to provide:
- **Outfit Description**: Helps requesters identify them visually
- **Meeting Point**: Specifies where the volunteer will wait

The screen includes quick suggestions, validation, and safety tips to ensure a smooth and secure meetup. Once submitted, both parties receive each other's contact info and can coordinate further.

This step enhances trust and clarity in the buddy matching process.
