param(
  [Parameter(Mandatory = $true)]
  [string]$HtmlPath,

  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"

function Get-RgbValue {
  param($Color)
  $red = [Math]::Max(0, [Math]::Min(255, [int]$Color.r))
  $green = [Math]::Max(0, [Math]::Min(255, [int]$Color.g))
  $blue = [Math]::Max(0, [Math]::Min(255, [int]$Color.b))
  return $red + (256 * $green) + (65536 * $blue)
}

function Set-ShapeColor {
  param($Format, $Color)
  $Format.ForeColor.RGB = Get-RgbValue $Color
  if ($null -ne $Color.a) {
    $Format.Transparency = [Math]::Max(0, [Math]::Min(1, 1 - [double]$Color.a))
  }
}

$html = (Resolve-Path $HtmlPath).Path
$output = [System.IO.Path]::GetFullPath($OutputPath)
$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$extractor = Join-Path $scriptDirectory "extract-editable-layout.js"
$snapshotPath = [System.IO.Path]::ChangeExtension($output, ".layout.json")
$edgeCandidates = @(
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
)
$edge = $edgeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) {
  throw "Chrome or Microsoft Edge is required."
}

& node $extractor $html $snapshotPath $edge
if ($LASTEXITCODE -ne 0 -or -not (Test-Path $snapshotPath)) {
  throw "Could not extract the HTML layout."
}

$layout = Get-Content -Raw -Encoding UTF8 $snapshotPath | ConvertFrom-Json
$htmlContent = Get-Content -Raw -Encoding UTF8 $html
$noteMatches = [regex]::Matches(
  $htmlContent,
  '<aside class="notes">([\s\S]*?)</aside>',
  [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)
$notes = foreach ($match in $noteMatches) {
  $text = $match.Groups[1].Value
  $text = [regex]::Replace($text, '<br\s*/?>', "`r`n", "IgnoreCase")
  $text = [regex]::Replace($text, '</p\s*>', "`r`n`r`n", "IgnoreCase")
  $text = [regex]::Replace($text, '<[^>]+>', "")
  $text = [System.Net.WebUtility]::HtmlDecode($text)
  (($text -split '\r?\n' | ForEach-Object {
    ([regex]::Replace($_, '\s+', ' ')).Trim()
  }) -join "`r`n").Trim()
}

$slideWidth = 960.0
$slideHeight = 540.0
$scaleX = $slideWidth / [double]$layout.viewport.width
$scaleY = $slideHeight / [double]$layout.viewport.height
$ppt = $null
$presentation = $null

try {
  $ppt = New-Object -ComObject PowerPoint.Application
  $presentation = $ppt.Presentations.Add($false)
  $presentation.PageSetup.SlideWidth = $slideWidth
  $presentation.PageSetup.SlideHeight = $slideHeight

  for ($slideIndex = 0; $slideIndex -lt $layout.slides.Count; $slideIndex++) {
    $slideData = $layout.slides[$slideIndex]
    $slide = $presentation.Slides.Add($slideIndex + 1, 12)
    $slide.FollowMasterBackground = $false
    $background = $slide.Background.Fill
    $background.Solid()
    $background.ForeColor.RGB = Get-RgbValue $slideData.background

    foreach ($shapeData in $slideData.shapes) {
      $rect = $shapeData.rect
      $x = [single]([double]$rect.x * $scaleX)
      $y = [single]([double]$rect.y * $scaleY)
      $width = [single]([Math]::Max(0.5, [double]$rect.w * $scaleX))
      $height = [single]([Math]::Max(0.5, [double]$rect.h * $scaleY))
      $shapeType = if ($shapeData.oval) { 9 } elseif ([double]$shapeData.radius -gt 3) { 5 } else { 1 }
      $shape = $slide.Shapes.AddShape($shapeType, $x, $y, $width, $height)
      $shape.Name = "HTML Shape $($slide.Shapes.Count)"
      if ($shapeData.fillVisible) {
        $shape.Fill.Solid()
        Set-ShapeColor $shape.Fill $shapeData.fill
      } else {
        $shape.Fill.Visible = 0
      }
      if ([double]$shapeData.borderWidth -gt 0.1 -and [double]$shapeData.border.a -gt 0.01) {
        $shape.Line.Visible = -1
        Set-ShapeColor $shape.Line $shapeData.border
        $shape.Line.Weight = [single]([Math]::Max(0.5, [double]$shapeData.borderWidth * $scaleX))
      } else {
        $shape.Line.Visible = 0
      }
    }

    foreach ($textData in $slideData.texts) {
      $rect = $textData.rect
      $x = [single]([double]$rect.x * $scaleX)
      $y = [single]([double]$rect.y * $scaleY)
      $width = [single]([Math]::Max(2, [double]$rect.w * $scaleX + 2))
      $height = [single]([Math]::Max(2, [double]$rect.h * $scaleY + 2))
      $box = $slide.Shapes.AddTextbox(1, $x, $y, $width, $height)
      $box.Name = "HTML Text $($slide.Shapes.Count)"
      $box.Fill.Visible = 0
      $box.Line.Visible = 0
      $frame = $box.TextFrame2
      $frame.MarginLeft = 0
      $frame.MarginRight = 0
      $frame.MarginTop = 0
      $frame.MarginBottom = 0
      $frame.WordWrap = -1
      $frame.AutoSize = 0
      $range = $frame.TextRange
      $range.Text = [string]$textData.text
      $range.Font.Name = if ([string]$textData.fontFamily -match "Mono|monospace") { "Consolas" } else { "Aptos" }
      $fontScale = if ([string]$textData.tag -eq "H1") { 0.84 } else { 1.0 }
      $range.Font.Size = [single]([Math]::Max(
        5,
        [double]$textData.fontSize * $scaleX * $fontScale
      ))
      $range.Font.Bold = if ($textData.bold) { -1 } else { 0 }
      $range.Font.Italic = if ($textData.italic) { -1 } else { 0 }
      $range.Font.Fill.Solid()
      Set-ShapeColor $range.Font.Fill $textData.color
      switch ([string]$textData.align) {
        "center" { $range.ParagraphFormat.Alignment = 2 }
        "right" { $range.ParagraphFormat.Alignment = 3 }
        default { $range.ParagraphFormat.Alignment = 1 }
      }
    }

    $numberBox = $slide.Shapes.AddTextbox(1, 908, 510, 36, 15)
    $numberBox.Fill.Visible = 0
    $numberBox.Line.Visible = 0
    $numberBox.TextFrame2.TextRange.Text = "$($slideIndex + 1) / $($layout.slides.Count)"
    $numberBox.TextFrame2.TextRange.Font.Name = "Consolas"
    $numberBox.TextFrame2.TextRange.Font.Size = 6
    $numberBox.TextFrame2.TextRange.Font.Fill.ForeColor.RGB = 9002838
    $numberBox.TextFrame2.TextRange.ParagraphFormat.Alignment = 3

    if ($slideIndex -lt $notes.Count) {
      $body = $null
      foreach ($placeholder in $slide.NotesPage.Shapes.Placeholders) {
        try {
          if ($placeholder.PlaceholderFormat.Type -eq 2) {
            $body = $placeholder
            break
          }
        } catch {}
      }
      if ($null -ne $body) {
        $body.TextFrame.TextRange.Text = $notes[$slideIndex]
      }
    }
    Write-Output "Created editable slide $($slideIndex + 1)/$($layout.slides.Count)"
  }

  $outputDirectory = Split-Path -Parent $output
  if (-not (Test-Path $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory | Out-Null
  }
  if (Test-Path $output) {
    Remove-Item -LiteralPath $output -Force
  }
  $presentation.SaveAs($output, 24)
  $presentation.Close()
  $presentation = $null
  $ppt.Quit()
  $ppt = $null
} finally {
  if ($null -ne $presentation) {
    try { $presentation.Close() } catch {}
  }
  if ($null -ne $ppt) {
    try { $ppt.Quit() } catch {}
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
  if (Test-Path $snapshotPath) {
    Remove-Item -LiteralPath $snapshotPath -Force
  }
}

Get-Item $output | Select-Object FullName, Length, LastWriteTime
