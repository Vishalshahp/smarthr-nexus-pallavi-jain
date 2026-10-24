# Starts SmartHR Nexus on this PC: checks the database, installs packages and demo data (first time only),
# starts the backend + website, opens it in the browser and opens the project in VS Code. Log: start-log.txt
$ErrorActionPreference = 'Continue'
$Proj = $PSScriptRoot
$Log = Join-Path $Proj 'start-log.txt'
function Log([string]$m) { $line = '[{0}] {1}' -f (Get-Date -Format 'HH:mm:ss'), $m; Write-Host $line; Add-Content -Path $Log -Value $line -Encoding UTF8 }
function Test-Port([int]$port) { try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1', $port); $ok = $c.Connected; $c.Close(); return $ok } catch { return $false } }
function Run-Quiet([string]$dir, [string]$exe, [string[]]$a) {
  Push-Location $dir
  $o = & $exe @a 2>&1 | ForEach-Object { $_.ToString() }
  $ec = $LASTEXITCODE
  Pop-Location
  $o | Select-Object -Last 15 | ForEach-Object { Add-Content -Path $Log -Value ('      ' + $_) -Encoding UTF8 }
  return $ec
}

Remove-Item $Log -ErrorAction SilentlyContinue
Log '=== Starting SmartHR Nexus ==='
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
$node = (Get-Command node.exe -ErrorAction SilentlyContinue | Select-Object -First 1).Source
$npm = (Get-Command npm.cmd -ErrorAction SilentlyContinue | Select-Object -First 1).Source
if (-not $node -or -not $npm) { Log 'ERROR: Node.js was not found. Run "Setup MERN tools" first.'; Read-Host 'Press Enter to close'; exit 1 }
Log ('Node.js ' + (& $node -v))

# 1. Database (MongoDB)
if (-not (Test-Port 27017)) {
  $fix = Join-Path $env:USERPROFILE 'Documents\MERN Projects\setup\fix-mongodb.ps1'
  if (Test-Path $fix) {
    Write-Host ''
    Write-Host 'The MongoDB database is not running yet. A Windows permission box will appear - click YES.' -ForegroundColor Yellow
    Log 'Database not running - starting the MongoDB fix (needs admin)'
    $argList = '-NoProfile -ExecutionPolicy Bypass -File "{0}" -Root "{1}" -NoPause' -f $fix, (Split-Path -Parent (Split-Path -Parent $fix))
    try { $p = Start-Process powershell.exe -Verb RunAs -PassThru -ArgumentList $argList -ErrorAction Stop; $p.WaitForExit() } catch { Log 'Admin permission was not given.' }
    for ($i = 0; $i -lt 20 -and -not (Test-Port 27017); $i++) { Start-Sleep -Seconds 1 }
  } else { Log "MongoDB fix script not found at $fix" }
}
if (Test-Port 27017) { Log 'Database: running' }
else { Log 'ERROR: the MongoDB database is not running, so SmartHR cannot start.'; Read-Host 'Press Enter to close'; exit 1 }

# 2. Packages (first time only)
if (-not (Test-Path (Join-Path $Proj 'node_modules\concurrently'))) {
  Write-Host 'Installing packages - first time only, this takes a few minutes...' -ForegroundColor Cyan
  $ec = Run-Quiet $Proj $npm @('install', '--no-fund', '--no-audit')
  Log "Packages installed (exit $ec)"
  if ($ec -ne 0) { Log 'ERROR: package install failed'; Read-Host 'Press Enter to close'; exit 1 }
}

# 3. Demo data (first time only)
$marker = Join-Path $Proj 'backend\.demo-data-added'
$dataVersion = 'india-v1'   # change this to reload the demo data on next start
$current = if (Test-Path $marker) { Get-Content $marker -Raw } else { '' }
if ($current -notmatch [regex]::Escape($dataVersion)) {
  Write-Host 'Adding demo data (employees, attendance, payroll, jobs)...' -ForegroundColor Cyan
  $ec = Run-Quiet (Join-Path $Proj 'backend') $node @('src/utils/seeder.js', '--reset')
  if ($ec -eq 0) { Set-Content -Path $marker -Value "Demo data added ($dataVersion). Delete this file to reset the demo data on next start."; Log "Demo data added ($dataVersion)" }
  else { Log "ERROR: demo data failed (exit $ec)" }
}

# 4. Start backend + website
$alreadyUp = $false
if ((Test-Port 5000) -and (Test-Port 3000)) {
  try {
    $a = Invoke-WebRequest 'http://localhost:5000/health' -UseBasicParsing -TimeoutSec 2
    $b = Invoke-WebRequest 'http://localhost:3000/' -UseBasicParsing -TimeoutSec 2
    if ($a.StatusCode -eq 200 -and $b.StatusCode -eq 200) {
      $alreadyUp = $true
      Log 'SmartHR is already up and running'
    }
  } catch {}
}

if (-not $alreadyUp) {
  # Clean up any stale processes that might be holding 5000 or 3000
  $connections = Get-NetTCPConnection -LocalPort 5000, 3000 -ErrorAction SilentlyContinue
  if ($connections) {
    Log 'Cleaning up stale processes on ports 5000 / 3000...'
    $connections | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
      if ($_ -gt 0) { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    }
    Start-Sleep -Seconds 1
  }
  Start-Process cmd.exe -WorkingDirectory $Proj -ArgumentList '/k title SmartHR servers - keep this window open && npm run dev'
  Log 'Servers starting in the "SmartHR servers" window'
}
$up = $false
for ($i = 0; $i -lt 90; $i++) {
  Start-Sleep -Seconds 2
  try {
    $a = Invoke-WebRequest 'http://localhost:5000/health' -UseBasicParsing -TimeoutSec 3
    $b = Invoke-WebRequest 'http://localhost:3000/' -UseBasicParsing -TimeoutSec 3
    if ($a.StatusCode -eq 200 -and $b.StatusCode -eq 200) { $up = $true; break }
  } catch {}
}
if ($up) {
  try {
    $body = @{ email = 'admin@demo.com'; password = 'Admin@1234' } | ConvertTo-Json
    $res = Invoke-RestMethod 'http://localhost:3000/api/v1/auth/login' -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 15
    Log ('Login test (admin@demo.com): ' + $(if ($res.success) { 'OK' } else { 'FAILED' }))
  } catch { Log ('Login test failed: ' + $_.Exception.Message) }
  Log 'SmartHR is running at http://localhost:3000'
  Start-Process 'http://localhost:3000'
} else { Log 'ERROR: SmartHR did not start within 3 minutes - look at the "SmartHR servers" window' }

# 5. Open the project in VS Code
$code = (Get-Command code.cmd -ErrorAction SilentlyContinue | Select-Object -First 1).Source
if ($code) {
  $codeExe = Join-Path (Split-Path (Split-Path $code)) 'Code.exe'
  if (Test-Path $codeExe) { Start-Process -FilePath $codeExe -ArgumentList ('"' + $Proj + '"') } else { Start-Process -FilePath $code -ArgumentList ('"' + $Proj + '"') }
}
Log '=== Done ==='
Write-Host ''
Write-Host 'Demo logins (pick the matching role on the login page):' -ForegroundColor Green
Write-Host '  Admin           admin@demo.com      Admin@1234     (Pallavi Jain)'
Write-Host '  Senior Manager  manager@demo.com    Manager@1234   (Rohan Mehta)'
Write-Host '  HR Recruiter    hr@demo.com         HR@12345       (Priya Sharma)'
Write-Host '  Employee        employee@demo.com   Employee@1234  (Aarav Shah)'
Write-Host ''
Read-Host 'Press Enter to close this window (SmartHR keeps running in the other window)'
