## Learned User Preferences

- Prefer fast execution with minimal questions; implement when the request implies changes.
- Create git commits only when explicitly asked.
- Append notable work to `docs/ACTIVITY_LOG.md`.
- Ship features across mobile and web together when feasible (deeper checks, export/backup, PWA, desktop layout, SEO).
- Publish web to both Vercel and EAS Hosting.
- GitHub releases should bundle Android APK/AAB with Windows desktop installers (NSIS setup + portable exe).

## Learned Workspace Facts

- NetProbe is an Expo 54 / React Native app (v1.5.3) with Expo Router; repo: `Masterofowls/netprobe`.
- Web deploys: https://netprobe-1.vercel.app (Vercel) and https://netprobe.expo.app (EAS Hosting with server output for API routes).
- Desktop app lives at `apps/desktop` — Tauri 2 + Vite/React, Rust-backed probes for Windows and Linux.
- Shared types, catalog, i18n, and constants are reused via `@core` alias pointing to repo-root `src/`.
- Browser probes use `/api/check` (Vercel: `api/check.js`; EAS: `app/api/check+api.ts` + `src/server/probe.ts`).
- Root scripts: `npm run dev:desktop`, `npm run build:desktop`; release rename via `scripts/prepare-desktop-release.ps1`.
- CI (`.github/workflows/build.yml`) publishes Android and Windows desktop artifacts on `v*` tags.
