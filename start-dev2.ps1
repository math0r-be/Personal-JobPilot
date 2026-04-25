$ErrorActionPreference = 'Continue'
$proc = Start-Process -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory "C:\Users\matho\Desktop\Resume SaaS" -PassThru -NoNewWindow -RedirectStandardOutput "C:\temp\jp-out.log" -RedirectStandardError "C:\temp\jp-err.log"
Start-Sleep 15
$err = Get-Content "C:\temp\jp-err.log" -Raw -ErrorAction SilentlyContinue
$out = Get-Content "C:\temp\jp-out.log" -Raw -ErrorAction SilentlyContinue
Write-Host "OUT:$out"
Write-Host "ERR:$err"
$net = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
Write-Host "PORT_3000:$($net.Count)"