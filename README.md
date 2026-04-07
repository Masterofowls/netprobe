# NetProbe

Real-time Network Resource Connectivity Tester for Android.

Test if web services are blocked, regionally unavailable, or experiencing issues from your current network.

## Features

- **11 Built-in Resources**: Cloudflare, Google, Meta, AWS, Vercel, Microsoft, Apple, Alibaba Cloud, IBM Cloud, GitHub, GitLab
- **Custom Resources**: Add your own URLs to monitor
- **Real-time Connectivity Checks**: HEAD requests with timeout detection and status derivation
- **8 Status States**: Online, Offline, Timeout, DNS Error, SSL Error, Blocked, Degraded, Unknown
- **Material Design 3**: Light and dark theme support
- **Latency Tracking**: Visual bar chart with min/avg/max statistics
- **History Log**: Timestamped check results per resource
- **Auto-refresh**: Configurable intervals (15s to 5min)
- **Persistent Storage**: Settings and custom resources saved locally

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Expo SDK 54 |
| Runtime | React Native 0.81.5 + Hermes |
| Language | TypeScript (strict mode) |
| UI | React Native Paper (MD3) |
| State | Zustand + AsyncStorage |
| Routing | Expo Router (file-based) |
| Formatter | Biome.js |

## Getting Started

```powershell
# Install dependencies
npm install

# Run on web
npx expo start --web

# Run on Android (requires Android SDK)
npx expo run:android
```

## Building Release APK

```powershell
$env:JAVA_HOME = "$env:ProgramFiles\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
cd android
.\gradlew.bat assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

## Project Structure

```
src/
  types/          # TypeScript type definitions
  constants/      # Default resources, theme config
  services/       # Network checking logic
  store/          # Zustand state management
  hooks/          # Auto-refresh hook
  components/     # ResourceCard, StatusBadge, StatusSummary, LatencyChart
app/
  _layout.tsx     # Root layout with theme provider
  index.tsx       # Dashboard screen
  add-resource.tsx # Add custom resource form
  settings.tsx    # App settings
  resource/[id].tsx # Resource detail view
```

## License

MIT
