@echo off
echo 🚀 Iniciando Sistema de Scraping Automatizado...

REM Activar entorno virtual si existe
if exist venv\Scripts\activate.bat (
    echo 📦 Activando entorno virtual...
    call venv\Scripts\activate.bat
)

REM Iniciar sistema
echo 🔄 Iniciando sistema completo...
python start_advanced_system.py

echo 👋 Sistema detenido
pause
