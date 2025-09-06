# 📰 Sistema de Actualización Automática de Noticias

## 🎯 ¿Qué hace este sistema?

Este sistema **detecta automáticamente nuevas noticias** de los diarios peruanos (El Comercio, Diario Correo, El Popular) y las añade a tu página web **sin duplicados**, con la fecha exacta de cuando se detectaron.

## 🔄 ¿Cómo funciona?

### 1. **Scraping Automático**
- Se ejecuta cada **15 minutos** (configurable)
- Extrae noticias de los 3 diarios
- **Solo añade noticias nuevas** (evita duplicados)
- Guarda la **fecha y hora exacta** de detección

### 2. **Detección de Novedades**
- Compara títulos y enlaces con la base de datos
- Si encuentra una noticia nueva → la añade
- Si ya existe → la ignora
- **Resultado**: Solo noticias frescas en tu web

### 3. **Actualización en Tiempo Real**
- El frontend se actualiza automáticamente
- Muestra noticias recientes con timestamps
- Notificaciones opcionales de nuevas noticias

## 🚀 Cómo usar el sistema

### Opción 1: Sistema Completo Automático
```bash
# Iniciar todo el sistema (Backend + Scheduler + Frontend)
python start_auto_system.py
```

### Opción 2: Configurar antes de iniciar
```bash
# Configurar frecuencia y opciones
python config_auto_update.py

# Luego iniciar el sistema
python start_auto_system.py
```

### Opción 3: Solo el Scheduler (si ya tienes backend corriendo)
```bash
cd scheduler
python cron_job.py
```

## ⚙️ Configuración

### Frecuencias Recomendadas:
- **5 minutos**: Para desarrollo/testing
- **15 minutos**: Producción (recomendado)
- **30 minutos**: Uso moderado
- **60+ minutos**: Uso espaciado

### Variables de Entorno:
```bash
# Frecuencia de scraping (minutos)
export SCHEDULE_INTERVAL_MINUTES=15

# Máximo noticias por scraping
export MAX_NEWS_PER_SCRAPING=50
```

## 📊 Endpoints de la API

### Noticias Recientes
```bash
# Noticias de la última hora
GET /noticias/recientes?horas=1

# Noticias de las últimas 6 horas
GET /noticias/recientes?horas=6&limit=100
```

### Estado del Sistema
```bash
# Información de última actualización
GET /noticias/ultima-actualizacion
```

**Respuesta:**
```json
{
  "ultima_actualizacion": "2025-01-09T14:30:00",
  "tiempo_transcurrido_minutos": 5,
  "total_noticias": 87,
  "estado": "Actualizado"
}
```

## 🔍 Monitoreo del Sistema

### Logs del Scheduler
```bash
# Ver logs en tiempo real
tail -f scheduler.log

# Ver logs del sistema
tail -f scheduler/scheduler.log
```

### Verificar Estado
```bash
# Verificar que el scheduler esté corriendo
ps aux | grep cron_job.py

# Verificar última actualización
curl http://localhost:8000/noticias/ultima-actualizacion
```

## 📈 Flujo de Datos

```
1. Scheduler (cada 15 min)
   ↓
2. Scrapers (El Comercio, Correo, Popular)
   ↓
3. Detección de novedades (comparar con BD)
   ↓
4. Guardar solo noticias nuevas
   ↓
5. Frontend se actualiza automáticamente
   ↓
6. Usuario ve noticias frescas con timestamps
```

## 🛠️ Estructura de Archivos

```
├── scheduler/
│   └── cron_job.py          # Scheduler principal
├── backend/
│   └── main.py              # API con endpoints nuevos
├── start_auto_system.py     # Iniciar sistema completo
├── config_auto_update.py    # Configurador interactivo
└── auto_update_config.json  # Configuración guardada
```

## 🔧 Personalización

### Cambiar Frecuencia
```python
# En start_auto_system.py
SCHEDULE_INTERVAL_MINUTES = 30  # Cambiar a 30 minutos
```

### Configurar Notificaciones
```python
# En config_auto_update.py
"enable_notifications": True,
"notification_sound": True
```

### Limpiar Noticias Antiguas
```python
# Mantener solo noticias de los últimos 30 días
"cleanup_old_news_days": 30
```

## 🚨 Solución de Problemas

### El scheduler no se ejecuta
```bash
# Verificar dependencias
pip install schedule

# Verificar logs
cat scheduler.log
```

### No se detectan noticias nuevas
```bash
# Verificar conectividad
curl -I https://elcomercio.pe
curl -I https://diariocorreo.pe
curl -I https://elpopular.pe
```

### Base de datos llena
```bash
# Limpiar noticias antiguas
python -c "
from backend.database import get_db
from backend.models import Noticia
from datetime import datetime, timedelta
db = next(get_db())
fecha_limite = datetime.now() - timedelta(days=30)
db.query(Noticia).filter(Noticia.fecha_extraccion < fecha_limite).delete()
db.commit()
print('Noticias antiguas eliminadas')
"
```

## 📱 Frontend - Nuevas Funcionalidades

### Indicador de Última Actualización
El frontend ahora muestra:
- ⏰ "Última actualización: hace 5 minutos"
- 🔄 Botón de actualización manual
- 📊 Contador de noticias nuevas

### Notificaciones (Opcional)
- 🔔 Notificación cuando hay noticias nuevas
- 🔊 Sonido de notificación
- 📱 Badge con número de noticias nuevas

## 🎉 Resultado Final

Con este sistema tendrás:
- ✅ **Noticias siempre actualizadas** (cada 15 minutos)
- ✅ **Sin duplicados** (solo noticias nuevas)
- ✅ **Timestamps precisos** (fecha/hora de detección)
- ✅ **Actualización automática** del frontend
- ✅ **Monitoreo del sistema** (logs y estado)
- ✅ **Configuración flexible** (frecuencia, notificaciones)

¡Tu página web ahora se mantiene actualizada automáticamente! 🚀
