@echo off
title SmartHR Nexus - AI Workforce Platform (Pallavi Jain)
color 0B
cls

echo ===============================================================================
echo                SMARTHR NEXUS : AI-POWERED WORKFORCE PLATFORM
echo              Enterprise Human Resource Management System (India Edition)
echo ===============================================================================
echo.
echo   * Candidate       : Pallavi Jain
echo   * Subject         : Advance Project (1010103493) - 7th Semester B.Tech IT
echo   * Institution     : Silver Oak University, Ahmedabad
echo.
echo ===============================================================================
echo.

set "PROJECT_ROOT=%~dp0SmartHR-Nexus-AI-Workforce-Platform"
if not exist "%PROJECT_ROOT%\package.json" (
    set "PROJECT_ROOT=%~dp0"
)

echo [1/4] Checking MongoDB Database Service...
sc query MongoDB | find "RUNNING" >nul
if errorlevel 1 (
    echo Starting MongoDB service...
    net start MongoDB >nul 2>&1
)

echo [2/4] Starting SmartHR Nexus Servers (Backend on Port 5000 & Frontend on Port 3000)...
start "SmartHR Servers - Pallavi Jain" cmd /k "cd /d ""%PROJECT_ROOT%"" && npm run dev"

echo [3/4] Waiting for services to initialize...
timeout /t 5 /nobreak >nul

echo [4/4] Opening Web Application in Browser...
start "" "http://localhost:3000"

echo.
echo ===============================================================================
echo                      SMARTHR NEXUS IS RUNNING LIVE!
echo ===============================================================================
echo.
echo   - Web Application URL : http://localhost:3000
echo   - Backend REST API    : http://localhost:5000/health
echo.
echo   DEMO LOGIN ACCOUNTS (Local Live Database):
echo   -----------------------------------------------------------------------------
echo   Role            Candidate / Name   Email               Password
echo   -----------------------------------------------------------------------------
echo   Admin           Pallavi Jain       admin@demo.com      Admin@1234
echo   Senior Manager  Rohan Mehta        manager@demo.com    Manager@1234
echo   HR Recruiter    Priya Sharma       hr@demo.com         HR@12345
echo   Employee        Aarav Shah         employee@demo.com   Employee@1234
echo   -----------------------------------------------------------------------------
echo.
echo Keep the "SmartHR Servers" window open while working on the live project.
echo To stop the servers anytime, run STOP_SmartHR.bat or close the servers window.
echo ===============================================================================
echo.
pause
