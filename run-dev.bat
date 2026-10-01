@echo off
echo ===================================================
echo   Starting NFC Memory Gift (Laravel + React Vite)
echo ===================================================

echo Starting Laravel Backend on http://127.0.0.1:8000 ...
start "Laravel Backend" cmd /k "cd backend && php artisan serve --port=8000"

echo Starting React Vite Frontend on http://localhost:5173 ...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are launching!
echo Frontend: http://localhost:5173
echo Backend API: http://127.0.0.1:8000/api
echo Default Admin PIN: 1314
