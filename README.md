# CodeNection-2025
Track: Campus Management 

Problem statement: 

Current safety infrastructure often lacks comprehensive coverage, real-time responsiveness, and accessibility features that address the diverse needs of the campus community, leaving gaps in protection and support.


# Welcome to your GUARDU 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## 🚀 Setup

To get started with the project:

```bash
npm install
npx expo start
```

## 🧰 Tech Stack
Frontend: React Native + Expo

Backend: Firebase

Navigation: Expo Router

Storage: Firestore + AsyncStorage

## 🧠 Architecture

- **Home Tab**: Buddy matching, hazard reporting
- **Profile Tab**: Emergency contact management, volunteer sign-up
- **Global Screens**: SOS trigger, map view, notifications

## 🔑 Core features

- Hazard Reporting & Map View: Submit and view nearby hazards in real-time.

- Walk With Me: Match with a trusted buddy to walk with you

- SOS Button: Instantly alert your emergency contacts with your live location

### ⚠️ Hazard Reporting

The app includes a full-featured hazard reporting system to help users flag unsafe conditions in real time.

Features:
- Interactive map with location selection
- GPS-based autofill or manual tap
- Hazard type selection (e.g. Poor Lighting, Suspicious Activity)
- Severity levels with color-coded urgency
- Description field with validation (10–1000 characters)
- Firebase Firestore integration for secure storage
- Initial upvote from reporter; others can upvote

UX Highlights:
- Responsive design with `KeyboardAvoidingView`
- Clear error messages for permission, validation, and submission issues
- Cancel button to safely exit the flow

Hazards are stored in the `hazardReports` collection with metadata including location (`GeoPoint`), severity, timestamp, and reporter ID.

### 🗺️ Hazard Map

The `map` page displays a live map of reported hazards using data from Firestore. It includes:

- **User Location**: Automatically centers on current location or fallback
- **Hazard Markers**: Color-coded pins based on severity
- **Interactive Callouts**: Show hazard details and allow upvoting
- **Report Button**: Opens the hazard report form with location pre-filled

Hazard data is fetched from the `hazardReports` collection and updated in real time. Upvotes are handled via atomic Firestore operations.

### 🚨 SOS System

Quick access to emergency types:

-Robbery/Theft
-Fire
-Accident
-Medical
-Others

Designed for rapid interaction and future alert integration.

### 🧍‍♂️ Buddy Up System

The `buddyUp` page allows users to plan a safe walk by entering a starting location and destination. It supports:

-Starting location and destination input
-Safety features like real-time tracking and hazard alerts

### 📋 Request Detail Screen

Displays walk request info and volunteer decision flow.

- Requester profile with rating and verification
- Route, time, duration, and notes
- Active safety features (location tracking, SOS, messaging)
- Volunteer guidelines for respectful and safe conduct
- Accept/Decline buttons with confirmation and navigation logic

Accepting a request leads to the `OutfitPrompt` screen

### 👕 Outfit Prompt Screen

After accepting a buddy request, volunteers are prompted to provide:
- **Outfit Description**: Helps requesters identify them visually
- **Meeting Point**: Specifies where the volunteer will wait

The screen includes quick suggestions, validation, and safety tips to ensure a smooth and secure meetup. Once submitted, both parties receive each other's contact info and can coordinate further.

This step enhances trust and clarity in the buddy matching process.

### 👤 Profile & Volunteer Management
Manage emergency contacts and opt into the volunteer program.
 
### Volunteer Sign-Up
Allows users to become campus safety volunteers.

Features:

-Avatar selection via alert-based picker
-Checkbox confirmation for intent and consent
-Firestore update with volunteer status and timestamp

## Demo and presentation
Figma: [Guardu-figma](https://www.figma.com/design/mLcpUZ3HdWBvbSxGnIXSOA/Untitled?node-id=0-1&t=fzLYqizRUc6nplVl-1)

Presentation slides: [Guardu-slides](https://docs.google.com/presentation/d/1eDKEIi2O5Syw7v9Hz6t9k_gjS3hCp5SD/edit?usp=sharing&ouid=113214149090892789609&rtpof=true&sd=true)

YouTube: [Guardu-presentation](https://youtu.be/k-touAUszq8?si=WPy-iBYMNaCJjCP_)
