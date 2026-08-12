@echo off
title Online Quiz Management System Launcher
echo ===================================================
echo 🎓 Starting Online Quiz Management System...
echo ===================================================
echo.

:: Check if MongoDB is running locally (optional print warning)
echo 🔍 Checking local MongoDB status...
echo Make sure MongoDB server is running on port 27017.
echo.

:: Launch Backend Server in a new command window
echo 🚀 Launching API Backend (Port 5005)...
start "Quiz System Backend" cmd /k "cd backend && npm run dev || node server.js"

:: Give backend a second to bind
timeout /t 2 >nul

:: Launch Frontend Server in a new command window
echo 🚀 Launching React Frontend (Port 5173)...
start "Quiz System Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo 🎉 System started successfully!
echo.
echo 🌐 Local Frontend URL: http://localhost:5173/
echo 🌐 Local Backend API:  http://localhost:5005/
echo 🌐 Same Wi-Fi Access:   http://192.168.1.4:5173/
echo ===================================================
echo.
echo To share over the internet with anyone outside Wi-Fi:
echo Double click share-project.bat in this folder!
echo.
echo Press any key to exit launcher...
pause >nul
