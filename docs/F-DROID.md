# F-Droid inclusion for NetProbe

NetProbe is MIT-licensed and privacy-focused. F-Droid builds from source on their infrastructure — you submit a **merge request** to [fdroiddata](https://gitlab.com/fdroid/fdroiddata), not an APK upload.

## Prerequisites

- App is [FOSS](https://f-droid.org/docs/Inclusion_Policy/) (MIT license — OK)
- Source on GitHub with tagged releases (`v1.5.3`, etc.)
- No proprietary blobs in the release APK (F-Droid strips Firebase / Komi ADI registration via build patches)

## Files in this repo

| Path | Purpose |
|------|---------|
| `infra/fdroid/metadata/com.netprobe.app.yml` | Build recipe for fdroiddata MR |
| `fastlane/metadata/android/en-US/` | Store listing text (F-Droid reads upstream) |

## Submit (recommended)

### 1. Push source + retag release on GitHub

F-Droid builds a fixed git commit. The `v1.5.3` tag currently points at an older commit (`versionCode` 7). Before the MR merges, either:

```bash
git push origin master
git tag -f v1.5.3
git push -f origin v1.5.3
```

Or bump to `v1.5.4` and update `commit:` in `infra/fdroid/metadata/com.netprobe.app.yml`.

Commit `df40d0ab` on `master` has `versionCode` 10 and is the initial F-Droid build target.

### 2. Open merge request on fdroiddata

```bash
npm run prepare:fdroid-mr
```

Then follow the printed GitLab steps, or manually:

1. Fork https://gitlab.com/fdroid/fdroiddata
2. Copy `infra/fdroid/metadata/com.netprobe.app.yml` → `metadata/com.netprobe.app.yml`
3. Open MR: **New app: NetProbe (com.netprobe.app)**
4. Link to https://github.com/Masterofowls/netprobe

### 3. Wait for F-Droid build + review

- First build often needs metadata tweaks (Expo/React Native apps are complex)
- Track MR at https://gitlab.com/fdroid/fdroiddata/-/merge_requests

## Alternative: inclusion request

If you prefer not to write metadata yourself:

https://gitlab.com/fdroid/fdroiddata/-/issues/new?issuable_template=App%20Submission

Include:

- **App name:** NetProbe
- **Package:** com.netprobe.app
- **Source:** https://github.com/Masterofowls/netprobe
- **License:** MIT

## Local F-Droid build (optional)

Install [fdroidserver](https://f-droid.org/docs/Build_Server_Setup/) and test:

```bash
fdroid lint metadata/com.netprobe.app.yml
fdroid build com.netprobe.app:10
```

## Notes

- F-Droid signs APKs with their own key (not your Play upload key)
- `adi-registration.properties` (Komi Store) is removed in the F-Droid build
- Firebase notification stubs use fdroiddata `firebase-stub` srclib
- Play Store and F-Droid can coexist; use separate signing keys
