$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
gh auth login -h github.com -p https -w 2>&1 | Tee-Object -FilePath "C:\Users\HP PROBOOK\Documents\Default Project\gh_output.txt"
gh auth status 2>&1 | Tee-Object -FilePath "C:\Users\HP PROBOOK\Documents\Default Project\gh_output.txt" -Append
