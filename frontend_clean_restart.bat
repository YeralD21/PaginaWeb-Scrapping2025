@echo off
echo 🧹 Limpiando caché del frontend...
cd frontend

REM Limpiar caché de webpack/craco
if exist "node_modules\.cache" (
    echo Eliminando node_modules\.cache...
    rmdir /s /q "node_modules\.cache"
)

REM Limpiar build si existe
if exist "build" (
    echo Eliminando carpeta build...
    rmdir /s /q "build"
)

echo.
echo ✅ Caché limpiada
echo.
echo 🚀 Iniciando servidor del frontend con nueva UI...
echo.
echo 💡 IMPORTANTE:
echo    - Presiona Ctrl+Shift+R en el navegador para forzar recarga
echo    - O abre una ventana de incógnito
echo.

npm start

