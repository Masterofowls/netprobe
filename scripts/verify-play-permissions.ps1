# Verify Google Play API + service account can upload for com.netprobe.app
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$key = Join-Path $root "google-service-account.json"
$gcloud = "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
$package = "com.netprobe.app"
$project = "netprobe-501620"
$sa = "froggytallents@netprobe-501620.iam.gserviceaccount.com"

if (-not (Test-Path $key)) {
    Write-Error "Missing google-service-account.json in repo root"
}

Write-Host "Project: $project"
Write-Host "Service account: $sa"
Write-Host "Package: $package"
Write-Host ""

& $gcloud services enable androidpublisher.googleapis.com --project=$project | Out-Null
Write-Host "[OK] androidpublisher.googleapis.com enabled"

& $gcloud auth activate-service-account $sa --key-file=$key --project=$project | Out-Null
$token = & $gcloud auth print-access-token --scopes=https://www.googleapis.com/auth/androidpublisher

$response = curl -s -X POST `
    -H "Authorization: Bearer $token" `
    -H "Content-Length: 0" `
    "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/$package/edits"

if ($response -match '"id"') {
    Write-Host "[OK] Play Console permissions OK — service account can manage $package"
    exit 0
}

Write-Host "[FAIL] Play Console permissions missing"
Write-Host $response
Write-Host @"

Fix in Play Console (gcloud cannot grant this):
1. https://play.google.com/console/developers/API_ACCESS
2. Link Cloud project: $project
3. Service account: $sa -> Manage Play Console permissions
4. Add app $package with:
   - View app information
   - Release to testing tracks (internal/alpha/beta)
5. Save, wait 5-15 minutes, re-run this script

Then: npm run submit:android:play

"@
exit 1
