@echo off
REM Check if Python is installed
python --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo Python is not installed. Please install Python 3 from https://www.python.org/downloads/
    pause
    exit /b
)

REM Start a local HTTP server on port 5000
echo Starting local server at http://localhost:5000
python -m http.server 5000
