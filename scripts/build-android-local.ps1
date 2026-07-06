param(
    [string]$Version = "1.5.3"
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

Push-Location (Join-Path $root "android")
try {
    if (-not (Test-Path "keystore.properties")) {
        throw "Missing android/keystore.properties. Copy keystore.properties.example and set passwords."
    }
    .\gradlew.bat bundleRelease assembleRelease
} finally {
    Pop-Location
}

$aabSrc = Join-Path $root "android/app/build/outputs/bundle/release/app-release.aab"
$apkSrc = Join-Path $root "android/app/build/outputs/apk/release/app-release.apk"
$aabOut = Join-Path $root "NetProbe-v$Version.aab"
$apkOut = Join-Path $root "NetProbe-v$Version.apk"

if (-not (Test-Path $aabSrc)) { throw "AAB not found: $aabSrc" }
Copy-Item $aabSrc $aabOut -Force
Write-Host "AAB: $aabOut"

if (Test-Path $apkSrc) {
    Copy-Item $apkSrc $apkOut -Force
    Write-Host "APK: $apkOut"
}
