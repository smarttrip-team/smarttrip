# SmartTrip k6 Concurrency Test Runner
$ScriptDir = $PSScriptRoot
if (-not $ScriptDir) {
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}
if (-not $ScriptDir) {
    $ScriptDir = (Get-Location).Path
}

$K6Path = Join-Path $ScriptDir "k6.exe"
if (-not (Test-Path $K6Path)) {
    $K6Path = Join-Path (Get-Location).Path "tests\concurrency\k6.exe"
}

$ServerScript = Join-Path $ScriptDir "mock_concurrency_server.js"
if (-not (Test-Path $ServerScript)) {
    $ServerScript = Join-Path (Get-Location).Path "tests\concurrency\mock_concurrency_server.js"
}

$TestScript = Join-Path $ScriptDir "booking_concurrency_k6.js"
if (-not (Test-Path $TestScript)) {
    $TestScript = Join-Path (Get-Location).Path "tests\concurrency\booking_concurrency_k6.js"
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "    SMARTTRIP - K6 CONCURRENCY TEST (50 VUs tranh 5 cho cuoi)   " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$serverProc = Start-Process -FilePath "node" -ArgumentList "`"$ServerScript`"" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 1

try {
    & "$K6Path" run "$TestScript"
} finally {
    Stop-Process -Id $serverProc.Id -Force -ErrorAction SilentlyContinue
}
