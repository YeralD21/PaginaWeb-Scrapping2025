# Script PowerShell para ejecutar el scraping desde el backend
# Uso: .\ejecutar_scraping.ps1

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "EJECUTANDO SCRAPING DESDE EL BACKEND" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL: http://localhost:8000/scraping/ejecutar" -ForegroundColor Yellow
Write-Host "Esperando respuesta..." -ForegroundColor Yellow
Write-Host ""

try {
    # Realizar petición POST
    $response = Invoke-WebRequest -Uri "http://localhost:8000/scraping/ejecutar" -Method POST -TimeoutSec 600
    
    # Convertir respuesta JSON
    $resultado = $response.Content | ConvertFrom-Json
    
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "RESULTADO DEL SCRAPING" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    
    if ($resultado.success) {
        Write-Host "Estado: EXITOSO" -ForegroundColor Green
    } else {
        Write-Host "Estado: FALLIDO" -ForegroundColor Red
    }
    
    Write-Host "Noticias extraidas: $($resultado.total_extracted)" -ForegroundColor White
    Write-Host "Noticias guardadas: $($resultado.total_saved)" -ForegroundColor White
    Write-Host "Duplicados detectados: $($resultado.duplicates_detected)" -ForegroundColor Yellow
    Write-Host "Alertas activadas: $($resultado.alerts_triggered)" -ForegroundColor Yellow
    Write-Host "Duracion: $($resultado.duration_seconds) segundos" -ForegroundColor White
    
    if ($resultado.error) {
        Write-Host ""
        Write-Host "ERROR: $($resultado.error)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "Las noticias ya estan guardadas en la base de datos" -ForegroundColor Green
    Write-Host "Puedes verlas en el frontend: http://localhost:3000" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    
} catch {
    if ($_.Exception.Response.StatusCode -eq $null) {
        Write-Host ""
        Write-Host "ERROR: No se pudo conectar al backend" -ForegroundColor Red
        Write-Host "Asegurate de que el backend este corriendo:" -ForegroundColor Yellow
        Write-Host "  cd backend" -ForegroundColor White
        Write-Host "  python main.py" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

