# NetProbe

Real-time network resource connectivity tester for Android. Check whether websites and services are reachable, blocked, or slow from your network — with latency charts, geo IP lookup, and a built-in catalog of 100+ services.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/Masterofowls/netprobe)](https://github.com/Masterofowls/netprobe/releases/latest)
[![Komi Store](https://img.shields.io/badge/Install-Komi%20Store-6C63FF)](https://komistore.app/)

## Install

### Komi Store (recommended)

NetProbe is available on [Komi Store](https://komistore.app/) — the open-source app store for GitHub releases.

1. Install [Komi Store](https://komistore.app/) on your Android device
2. Search for **NetProbe** or open [github.com/Masterofowls/netprobe](https://github.com/Masterofowls/netprobe) in the app
3. Tap **Install latest** to download the APK

Komi Store verifies release assets and can auto-update when new versions are published.

### GitHub Releases

Download the latest APK directly from [GitHub Releases](https://github.com/Masterofowls/netprobe/releases/latest).

## Features

- **Connectivity checks** — HTTP probes with latency, status codes, and error classification (timeout, DNS failure, blocked, offline)
- **Resource catalog** — 100+ built-in services across search engines, social media, streaming, cloud, and developer tools
- **Custom resources** — Add your own URLs to monitor
- **Latency history** — Charts and history per resource
- **Geo IP lookup** — See your approximate location, country flag, and ISP
- **Auto-refresh** — Configurable background checks with local notifications
- **Home screen widget** — At-a-glance status on your launcher
- **Bilingual UI** — English and Russian
- **Privacy-first** — No analytics, no tracking, all data stays on device

## Screenshots

<p align="center">
  <img src="assets/icon.png" alt="NetProbe icon" width="128" />
</p>

## Requirements

- Android 7.0+ (API 24)
- Internet access

## Build from source

```bash
git clone https://github.com/Masterofowls/netprobe.git
cd netprobe
npm ci
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

The release APK is at `android/app/build/outputs/apk/release/app-release.apk`.

## Privacy

See the [Privacy Policy](https://masterofowls.github.io/netprobe/privacy-policy.html).

## License

MIT — see [LICENSE](LICENSE).

## Topics

`android` `mobile` `apk` `network` `connectivity` `ping` `react-native` `expo` `open-source`
