@echo off
echo ========================================================================
echo  🚀 ACTIVANDO BACKEND CON SELENIUM (scraping REAL de redes sociales)
echo ========================================================================
echo.
echo  ⚠️  ADVERTENCIA: Esto tardara 2-3 minutos en scrapear noticias
echo.

set USE_SELENIUM=true
cd backend
python main.py

pause

