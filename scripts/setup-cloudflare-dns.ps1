# Add Netlify DNS records to Cloudflare for chefchirag.com
# Usage (PowerShell):
#   $env:CLOUDFLARE_API_TOKEN = "your-token-here"
#   .\scripts\setup-cloudflare-dns.ps1
#
# Create token at: https://dash.cloudflare.com/profile/api-tokens
# Permission: Zone > DNS > Edit, Zone: chefchirag.com

$ZoneName = "chefchirag.com"
$NetlifySubdomain = "rad-medovik-27c29d.netlify.app"
$NetlifyApexIP = "75.2.60.5"
$Token = $env:CLOUDFLARE_API_TOKEN

if (-not $Token) {
    Write-Host "Missing CLOUDFLARE_API_TOKEN environment variable." -ForegroundColor Red
    Write-Host ""
    Write-Host "1. Open https://dash.cloudflare.com/profile/api-tokens"
    Write-Host "2. Create Token -> Edit zone DNS (zone: chefchirag.com)"
    Write-Host "3. Run:"
    Write-Host '   $env:CLOUDFLARE_API_TOKEN = "paste-token-here"'
    Write-Host "   .\scripts\setup-cloudflare-dns.ps1"
    exit 1
}

$headers = @{
    Authorization = "Bearer $Token"
    "Content-Type" = "application/json"
}

# Get zone ID
$zoneResp = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones?name=$ZoneName" -Headers $headers
if (-not $zoneResp.success -or $zoneResp.result.Count -eq 0) {
    Write-Host "Could not find zone $ZoneName. Check token permissions." -ForegroundColor Red
    exit 1
}
$zoneId = $zoneResp.result[0].id
Write-Host "Zone ID: $zoneId" -ForegroundColor Cyan

function Set-DnsRecord {
    param([string]$Type, [string]$Name, [string]$Content)

    $existing = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records?type=$Type&name=$Name" -Headers $headers
    $body = @{
        type    = $Type
        name    = $Name
        content = $Content
        proxied = $false
        ttl     = 1
    } | ConvertTo-Json

    if ($existing.result.Count -gt 0) {
        $recordId = $existing.result[0].id
        $resp = Invoke-RestMethod -Method PUT -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records/$recordId" -Headers $headers -Body $body
        Write-Host "[updated] $Type $Name -> $Content" -ForegroundColor Green
    } else {
        $resp = Invoke-RestMethod -Method POST -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" -Headers $headers -Body $body
        Write-Host "[created] $Type $Name -> $Content" -ForegroundColor Green
    }
    if (-not $resp.success) {
        Write-Host "Failed: $($resp.errors | ConvertTo-Json)" -ForegroundColor Red
        exit 1
    }
}

Set-DnsRecord -Type "A" -Name $ZoneName -Content $NetlifyApexIP
Set-DnsRecord -Type "CNAME" -Name "www.$ZoneName" -Content $NetlifySubdomain

Write-Host ""
Write-Host "Done. DNS records set (proxy OFF)." -ForegroundColor Green
Write-Host "Wait 5-30 min, then run: .\scripts\verify-domain.ps1"
