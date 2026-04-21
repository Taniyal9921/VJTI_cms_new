# Quick end-to-end API smoke test (backend must be on http://127.0.0.1:8000, DB seeded).
$ErrorActionPreference = "Stop"
$base = "http://127.0.0.1:8000/api"

Write-Host "GET $base/departments"
$d = Invoke-RestMethod -Uri "$base/departments" -Method Get
if (-not $d) { throw "departments empty or failed" }
Write-Host "  OK ($($d.Count) departments)"

$loginBody = @{ email = "student@college.edu"; password = "Demo@12345" } | ConvertTo-Json
Write-Host "POST $base/auth/login"
$tok = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
if (-not $tok.access_token) { throw "no access_token" }
Write-Host "  OK (token received)"

$headers = @{ Authorization = "Bearer $($tok.access_token)" }
Write-Host "GET $base/users/me"
$me = Invoke-RestMethod -Uri "$base/users/me" -Method Get -Headers $headers
Write-Host "  OK ($($me.email) / $($me.role))"

Write-Host "GET $base/complaints"
$res = Invoke-WebRequest -Uri "$base/complaints?limit=5" -Method Get -Headers $headers -UseBasicParsing
$total = $res.Headers["X-Total-Count"]
if (-not $total) { $total = $res.Headers["x-total-count"] }
Write-Host "  OK (X-Total-Count=$total)"

Write-Host "GET $base/dashboard/stats"
$st = Invoke-RestMethod -Uri "$base/dashboard/stats" -Method Get -Headers $headers
Write-Host "  OK (total_complaints=$($st.total_complaints))"

Write-Host "All smoke checks passed."
