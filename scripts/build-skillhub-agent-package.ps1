param(
  [string]$OutputPath = ''
)

$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$sourceRoot = Join-Path $root 'skillhub-agent'
$distRoot = Join-Path $root 'dist'
$stageRoot = Join-Path $distRoot 'skillhub-agent-package'
$templateSource = Join-Path $distRoot 'sayelf-qingyubiao-review.html'

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = Join-Path $distRoot 'sayelf-qingyubiao-skillhub-agent-v1.2.9.zip'
}
$outputFull = [System.IO.Path]::GetFullPath($OutputPath)

if (!(Test-Path -LiteralPath (Join-Path $sourceRoot 'SKILL.md') -PathType Leaf)) { throw 'Missing skillhub-agent/SKILL.md' }
if (!(Test-Path -LiteralPath $templateSource -PathType Leaf)) { throw 'Missing sanitized review H5; build it first.' }

$distPrefix = $distRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
if (!$stageRoot.StartsWith($distPrefix, [System.StringComparison]::OrdinalIgnoreCase)) { throw "Refusing to recreate staging folder outside dist: $stageRoot" }
if (Test-Path -LiteralPath $stageRoot) { Remove-Item -LiteralPath $stageRoot -Recurse -Force }
New-Item -ItemType Directory -Path (Join-Path $stageRoot 'references') -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stageRoot 'templates') -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $sourceRoot 'SKILL.md') -Destination (Join-Path $stageRoot 'SKILL.md')
Copy-Item -LiteralPath (Join-Path $sourceRoot 'references\self-hosted-node.md') -Destination (Join-Path $stageRoot 'references\self-hosted-node.md')
Copy-Item -LiteralPath (Join-Path $sourceRoot 'references\runtime-contract.md') -Destination (Join-Path $stageRoot 'references\runtime-contract.md')
Copy-Item -LiteralPath $templateSource -Destination (Join-Path $stageRoot 'templates\weather-calendar.html')

$forbidden = Get-ChildItem -LiteralPath $stageRoot -Recurse -File | Where-Object { $_.Extension.ToLowerInvariant() -in @('.exe','.dll','.so','.dylib','.png','.jpg','.jpeg','.gif','.webp','.mp4','.zip','.tar','.gz') }
if ($forbidden) { throw "Binary or archive files are not allowed: $($forbidden.FullName -join ', ')" }

$outputParent = Split-Path -Parent $outputFull
if ($outputParent) { New-Item -ItemType Directory -Path $outputParent -Force | Out-Null }
if (Test-Path -LiteralPath $outputFull) { Remove-Item -LiteralPath $outputFull -Force }
Compress-Archive -Path (Join-Path $stageRoot '*') -DestinationPath $outputFull -CompressionLevel Optimal

$size = (Get-Item -LiteralPath $outputFull).Length
if ($size -gt 10MB) { throw "SkillHub package exceeds 10 MB: $size bytes" }

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($outputFull)
try {
  $entries = @($archive.Entries | ForEach-Object { $_.FullName.Replace('\','/') })
  $required = @('SKILL.md','references/self-hosted-node.md','references/runtime-contract.md','templates/weather-calendar.html')
  foreach ($entry in $required) { if ($entries -notcontains $entry) { throw "Missing package entry: $entry" } }
  if ($entries.Count -ne $required.Count) { throw "Unexpected package entries: $($entries -join ', ')" }
} finally { $archive.Dispose() }

Write-Output "Built and verified $outputFull ($size bytes, $($entries.Count) files)"

