# Intervals Pulse (Intervals.icu Android App)

A modern, high-performance Android mobile application for **[Intervals.icu](https://intervals.icu)**, inspired by the sleek aesthetics and data visualizations of **Garmin Connect**, **Strava**, and **WHOOP**.

---

## ✨ Features

- **🔐 Direct Intervals.icu Authentication**:
  - Securely log in using your personal **Intervals.icu API Key** (and optional Athlete ID).
  - Uses HTTP Basic Authentication (`API_KEY:<your_key>`) with token caching.
  - **Demo Mode**: Built-in simulated pro-athlete dataset to test and explore all charts and screens without entering a key immediately.

- **⚡ Daily Readiness & Recovery Ring (WHOOP Style)**:
  - Circular SVG strain & recovery gauge calculated from HRV (rMSSD), resting heart rate, sleep duration & quality, and Form (TSB).
  - Status badges (*Optimal / Prime*, *Adequate*, *Recovery Needed*).

- **📈 Signature Fitness & Form Modeling (Intervals.icu CTL / ATL / TSB)**:
  - Interactive multi-line SVG chart with touch crosshair scrubber.
  - **Fitness (CTL)**: 42-day rolling chronic load.
  - **Fatigue (ATL)**: 7-day rolling acute load.
  - **Form (TSB)**: Fitness minus Fatigue with zero baseline and optimal training zone highlights (-10 to -30).
  - Time range selector: 14D, 30D, 90D, 180D.

- **🏃‍♂️ Athletic Activities Feed (Strava Style)**:
  - Chronological workout stream with sport icons & vivid colors (Cycling, Running, Swimming, Strength).
  - Key metrics: Distance, Duration, Normalized / Avg Power, Pace, Elevation Gain, Training Load (TSS), and Intensity Factor (IF).
  - Filter by sport category or search by workout name.

- **🔍 In-Depth Activity Detail Breakdown**:
  - Heart Rate zones distribution bar (Z1 Recovery to Z5 VO2 Max).
  - Structured interval stats (power, HR, duration repeats).
  - Exertion score (RPE 1-10) and feeling smileys.

- **📅 Calendar & Training Plan (Garmin Style)**:
  - Upcoming scheduled workouts vs completed workouts.
  - Structured workout targets, target wattage, and planned training load.

- **⚙️ Profile & Customization**:
  - Physiological baselines: FTP, Rest HR, Max HR, Weight.
  - Unit switcher: Metric (km/m/kg) vs Imperial (mi/ft/lbs).
  - Re-sync and secure logout.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or bun

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```

### 3. Run on Android
- **Via Expo Go (Fastest & Easiest)**:
  1. Install **Expo Go** from the Google Play Store on your Android phone.
  2. Scan the QR code displayed in the terminal.
- **Via Android Emulator**:
  Press `a` in the terminal to launch on a connected Android device or emulator.
- **Via Web Browser (Immediate Preview)**:
  Press `w` in the terminal or run:
  ```bash
  npm run web
  ```

### 4. Build a Standalone Android APK (EAS Build)
To generate an installable `.apk` file for your Android phone:
```bash
npx eas-cli build -p android --profile preview
```

---

## 🔑 Where to find your Intervals.icu API Key
1. Log in to [intervals.icu](https://intervals.icu).
2. Go to **Settings** (gear icon).
3. Scroll down to the **Developer Settings** section.
4. Copy your **API Key**.
5. Paste it into the Intervals Pulse login screen!
