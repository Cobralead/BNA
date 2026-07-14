$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$indexPath = Join-Path $root 'index.html'
$cssPath = Join-Path $root 'assets/css/styles.css'
$jsPath = Join-Path $root 'assets/js/app.js'
$imagesDir = Join-Path $root 'assets/images'
New-Item -ItemType Directory -Force -Path $imagesDir | Out-Null

Get-ChildItem $root -File | Where-Object { $_.Name -match '^(bna|logo)' } | ForEach-Object {
    Copy-Item $_.FullName -Destination (Join-Path $imagesDir $_.Name) -Force
}

$content = Get-Content $indexPath -Raw -Encoding utf8

$styleMatches = [regex]::Matches($content, '<style[^>]*>(.*?)</style>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$styles = @()
foreach ($m in $styleMatches) {
    $styles += $m.Groups[1].Value
}
if ($styles.Count -gt 0) {
    Set-Content -Path $cssPath -Value ($styles -join "`n`n") -Encoding utf8
    $content = [regex]::Replace($content, '<style[^>]*>.*?</style>', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
}

$scriptMatches = [regex]::Matches($content, '<script\b[^>]*>(.*?)</script>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$scriptParts = @()
$scriptBlocks = @()
foreach ($m in $scriptMatches) {
    $scriptText = $m.Groups[1].Value
    if ($scriptText -match 'tailwind\.config') {
        continue
    }
    $scriptBlocks += $scriptText
}

$combinedJs = @('// Extracted from index.html') + $scriptBlocks | Where-Object { $_ -and $_.Trim() }
Set-Content -Path $jsPath -Value ($combinedJs -join "`n`n") -Encoding utf8

foreach ($m in $scriptMatches) {
    $scriptText = $m.Groups[1].Value
    if ($scriptText -match 'tailwind\.config') {
        continue
    }
    $content = $content.Replace($m.Value, '')
}

if ($content -notmatch 'assets/css/styles.css') {
    $content = $content -replace '</head>', '    <link rel="stylesheet" href="assets/css/styles.css">`n</head>'
}

if ($content -notmatch 'assets/js/app.js') {
    $content = $content -replace '</body>', '    <script src="assets/js/app.js"></script>`n</body>'
}

$content = $content -replace 'href="bna logo.jpg"', 'href="assets/images/bna logo.jpg"'
$content = $content -replace 'src="logo.png"', 'src="assets/images/bna logo3.png"'
$content = $content -replace 'src="bna logo3.png"', 'src="assets/images/bna logo3.png"'
$content = $content -replace 'src="bna logo.jpg"', 'src="assets/images/bna logo.jpg"'

Set-Content -Path $indexPath -Value $content -Encoding utf8
Write-Output 'Asset extraction complete.'
