@echo off
chcp 65001 >nul
title PhysiMotion Studio
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nest pas installe sur cet ordinateur.
  echo Installez-le depuis https://nodejs.org ^(bouton LTS^), puis relancez ce fichier.
  start "" https://nodejs.org
  pause
  exit /b 1
)

if not exist node_modules (
  echo Premiere installation : quelques minutes, une connexion Internet est necessaire...
  call npm install
  if errorlevel 1 (
    echo Linstallation a echoue. Verifiez votre connexion Internet puis relancez ce fichier.
    pause
    exit /b 1
  )
)

echo PhysiMotion Studio demarre... Laissez cette fenetre ouverte pendant votre travail.
call npm start
pause
