param(
  [string]$OutputPath = ''
)

$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$distRoot = [System.IO.Path]::GetFullPath((Join-Path $root 'dist'))
$stageRoot = [System.IO.Path]::GetFullPath((Join-Path $distRoot 'review-skill-package'))
$skillName = 'sayelf-qingyubiao'
$skillRoot = Join-Path $stageRoot $skillName
$templateRoot = Join-Path $skillRoot 'templates'
$reviewHtml = Join-Path $distRoot 'sayelf-qingyubiao-review.html'
$sourceSkill = Join-Path $root 'review-skill\SKILL.md'

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = Join-Path $distRoot 'sayelf-qingyubiao-review-package.zip'
}
$outputFull = [System.IO.Path]::GetFullPath($OutputPath)

& node (Join-Path $PSScriptRoot 'build-review-h5.cjs') $reviewHtml
if ($LASTEXITCODE -ne 0) { throw 'Review H5 build failed.' }
& node --test (Join-Path $PSScriptRoot 'build-review-h5.test.cjs')
if ($LASTEXITCODE -ne 0) { throw 'Review H5 checks failed.' }
if (!(Test-Path -LiteralPath $sourceSkill -PathType Leaf)) { throw "Missing skill definition: $sourceSkill" }
if (!(Test-Path -LiteralPath $reviewHtml -PathType Leaf)) { throw "Missing review H5: $reviewHtml" }

$skillText = Get-Content -LiteralPath $sourceSkill -Raw
foreach ($field in @('name', 'description', 'description_zh', 'description_en', 'version', 'author')) {
  if ($skillText -notmatch "(?m)^${field}:\s*\S") { throw "SKILL.md is missing required frontmatter field: $field" }
}
if ($skillText -notmatch "(?m)^name:\s*$([regex]::Escape($skillName))\s*$") {
  throw "SKILL.md name must match the registered skill identifier: $skillName"
}
if ($skillText -match '(?i)chat_tea|二维码|扫码|afdian\.com|https?://|微信号') {
  throw 'SKILL.md contains a disallowed contact, QR, brand or outbound-link marker.'
}

$distPrefix = $distRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
if (!$stageRoot.StartsWith($distPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to recreate staging folder outside dist: $stageRoot"
}
if (Test-Path -LiteralPath $stageRoot) { Remove-Item -LiteralPath $stageRoot -Recurse -Force }
New-Item -ItemType Directory -Path $templateRoot -Force | Out-Null
Copy-Item -LiteralPath $sourceSkill -Destination (Join-Path $skillRoot 'SKILL.md')
Copy-Item -LiteralPath $reviewHtml -Destination (Join-Path $templateRoot '晴雨表.html')

$outputParent = Split-Path -Parent $outputFull
if ($outputParent) { New-Item -ItemType Directory -Path $outputParent -Force | Out-Null }
if (Test-Path -LiteralPath $outputFull) { Remove-Item -LiteralPath $outputFull -Force }
Compress-Archive -Path (Join-Path $stageRoot '*') -DestinationPath $outputFull -CompressionLevel Optimal

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($outputFull)
try {
  $entries = @($archive.Entries | ForEach-Object { $_.FullName.Replace('\', '/') })
  $required = @(
    "$skillName/SKILL.md",
    "$skillName/templates/晴雨表.html"
  )
  foreach ($entry in $required) {
    if ($entries -notcontains $entry) { throw "Package is missing required entry: $entry" }
  }
  if ($entries.Count -ne $required.Count) { throw "Unexpected files in skill package: $($entries -join ', ')" }
} finally {
  $archive.Dispose()
}

Write-Output "Built and verified $outputFull"
