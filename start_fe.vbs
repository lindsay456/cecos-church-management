Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\HP PROBOOK\Documents\Default Project\frontend"
WshShell.Run "npx ng serve --host 0.0.0.0 --port 4200 --proxy-config proxy.conf.json", 0, False
