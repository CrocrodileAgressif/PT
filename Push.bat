@echo off
cd /d %~dp0

echo.
echo Adding changes...
git add .

echo.
echo Committing...
git commit -m "Export"

if errorlevel 1 (
    echo Nothing to commit or commit failed.
    pause
    exit /b
)

echo.
echo Pushing to GitHub...
git push

echo.
echo Done.
timeout /t 5