$ErrorActionPreference = "Continue"
Get-Content .env.local | Where-Object { $_.Trim() -match "^([^#=]+)=(.*)$" } | ForEach-Object {
    $k = $Matches[1].Trim()
    $v = $Matches[2].Trim()
    Write-Host "Uploading $k to Vercel..."
    
    # Upload to each environment separately
    $v | npx vercel env add $k production --scope rahul11fs-projects
    $v | npx vercel env add $k preview --scope rahul11fs-projects
    $v | npx vercel env add $k development --scope rahul11fs-projects
}
Write-Host "Finished uploading all environment variables!"
