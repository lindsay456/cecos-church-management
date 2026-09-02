@echo off
echo Starting CECOS Church Management...
echo.

echo [1/2] Starting backend on port 8000...
cd /d "%~dp0backend"
start "CECOS-Backend" cmd /k ".venv\Scripts\python.exe manage.py runserver 8000"

echo [2/2] Starting frontend on port 4200...
cd /d "%~dp0frontend"
start "CECOS-Frontend" cmd /k "npx ng serve --host 0.0.0.0 --port 4200 --proxy-config proxy.conf.json"

echo.
echo ========================================
echo  CECOS Church Management - Demarrage en cours...
echo.
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:4200
echo  API Docs: http://localhost:8000/api/docs/
echo.
echo  Login: admin@gmail.com / Admin@2024
echo ========================================
echo.
pause
