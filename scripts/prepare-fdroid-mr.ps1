param(
    [string]$MetadataSource = (Join-Path $PSScriptRoot "..\infra\fdroid\metadata\com.netprobe.app.yml"),
    [string]$WorkDir = (Join-Path $env:TEMP "fdroiddata-netprobe")
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $MetadataSource)) {
    throw "Missing metadata: $MetadataSource"
}

Write-Host "F-Droid metadata preparation"
Write-Host "Source: $MetadataSource"
Write-Host ""

if (Test-Path $WorkDir) {
    Remove-Item $WorkDir -Recurse -Force
}

Write-Host "Cloning fdroiddata..."
git clone --depth 1 https://gitlab.com/fdroid/fdroiddata.git $WorkDir

$dest = Join-Path $WorkDir "metadata\com.netprobe.app.yml"
Copy-Item $MetadataSource $dest -Force

Push-Location $WorkDir
try {
    git checkout -b com.netprobe.app
    git add metadata/com.netprobe.app.yml
    git commit -m "New app: NetProbe (com.netprobe.app)"
    Write-Host ""
    Write-Host "Branch 'com.netprobe.app' created at: $WorkDir"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Fork https://gitlab.com/fdroid/fdroiddata on GitLab"
    Write-Host "  2. git remote add fork https://gitlab.com/YOUR_USER/fdroiddata.git"
    Write-Host "  3. git push -u fork com.netprobe.app"
    Write-Host "  4. Open MR: https://gitlab.com/fdroid/fdroiddata/-/merge_requests/new"
    Write-Host ""
    Write-Host "See docs/F-DROID.md for full inclusion guide."
} finally {
    Pop-Location
}
