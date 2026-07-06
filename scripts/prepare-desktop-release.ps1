# Rename Tauri Windows build outputs for GitHub Release naming.
param(
    [Parameter(Mandatory = $true)]
    [string]$Version
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$bundleRoot = Join-Path $root "apps/desktop/src-tauri/target/release"

$setupSrc = Join-Path $bundleRoot "bundle/nsis/NetProbe_${Version}_x64-setup.exe"
$portableSrc = Join-Path $bundleRoot "netprobe-desktop.exe"

if (-not (Test-Path $setupSrc)) {
    throw "NSIS installer not found: $setupSrc (run npm run build:desktop first)"
}
if (-not (Test-Path $portableSrc)) {
    throw "Portable exe not found: $portableSrc"
}

$setupOut = Join-Path $root "NetProbe-v$Version-setup.exe"
$portableOut = Join-Path $root "NetProbe-v$Version.exe"

Copy-Item $setupSrc $setupOut -Force
Copy-Item $portableSrc $portableOut -Force

Write-Host "Prepared:"
Write-Host "  $setupOut"
Write-Host "  $portableOut"
