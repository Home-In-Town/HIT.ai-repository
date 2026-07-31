# Run this script AFTER closing all files in the editor
# Open PowerShell as Admin and run: .\REORGANIZE.ps1

$repo = "c:\Users\Pranay Bhujade\Downloads\HIT.ai-repository"
Set-Location $repo

Write-Host "Step 1: Renaming homeintown-source → homeintown_ai-frontend..."
if (Test-Path "$repo\homeintown-source") {
    Rename-Item "$repo\homeintown-source" "homeintown_ai-frontend" -Force
    Write-Host "  Done!" -ForegroundColor Green
} else {
    Write-Host "  Already renamed or not found" -ForegroundColor Yellow
}

Write-Host "Step 2: Cloning backend as homeintown_ai-backend..."
if (-not (Test-Path "$repo\homeintown_ai-backend")) {
    git clone https://github.com/Home-In-Town/HIT_Backend.git homeintown_ai-backend
    # Remove .git from backend (it's a subfolder, not a separate repo)
    Remove-Item "$repo\homeintown_ai-backend\.git" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  Done!" -ForegroundColor Green
} else {
    Write-Host "  Already exists" -ForegroundColor Yellow
}

Write-Host "Step 3: Removing old homeintown-source if still exists..."
if (Test-Path "$repo\homeintown-source") {
    Remove-Item "$repo\homeintown-source" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "`nFinal structure:"
Get-ChildItem $repo -Force -Directory | Select-Object Name

Write-Host "`nStep 4: Committing and pushing..."
git add -A
git commit -m "reorganize: homeintown_ai-frontend + homeintown_ai-backend"
git push origin main

Write-Host "`nDone! Repo reorganized." -ForegroundColor Green
