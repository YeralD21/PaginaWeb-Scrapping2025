# Scraper de CNN - Guía de Uso

## Estado Actual

✅ **El scraper de CNN con Selenium está activo y funcionando correctamente**

### Situación de los Scrapers

1. **`scraper_cnn_selenium.py`** (ACTIVO) ✅
   - Usa Selenium para contenido dinámico
   - Funciona correctamente (24 noticias con imágenes únicas)
   - Ya está integrado en `main_scraper.py`

2. **`scraper_cnn_final.py`** (RESPALDO)
   - Usa BeautifulSoup (no funciona con CNN porque requiere JavaScript)
   - Se usa solo si Selenium no está disponible
   - NO causa conflictos - el sistema selecciona automáticamente

## Cómo Funciona la Integración

El archivo `main_scraper.py` maneja automáticamente qué scraper usar:

```python
# Intenta usar Selenium primero (mejor)
try:
    from scraper_cnn_selenium import ScraperCNNSelenium
    CNN_SCRAPER_CLASS = ScraperCNNSelenium  # ✅ ACTIVO
except ImportError:
    # Fallback al scraper tradicional si Selenium no está disponible
    from scraper_cnn_final import ScraperCNNFinal
    CNN_SCRAPER_CLASS = ScraperCNNFinal
```

**No hay conflictos** porque:
- Solo se usa UN scraper a la vez
- El sistema selecciona automáticamente el mejor disponible
- Selenium tiene prioridad sobre BeautifulSoup

## Cómo Ejecutar el Scraping

### Opción 1: Desde el Backend (Recomendado)

```bash
# Iniciar el backend
cd backend
python main.py

# En otra terminal o desde el navegador/Postman:
POST http://localhost:8000/scraping/ejecutar
```

Esto ejecutará el scraping de TODOS los diarios (incluyendo CNN con Selenium) y guardará las noticias en la base de datos.

### Opción 2: Solo CNN (Prueba)

```bash
cd scraping
python scraper_cnn_selenium.py
```

Esto solo ejecuta el scraper de CNN pero NO guarda en la base de datos (solo prueba).

## Verificar Noticias en el Frontend

1. **Ejecutar el scraping desde el backend:**
   ```bash
   POST http://localhost:8000/scraping/ejecutar
   ```

2. **Las noticias se guardan automáticamente en la base de datos**

3. **Ver en el frontend:**
   - Ir a: `http://localhost:3000/diario/cnn-en-espa%C3%B1ol`
   - Las noticias scrapeadas deberían aparecer automáticamente

## Resultados del Último Scraping

- ✅ **24 noticias** scrapeadas exitosamente
- ✅ **24/24 con imágenes** (100%)
- ✅ **0 imágenes duplicadas** - Todas las imágenes son únicas
- ✅ Categorías: Mundo (3), Deportes (5), Economía (5), Otros (11)

## Preguntas Frecuentes

### ¿Las noticias ya están en mi página web?

**No automáticamente.** Necesitas ejecutar el scraping desde el backend para que se guarden en la base de datos:

```bash
POST http://localhost:8000/scraping/ejecutar
```

### ¿Hay conflictos entre los dos scrapers?

**No.** El sistema usa automáticamente el scraper con Selenium cuando está disponible. El otro solo se usa como respaldo.

### ¿Cómo sé qué scraper se está usando?

El sistema registra en los logs:
- `✅ Scraper CNN inicializado (Selenium)` = Usando Selenium ✅
- `⚠️ Selenium no disponible, usando scraper tradicional` = Usando BeautifulSoup

### ¿Puedo eliminar `scraper_cnn_final.py`?

**No recomendado.** Es útil como respaldo si Selenium falla o no está disponible. El sistema lo maneja automáticamente.

## Próximos Pasos

1. ✅ Ejecutar scraping desde el backend: `POST /scraping/ejecutar`
2. ✅ Verificar que las noticias aparecen en el frontend
3. ✅ Configurar scraping automático (scheduler) si es necesario

