param(
    [string]$Version = "1.5.3",
    [string]$Track = "internal"
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$aab = Join-Path $root "NetProbe-v$Version.aab"
$key = Join-Path $root "google-service-account.json"

if (-not (Test-Path $aab)) {
    Write-Host "AAB missing. Building locally..."
    & (Join-Path $PSScriptRoot "build-android-local.ps1") -Version $Version
}

if (-not (Test-Path $key)) {
    Write-Host @"

Google Play service account key required.

1. Play Console -> Setup -> API access -> Link Cloud project
2. Create a service account JSON key with Release permissions
3. Save it as: $key

Then re-run:
  npm run submit:android:play

"@
    exit 1
}

Push-Location $root
try {
    npx eas-cli@latest submit `
        --platform android `
        --profile production `
        --path $aab `
        --non-interactive
} finally {
    Pop-Location
}
