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

### 🌐 Running the Web App (Fastest & Recommended)
Start the modern React + Vite web dashboard directly on your browser:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

### 📱 Running on Android
- **Via Prebuilt APK**:
  The compiled APK is ready at [**`IntervalsPulse.apk`**](file:///home/francesco/Progetti/Interval/IntervalsPulse.apk). Sideload it directly onto your phone!
- **Via Expo Go**:
  ```bash
  npx expo start
  ```
  Scan the terminal QR code using the Expo Go app.

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
