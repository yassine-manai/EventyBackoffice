@echo off

::set /p version="Enter Docker version (e.g., 0.0.x): "


echo Building Docker image (yassinemanai/formation) with version 10.0
docker build -t yassinemanai/formation:10.0 .
::docker build -t yassinemanai/fmc_core:0.0.1 . 

if %errorlevel% neq 0 (
    echo Building failed with error code %errorlevel%.
    exit /b 1
)

echo Building completed successfully.

echo Pushing to DOCKER HUB
docker push yassinemanai/formation:10.0
::docker push yassinemanai/fmc_core:0.0.1

if %errorlevel% neq 0 (
    echo Pushing failed with error code %errorlevel%.
    exit /b 1
)

echo Push completed successfully.
