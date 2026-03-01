# MyCoop

A mobile application for managing agricultural cooperatives, associations, and unions. Built with React Native and Expo, MyCoop enables field agents to register farmers, manage groups, track commodity transactions, and monitor district-level activity — all with offline-first sync.

## Features

- **Home Dashboard** — Overview of farmers, groups, and aggregated stock by commodity (Cashew, Groundnut, Beans)
- **Actor Management** — Register and manage farmers and group members
- **Monitoring** — View groups (cooperatives, associations, unions) and their transaction summaries by product
- **Transaction Tracking** — Record aggregation, sales, transfers, and losses per group
- **Reporting** — Generate warehouse transaction reports filtered by date and item
- **Offline-First** — Powered by PowerSync for local-first data with background sync
- **Dark Mode** — Full dark theme support

## Tech Stack

- **Framework** — [Expo](https://expo.dev) + [React Native](https://reactnative.dev)
- **Routing** — [Expo Router](https://docs.expo.dev/router/introduction/) (file-based)
- **Database** — [PowerSync](https://www.powersync.com/) (offline-first SQLite sync)
- **State Management** — [Zustand](https://github.com/pmndrs/zustand)
- **Styling** — [NativeWind](https://www.nativewind.dev/) (TailwindCSS for React Native)
- **Animations** — [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **UI Components** — [@expo/vector-icons](https://icons.expo.fyi/), [@gorhom/bottom-sheet](https://gorhom.github.io/react-native-bottom-sheet/)

## Project Structure

```
src/
├── app/                  # Screens (file-based routing)
│   ├── (tabs)/           # Main tab navigation (Home, Actors, Monitoring, User)
│   ├── (monitoring)/     # Monitoring sub-routes (plots, etc.)
│   ├── (profiles)/       # Profile screens
│   ├── (auth)/           # Authentication screens
│   ├── (aux)/            # Auxiliary screens (checkpoints, etc.)
│   └── (native)/         # Native module screens
├── components/           # Reusable UI components
├── constants/            # Colors, image URIs, config
├── features/             # Feature-specific logic and components
├── helpers/              # Utility functions (dates, transactions, reports)
├── hooks/                # Custom React hooks (queries, navigation, etc.)
├── library/              # PowerSync schemas and SQLite queries
├── store/                # Zustand stores
└── types/                # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js (LTS)
- Android Studio (for Android emulator) or a physical device
- Expo CLI

### Installation

```bash
npm install
```

### Running the App

```bash
# Start the development server
npx expo start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Linting

```bash
npm run lint
```
