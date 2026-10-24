# Stops SmartHR Nexus backend and frontend servers
$ErrorActionPreference = 'SilentlyContinue'
Write-Host 'Stopping SmartHR Nexus...' -ForegroundColor Yellow

# Kill processes listening on ports 5000 and 3000
$ports = @(5000, 3000)
$connections = Get-NetTCPConnection -LocalPort $ports -ErrorAction SilentlyContinue
$killedCount = 0

if ($connections) {
  $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($pidToKill in $pids) {
    if ($pidToKill -gt 0) {
      Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
      $killedCount++
    }
  }
}

# Close any cmd windows with title containing 'SmartHR'
Get-Process cmd -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like '*SmartHR*' } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "SmartHR Nexus stopped successfully ($killedCount process(es) terminated)." -ForegroundColor Green
Start-Sleep -Seconds 2
