$ErrorActionPreference = 'SilentlyContinue'
$proc = Start-Process -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory "C:\Users\matho\Desktop\Resume SaaS" -PassThru -WindowStyle Hidden
Start-Sleep 12
$response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
Write-Host "STATUS:$($response.StatusCode)"
Write-Host "BODY_PREVIEW:$($response.Content.Substring(0, [Math]::Min(800, $response.Content.Length)))"
$proc | Stop-Process -Force