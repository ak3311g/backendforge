# ==============================================================================
# BackendForge Installer for Windows
# Usage: irm https://raw.githubusercontent.com/ak3311g/backendforge/main/install.ps1 | iex
# ==============================================================================

$ErrorActionPreference = 'Stop'

$Owner = "ak3311g"  
$Repo = "backendforge"  
$ExeName = "backendforge.exe"
$InstallDir = Join-Path $HOME ".backendforge\bin"
$ZipName = "backendforge-windows-x64.zip"

Write-Host "⚡ [BackendForge] Installing BackendForge for Windows (x64)..." -ForegroundColor Cyan

# 1. Resolve Download URL
Write-Host "⚡ [BackendForge] Fetching release metadata..." -ForegroundColor Cyan
$ReleaseUrl = "https://github.com/$Owner/$Repo/releases/latest/download/$ZipName"

# 2. Prepare Temp Directory
$TempDir = Join-Path ([System.IO.Path]::GetTempPath()) "backendforge_install"
if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
New-Item -ItemType Directory -Path $TempDir | Out-Null

$ZipPath = Join-Path $TempDir $ZipName

try {
    Write-Host "⚡ [BackendForge] Downloading binary from GitHub..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $ReleaseUrl -OutFile $ZipPath -UseBasicParsing

    Write-Host "⚡ [BackendForge] Extracting files..." -ForegroundColor Cyan
    Expand-Archive -Path $ZipPath -DestinationPath $TempDir -Force

    # Ensure destination directory exists
    if (-not (Test-Path $InstallDir)) {
        New-Item -ItemType Directory -Path $InstallDir | Out-Null
    }

    $ExtractedExe = Join-Path $TempDir $ExeName
    if (-not (Test-Path $ExtractedExe)) {
        throw "Binary $ExeName was not found in archive."
    }

    Copy-Item -Path $ExtractedExe -Destination (Join-Path $InstallDir $ExeName) -Force
    Write-Host "✓ [Success] Installed BackendForge to $InstallDir\$ExeName" -ForegroundColor Green
}
catch {
    Write-Error "✗ [Error] Installation failed: $_"
    exit 1
}
finally {
    if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
}

# 3. Add to User Environment Path if not already present
$UserPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
if ($UserPath -notlike "*$InstallDir*") {
    $NewPath = "$UserPath;$InstallDir"
    [Environment]::SetEnvironmentVariable("Path", $NewPath, [EnvironmentVariableTarget]::User)
    $env:Path = "$env:Path;$InstallDir"
    Write-Host "✓ [Success] Added $InstallDir to user PATH." -ForegroundColor Green
} else {
    Write-Host "✓ [Notice] $InstallDir is already in user PATH." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 BackendForge successfully installed! Restart your PowerShell or run 'backendforge' to begin." -ForegroundColor Green