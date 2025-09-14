# 📰 Guía para Aumentar la Capacidad de Noticias

## 🎯 Objetivo
Llegar a **500-1000+ noticias** en tu sistema de scraping de diarios peruanos.

## 🚀 Mejoras Implementadas

### 1. **Paginación Mejorada** (+200-300 noticias)
- **Antes**: 10 noticias por categoría
- **Ahora**: 15 noticias por página × 3 páginas = 45 noticias por categoría
- **Resultado**: 3x más noticias por categoría

### 2. **Más Categorías** (+150-200 noticias)
- **El Comercio**: Agregadas Política y Sociedad
- **Diario Correo**: Ya tenía Espectáculos
- **El Popular**: Ya tenía Espectáculos
- **Total**: 5 categorías por diario (antes 3)

### 3. **Scraper Asíncrono** (+300-500 noticias)
- Procesamiento paralelo de múltiples páginas
- Scraping simultáneo de todos los diarios
- Mejor manejo de errores y timeouts

### 4. **Frontend Optimizado**
- Límite aumentado de 100 a 500 noticias
- Mejor rendimiento en la carga

## 📊 Configuraciones Disponibles

| Nivel | Páginas/Categoría | Artículos/Página | Categorías/Diario | Noticias Esperadas |
|-------|------------------|------------------|-------------------|-------------------|
| **Básico** | 2 | 10 | 3 | ~150-200 |
| **Medio** | 3 | 15 | 5 | ~300-400 |
| **Alto** | 5 | 20 | 7 | ~500-700 |
| **Máximo** | 8 | 25 | 7 | ~800-1000+ |

## 🛠️ Cómo Usar las Mejoras

### Opción 1: Script Automático (Recomendado)
```bash
# Instalar dependencias adicionales
pip install aiohttp

# Ejecutar con configuración media (recomendado para empezar)
python increase_news_capacity.py medio

# Para máximo rendimiento
python increase_news_capacity.py maximo
```

### Opción 2: Usar el Scraper Mejorado Directamente
```python
import asyncio
from scraping.enhanced_scraper import get_enhanced_news

async def main():
    news = await get_enhanced_news()
    print(f"Obtuviste {len(news)} noticias!")

asyncio.run(main())
```

### Opción 3: Scrapers Individuales Mejorados
Los scrapers originales ahora tienen paginación:
```python
from scraping.scraper_comercio import ScraperComercio

scraper = ScraperComercio()
# Ahora obtiene 3 páginas × 15 artículos = 45 noticias por categoría
noticias = scraper.get_deportes(max_pages=3)
```

## 📈 Resultados Esperados

### Antes de las Mejoras:
- **El Comercio**: 3 categorías × 10 noticias = 30 noticias
- **Diario Correo**: 4 categorías × 10 noticias = 40 noticias  
- **El Popular**: 3 categorías × 10 noticias = 30 noticias
- **Total**: ~100 noticias

### Después de las Mejoras (Modo Medio):
- **El Comercio**: 5 categorías × 3 páginas × 15 noticias = 225 noticias
- **Diario Correo**: 4 categorías × 3 páginas × 15 noticias = 180 noticias
- **El Popular**: 3 categorías × 3 páginas × 15 noticias = 135 noticias
- **Total**: ~540 noticias

### Con Scraper Asíncrono (Modo Máximo):
- **Procesamiento paralelo** de todas las categorías
- **Más páginas** por categoría (hasta 8)
- **Más artículos** por página (hasta 25)
- **Total esperado**: 800-1000+ noticias

## ⚡ Optimizaciones Adicionales

### 1. **Ejecutar Múltiples Veces**
```bash
# Ejecutar varias veces para acumular más noticias
python increase_news_capacity.py medio
python increase_news_capacity.py alto
python increase_news_capacity.py maximo
```

### 2. **Programar Ejecuciones Automáticas**
```bash
# Agregar al cron job existente
# Ejecutar cada 2 horas para mantener el volumen
0 */2 * * * cd /ruta/a/tu/proyecto && python increase_news_capacity.py medio
```

### 3. **Monitorear Resultados**
```python
from increase_news_capacity import NewsCapacityManager

manager = NewsCapacityManager()
stats = manager.get_database_stats()
print(f"Total de noticias: {stats['total_noticias']}")
```

## 🔧 Solución de Problemas

### Error: "aiohttp not found"
```bash
pip install aiohttp==3.9.1
```

### Error: "Too many requests"
- Reducir el número de páginas por categoría
- Aumentar delays entre requests
- Usar configuración "básico" o "medio"

### Error: "Database connection"
- Verificar que el backend esté corriendo
- Revisar la configuración de la base de datos

## 📊 Monitoreo y Estadísticas

### Ver Estadísticas Actuales:
```python
from increase_news_capacity import NewsCapacityManager

manager = NewsCapacityManager()
stats = manager.get_database_stats()

print("📊 ESTADÍSTICAS ACTUALES:")
print(f"Total: {stats['total_noticias']} noticias")
for diario, count in stats['por_diario'].items():
    print(f"  {diario}: {count}")
```

### Verificar en el Frontend:
- Ir a `http://localhost:3000`
- Verificar que se muestren más noticias
- El límite ahora es 500 noticias por carga

## 🎯 Próximos Pasos

1. **Ejecutar el script** con configuración "medio"
2. **Verificar resultados** en la base de datos
3. **Probar en el frontend** que se muestren más noticias
4. **Ajustar configuración** según necesidades
5. **Programar ejecuciones automáticas** para mantener el volumen

## 📞 Soporte

Si tienes problemas:
1. Revisar los logs en `logs/`
2. Verificar que todas las dependencias estén instaladas
3. Comprobar que el backend esté corriendo
4. Usar configuración "básico" si hay problemas de rendimiento

¡Con estas mejoras deberías poder llegar fácilmente a 500-1000+ noticias! 🚀
