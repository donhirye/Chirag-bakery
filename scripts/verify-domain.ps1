# Verify chefchirag.com DNS and HTTPS for Netlify custom domain setup.
# Run from project root: .\scripts\verify-domain.ps1

$Domain = "chefchirag.com"
$WwwDomain = "www.chefchirag.com"
$NetlifyApexIP = "75.2.60.5"

function Write-Status {
    param([string]$Label, [bool]$Pass, [string]$Detail)
    $icon = if ($Pass) { "[OK]" } else { "[--]" }
    Write-Host "$icon $Label" -ForegroundColor $(if ($Pass) { "Green" } else { "Yellow" })
    if ($Detail) { Write-Host "    $Detail" -ForegroundColor DarkGray }
}

Write-Host ""
Write-Host "Custom domain verification: $Domain" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Domain registration (DNS exists at all)
$registered = $false
try {
    $null = Resolve-DnsName -Name $Domain -Type NS -ErrorAction Stop
    $registered = $true
    Write-Status "Domain registered (NS records found)" $true ""
} catch {
    Write-Status "Domain registered" $false "No NS records - purchase at registrar first (see docs/CUSTOM-DOMAIN.md)"
}

# 2. Apex A record points to Netlify
$apexOk = $false
if ($registered) {
    try {
        $aRecords = @(Resolve-DnsName -Name $Domain -Type A -ErrorAction Stop)
        $matching = @($aRecords | Where-Object { $_.IPAddress -eq $NetlifyApexIP })
        $apexOk = $matching.Count -gt 0
        $apexDetail = ""
        if (-not $apexOk) {
            $found = ($aRecords | ForEach-Object { $_.IPAddress }) -join ", "
            $apexDetail = "Found: $found"
        }
        Write-Status "Apex A record ($NetlifyApexIP)" $apexOk $apexDetail
    } catch {
        Write-Status "Apex A record ($NetlifyApexIP)" $false "No A record - configure DNS in Netlify Domain management"
    }
}

# 3. www CNAME
$wwwOk = $false
if ($registered) {
    try {
        $cname = Resolve-DnsName -Name $WwwDomain -Type CNAME -ErrorAction Stop
        $wwwOk = $cname.NameHost -like "*.netlify.app."
        $wwwDetail = ""
        if (-not $wwwOk) {
            $wwwDetail = "Found: $($cname.NameHost)"
        }
        Write-Status "www CNAME to Netlify" $wwwOk $wwwDetail
    } catch {
        Write-Status "www CNAME to Netlify" $false "No CNAME - add www in Netlify and configure DNS"
    }
}

# 4. HTTPS on apex
$httpsOk = $false
try {
    $request = [System.Net.HttpWebRequest]::Create("https://$Domain")
    $request.Method = "HEAD"
    $request.Timeout = 15000
    $request.AllowAutoRedirect = $true
    $response = $request.GetResponse()
    $httpsOk = $response.StatusCode -eq 200
    $response.Close()
    Write-Status "HTTPS responds (200)" $httpsOk ""
} catch [System.Net.WebException] {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status) {
        Write-Status "HTTPS responds" $false "HTTP status $status"
    } else {
        Write-Status "HTTPS responds" $false "Connection failed - DNS or SSL not ready yet"
    }
} catch {
    Write-Status "HTTPS responds" $false $_.Exception.Message
}

# 5. HTTPS on www
$wwwHttpsOk = $false
try {
    $request = [System.Net.HttpWebRequest]::Create("https://$WwwDomain")
    $request.Method = "HEAD"
    $request.Timeout = 15000
    $request.AllowAutoRedirect = $true
    $response = $request.GetResponse()
    $wwwHttpsOk = $response.StatusCode -eq 200
    $response.Close()
    Write-Status "www HTTPS responds (200)" $wwwHttpsOk ""
} catch {
    Write-Status "www HTTPS responds" $false "Not ready or www not configured"
}

Write-Host ""
$allOk = $registered -and $apexOk -and $httpsOk
if ($allOk) {
    Write-Host "All checks passed. https://$Domain is live." -ForegroundColor Green
    exit 0
} elseif (-not $registered) {
    Write-Host "Next step: purchase chefchirag.com (see docs/CUSTOM-DOMAIN.md Step 1)." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "DNS or HTTPS not fully configured yet. See docs/CUSTOM-DOMAIN.md Steps 2-4." -ForegroundColor Yellow
    exit 1
}
