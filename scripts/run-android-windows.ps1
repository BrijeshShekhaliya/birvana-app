$ErrorActionPreference = 'Stop'

$projectPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$driveLetter = 'X:'

try {
  $existing = Get-PSDrive -Name $driveLetter.TrimEnd(':') -ErrorAction SilentlyContinue
  if ($existing) {
    subst $driveLetter /d | Out-Null
  }

  subst $driveLetter $projectPath | Out-Null
  Push-Location $driveLetter
  npx expo run:android
}
finally {
  Pop-Location -ErrorAction SilentlyContinue
  subst $driveLetter /d | Out-Null
}
