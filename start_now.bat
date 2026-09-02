@echo off
echo Starting CECOS...
cd /d "%~dp0backend"
start "CECOS-Backend" cmd /k ".venv\Scripts\python.exe manage.py runserver 8000"
cd /d "%~dp0frontend"
start "CECOS-Frontend" cmd /k "npx ng serve --host 0.0.0.0 --port 4200 --proxy-config proxy.conf.json"
echo Both servers starting...
