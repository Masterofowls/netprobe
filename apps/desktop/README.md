# NetProbe Desktop (Tauri)

Native desktop build for **Windows** and **Linux** using Tauri 2 + React.

## Features

- Same resource catalog, custom URLs, DNS/TLS/keyword deep checks
- Rust-backed HTTP probes (no CORS proxy)
- Geo lookup via ip-api.com (desktop only)
- Export/import JSON backups and status reports
- Desktop notifications on status changes
- EN/RU translations (shared with mobile/web)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://rustup.rs/)
- **Windows:** WebView2 (pre-installed on Windows 11)
- **Linux:** `webkit2gtk` and related dev packages — see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

## Development

From the repo root:

```bash
npm run dev:desktop
```

Or from this directory:

```bash
cd apps/desktop
npm install
npm run tauri:dev
```

## Production build

```bash
npm run build:desktop
```

Installers are written to `apps/desktop/src-tauri/target/release/bundle/`:

- **Windows:** `.msi` / `.exe` (NSIS)
- **Linux:** `.deb` / `.rpm`

## Architecture

| Layer | Path |
|-------|------|
| React UI | `apps/desktop/src/` |
| Rust probes + storage | `apps/desktop/src-tauri/src/` |
| Shared types, catalog, i18n | `src/` (via `@core` alias) |

Probe commands: `probe_http`, `probe_dns`, `probe_tls`, `probe_keyword`, `probe_geo`.
