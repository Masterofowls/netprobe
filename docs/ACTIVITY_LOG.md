# Activity Log

## 2026-07-06

- Prepared NetProbe for Komi Store listing at https://komistore.app/
- Expanded README with Komi Store install instructions, features, and topics
- Updated docs landing page (`docs/index.html`) with install links
- Synced app version to 1.5.3 (`app.json`, `package.json`, versionCode 7)
- Updated CI workflow to publish descriptively named release assets (`NetProbe-v{version}.apk`)
- Published GitHub Release v1.5.3 with `NetProbe-v1.5.3.apk` and `.aab` (CI build succeeded)
- Verified Komi Store API indexes `Masterofowls/netprobe` with `hasInstallersAndroid: true`
- Added Expo web build (`build:web`), Vercel config (`vercel.json`), and `/api/check` CORS proxy for browser uptime checks
- Guarded native-only features on web (notifications, background tasks, haptics, widget bridge)
- Deployed web app to Vercel: https://netprobe-1.vercel.app
- Fixed `/api/check` Vercel handler (Node `req/res` format) and added web notification stubs to stop proxy 500s and expo-notifications warnings
- Shipped deep checks (DNS/TLS/keyword), export/import/share, PWA manifest+SW, desktop grid layout, SEO meta (`+html.tsx`), README/docs updates; deployed to Vercel
- Linked EAS project `@froggytalents/netprobe`; fixed EAS Hosting API (`app/api/check+api.ts`, `web.output: server`); production at https://netprobe.expo.app
- Fixed React #130 crash on EAS web: removed invalid `Head` import from expo-router; restored backgroundTask imports
- Fixed web runtime errors: TLS probe skips on crt.sh failure (no false `error` on HTTP 200), geo lookup disabled on web (ip-api 403), service worker v2 (same-origin only), redeployed EAS + Vercel
- Fixed Vercel 404: `web.output: server` splits assets into `dist/client` + HTML into `dist/server`; added `scripts/prepare-vercel-dist.mjs` and `dist-vercel` output for Vercel
- Added Tauri desktop app (`apps/desktop`) for Windows & Linux — React UI, Rust probes, export/import, notifications
- Built Windows desktop (`NetProbe-v1.5.3-setup.exe`, `NetProbe-v1.5.3.exe`); uploaded to GitHub Release v1.5.3; CI job `release-desktop-windows` for future tags
- Local Android release build: Gradle `bundleRelease` + signing via `android/keystore.properties`; outputs `NetProbe-v1.5.3.aab` (Play) + `.apk`; versionCode 10
