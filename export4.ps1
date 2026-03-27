# ==============================
# GoodFilm 导出系统（版本稳定版）
# ==============================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$root = Get-Location

# ==============================
# 版本号处理
# ==============================
$versionFile = Join-Path $root "VERSION.txt"

if (!(Test-Path $versionFile)) {
    "v9.3.0" | Out-File $versionFile -Encoding utf8
}

$version = (Get-Content $versionFile -Raw).Trim()

if ($version -match "v(\d+)\.(\d+)\.(\d+)") {
    $major = [int]$matches[1]
    $minor = [int]$matches[2]
    $patch = [int]$matches[3]
    $patch++
}
else {
    $major = 9
    $minor = 3
    $patch = 1
}

$newVersion = "v$major.$minor.$patch"
$newVersion | Out-File $versionFile -Encoding utf8

Write-Host ("当前版本: " + $newVersion)

# ==============================
# 文件路径（强制当前目录）
# ==============================
$outputTxt = Join-Path $root ("backup_" + $newVersion + ".txt")
$rebuildSh = Join-Path $root ("rebuild_" + $newVersion + ".sh")
$zipFile   = Join-Path $root ("backup_" + $newVersion + ".zip")

# UTF-8 无 BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# 排除规则
$excludeDirs = @("node_modules", ".git", ".wrangler", "dist")
$excludeExt  = @(".txt", ".log", ".zip")

# 初始化
[System.IO.File]::WriteAllText($outputTxt, "", $utf8NoBom)
[System.IO.File]::WriteAllText($rebuildSh, "", $utf8NoBom)

Add-Content $rebuildSh '#!/bin/bash' -Encoding utf8
Add-Content $rebuildSh 'echo "Rebuilding project..."' -Encoding utf8

# ==============================
# 文件过滤
# ==============================
$files = Get-ChildItem -Recurse -File | Where-Object {

    $full = $_.FullName

    if ($full -eq $outputTxt) { return $false }
    if ($full -eq $rebuildSh) { return $false }

    foreach ($ext in $excludeExt) {
        if ($_.Extension -eq $ext) { return $false }
    }

    foreach ($dir in $excludeDirs) {
        if ($full -like "*\$dir\*") { return $false }
    }

    return $true
}

# ==============================
# 导出
# ==============================
foreach ($file in $files) {

    $relative = $file.FullName.Replace($root.Path + "\", "")

    Write-Host ("Exporting: " + $relative)

    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
    }
    catch {
        $content = "[读取失败]"
    }

    # TXT
    [System.IO.File]::AppendAllText($outputTxt, "`r`n==============================`r`n", $utf8NoBom)
    [System.IO.File]::AppendAllText($outputTxt, "FILE: " + $relative + "`r`n", $utf8NoBom)
    [System.IO.File]::AppendAllText($outputTxt, "==============================`r`n`r`n", $utf8NoBom)
    [System.IO.File]::AppendAllText($outputTxt, $content + "`r`n", $utf8NoBom)

    # SH
    Add-Content $rebuildSh "" -Encoding utf8
    Add-Content $rebuildSh ("# FILE: " + $relative) -Encoding utf8

    $dir = Split-Path $relative -Parent
    if ($dir) {
        Add-Content $rebuildSh ("mkdir -p '" + $dir + "'") -Encoding utf8
    }

    Add-Content $rebuildSh ("cat > '" + $relative + "' << 'EOF'") -Encoding utf8
    [System.IO.File]::AppendAllText($rebuildSh, $content + "`n", $utf8NoBom)
    Add-Content $rebuildSh "EOF" -Encoding utf8
}

# ==============================
# ZIP
# ==============================
Write-Host "正在打包 ZIP..."

if (Test-Path $zipFile) {
    Remove-Item $zipFile
}

Compress-Archive -Path * -DestinationPath $zipFile

# ==============================
# 完成
# ==============================
Write-Host "=============================="
Write-Host "导出完成"
Write-Host ("版本: " + $newVersion)
Write-Host ("TXT: " + $outputTxt)
Write-Host ("SH : " + $rebuildSh)
Write-Host ("ZIP: " + $zipFile)
Write-Host "=============================="