# Script kiểm tra HTML structure nhanh
# Usage: .\check-html.ps1

Write-Host "Checking HTML files..." -ForegroundColor Cyan

# Tìm tất cả file HTML trong src/app
$htmlFiles = Get-ChildItem -Path "src\app" -Filter "*.html" -Recurse

$errors = @()

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Đếm số thẻ div mở và đóng
    $openDivs = ([regex]::Matches($content, '<div[^>]*>')).Count
    $closeDivs = ([regex]::Matches($content, '</div>')).Count
    
    if ($openDivs -ne $closeDivs) {
        $errors += "❌ $($file.FullName): Div tags mismatch (Open: $openDivs, Close: $closeDivs)"
    } else {
        Write-Host "✓ $($file.Name): OK" -ForegroundColor Green
    }
}

if ($errors.Count -gt 0) {
    Write-Host "`nErrors found:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    exit 1
} else {
    Write-Host "`nAll HTML files are valid!" -ForegroundColor Green
    exit 0
}

