$root = Resolve-Path "."
$indexPath = Join-Path $root "index.html"
$content = Get-Content -Raw $indexPath

$cssDir = Join-Path $root "assets/css"
$jsDir = Join-Path $root "assets/js"
$imageDir = Join-Path $root "assets/images"
New-Item -ItemType Directory -Force -Path $cssDir | Out-Null
New-Item -ItemType Directory -Force -Path $jsDir | Out-Null
New-Item -ItemType Directory -Force -Path $imageDir | Out-Null

$styleMatch = [regex]::Match($content, '(?is)<style[^>]*>(.*?)</style>')
if ($styleMatch.Success) {
    $cssPath = Join-Path $cssDir "styles.css"
    Set-Content -Path $cssPath -Value $styleMatch.Groups[1].Value.Trim() -Encoding utf8
    $content = $content -replace [regex]::Escape($styleMatch.Value), '<link rel="stylesheet" href="assets/css/styles.css">'
}

$scriptMatches = [regex]::Matches($content, '(?is)<script\b[^>]*>(.*?)</script>')
$jsParts = New-Object System.Collections.Generic.List[string]
foreach ($match in $scriptMatches) {
    $attrs = [regex]::Match($match.Value, '(?is)<script\b([^>]*)>')
    if ($attrs.Success -and $attrs.Groups[1].Value -match 'src=') {
        continue
    }
    $jsParts.Add($match.Groups[1].Value.Trim())
}

if ($jsParts.Count -gt 0) {
    $jsPath = Join-Path $jsDir 'app.js'
    Set-Content -Path $jsPath -Value ($jsParts -join "`n`n") -Encoding utf8
}

$content = [regex]::Replace($content, '(?is)<script\b[^>]*>.*?</script>', '')
$content = $content.Replace('</body>', '    <script src="assets/js/app.js"></script>`n</body>')

$replacements = @{
    'href="bna logo.jpg"' = 'href="assets/images/logo.jpg"'
    'src="logo.png"' = 'src="assets/images/logo3.png"'
    'src="bna logo.jpg"' = 'src="assets/images/logo.jpg"'
    'src="bna logo3.png"' = 'src="assets/images/logo3.png"'
    'src="bna weyra.png"' = 'src="assets/images/weyra.png"'
    'src="bna bethel.jpg"' = 'src="assets/images/bethel.jpg"'
}
foreach ($old in $replacements.Keys) {
    $content = $content.Replace($old, $replacements[$old])
}

Set-Content -Path $indexPath -Value $content -Encoding utf8

$images = @(
    @{ Source = Join-Path $root 'bna logo.jpg'; Dest = Join-Path $imageDir 'logo.jpg' },
    @{ Source = Join-Path $root 'bna logo3.png'; Dest = Join-Path $imageDir 'logo3.png' },
    @{ Source = Join-Path $root 'bna weyra.png'; Dest = Join-Path $imageDir 'weyra.png' },
    @{ Source = Join-Path $root 'bna bethel.jpg'; Dest = Join-Path $imageDir 'bethel.jpg' }
)
foreach ($image in $images) {
    if (Test-Path $image.Source) {
        Copy-Item -Path $image.Source -Destination $image.Dest -Force
    }
}

Write-Host 'Structured project created successfully.'
