# 📺 Implementación de Videos de YouTube con Reproducción Embebida

## 🎯 Objetivo Completado

Se ha implementado un sistema completo para:
1. ✅ Scrapear videos de canales de noticias de YouTube
2. ✅ Almacenar los videos en la base de datos con el formato correcto
3. ✅ Reproducir los videos directamente en la página web (sin redirigir a YouTube)
4. ✅ Usar el player embebido de YouTube (sin necesidad de descargar videos)

## 🔧 Cambios Realizados

### 1. Backend - Scrapers de YouTube (`scraping/scraper_youtube.py` y `scraper_youtube_selenium.py`)

**Mejoras implementadas:**
- ✅ **Campo `diario`**: Ahora se guarda como `'YouTube'` (exactamente) para que el frontend pueda detectar videos
- ✅ **Campo `diario_nombre`**: Guarda el nombre del canal (CNN, RPP, El Comercio, etc.)
- ✅ **Campo `autor`**: También guarda el nombre del canal
- ✅ **Campo `enlace`**: Guarda la URL completa del video (`https://www.youtube.com/watch?v=VIDEO_ID`)
- ✅ **Campo `metadata`**: Incluye `video_id`, `youtube_channel_id`, `youtube_handle`, etc.
- ✅ **Validación de URLs**: Solo guarda videos con URLs válidas que empiecen con `http`
- ✅ **Logging mejorado**: Muestra información detallada durante el scraping

**Ejemplo de datos guardados:**
```python
{
    'titulo': 'Política: Últimas noticias de la región',
    'contenido': 'Descripción del video...',
    'enlace': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',  # URL completa
    'imagen_url': 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    'categoria': 'Política',
    'diario': 'YouTube',  # CRÍTICO: Debe ser exactamente 'YouTube'
    'diario_nombre': 'CNN en Español',  # Nombre del canal
    'autor': 'CNN en Español',
    'metadata': {
        'youtube_channel_id': 'UC_lEiu6917IJz03TnntWUaQ',
        'youtube_handle': '@CNNEE',
        'youtube_channel_url': 'https://www.youtube.com/@CNNEE',
        'video_id': 'dQw4w9WgXcQ'  # ID del video para embed
    }
}
```

### 2. Backend - Endpoint de Scraping (`backend/main.py`)

**Nuevo endpoint:**
```python
POST /scraping/social-media/youtube/ejecutar
```

Este endpoint ejecuta **solo** el scraping de YouTube (no otras redes sociales).

### 3. Backend - Servicio de Scraping (`backend/scraping_service.py`)

**Nuevo método:**
```python
def execute_youtube_scraping(self) -> Dict:
    """Ejecutar scraping exclusivamente de YouTube"""
    # Llama al scraper de YouTube
    # Guarda los videos en la base de datos
    # Retorna estadísticas
```

### 4. Frontend - Componente de Redes Sociales (`frontend/src/components/SocialMediaFeed.js`)

**Mejoras implementadas:**
- ✅ **Botón exclusivo para YouTube**: Botón rojo con ícono ▶️
- ✅ **Función `handleYoutubeRefresh`**: Llama al endpoint de scraping de YouTube
- ✅ **Detección inteligente de videos**: La función `isYouTubeItem` detecta videos de YouTube por:
  - `diario_nombre === 'youtube'` (case-insensitive)
  - `diario === 'youtube'`
  - URL contiene `youtube.com` o `youtu.be`
- ✅ **Reproducción embebida**: Usa `<iframe>` con el player de YouTube
- ✅ **Botón de play**: Muestra un overlay con botón de play sobre la miniatura
- ✅ **Cierre del video**: Botón X para cerrar el video y volver a la miniatura

**Flujo de interacción:**
1. Usuario hace clic en el botón "YouTube" (scraping)
2. Se ejecuta el scraping de canales de YouTube
3. Se cargan los videos en la vista
4. Usuario hace clic en un video (miniatura con botón ▶)
5. Se muestra el player embebido de YouTube
6. El video se reproduce automáticamente
7. Usuario puede cerrar con el botón X

### 5. Frontend - Estilos (`frontend/src/components/SocialMediaFeed.css`)

**Nuevos estilos:**
```css
.youtube-refresh-button {
  background: linear-gradient(135deg, #ff4d4d 0%, #ff0000 100%);
  /* Botón rojo distintivo para YouTube */
}

.youtube-play-overlay {
  /* Overlay con botón de play sobre la miniatura */
}

.youtube-embed-wrapper {
  /* Contenedor para el iframe embebido */
}

.youtube-close-button {
  /* Botón X para cerrar el video */
}
```

### 6. Canales de YouTube Configurados (`scraping/youtube_channels.py`)

**Canales verificados (Nov 2025):**

#### Noticias Peruanas:
- ✅ RPP Noticias (`@RPPNoticias`)
- ✅ América TV (`@americatv`)
- ✅ El Comercio (`@elcomercioperu`)

#### Noticias Internacionales en Español:
- ✅ CNN en Español (`@CNNEE`)
- ✅ BBC News Mundo (`@BBCNewsMundo`)
- ✅ El País (`@ElPais`)

#### Noticias Internacionales (Inglés):
- ✅ CNN (`@CNN`)

## 📋 Scripts de Utilidad Creados

### 1. `fix_youtube_videos.py`
Verifica y corrige videos de YouTube en la base de datos.

**Uso:**
```bash
python fix_youtube_videos.py
```

**Funcionalidades:**
- Verifica que el diario 'YouTube' exista
- Busca videos con enlaces de YouTube
- Verifica que tengan el `diario_id` correcto
- Muestra un reporte completo

### 2. `test_youtube_simple.py`
Prueba el flujo completo de scraping y visualización.

**Uso:**
```bash
python test_youtube_simple.py
```

**Funcionalidades:**
- Ejecuta el scraping de YouTube vía API
- Obtiene los videos guardados
- Verifica que tengan el formato correcto
- Muestra ejemplos de cómo se embebería cada video

### 3. `scraping/verificar_canales_youtube.py`
Verifica que los canales de YouTube configurados sean válidos.

**Uso:**
```bash
python scraping/verificar_canales_youtube.py
```

### 4. `scraping/obtener_ids_youtube.py`
Obtiene los IDs correctos de canales de YouTube.

**Uso:**
```bash
python scraping/obtener_ids_youtube.py
```

## 🚀 Cómo Usar el Sistema

### Opción 1: Desde el Frontend (Recomendado)

1. **Iniciar el backend:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Iniciar el frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Usar la interfaz:**
   - Ir a http://localhost:3000
   - Hacer clic en "Redes Sociales" en el menú
   - Hacer clic en el botón rojo "YouTube" para scrapear videos
   - Esperar a que se carguen los videos
   - Hacer clic en cualquier video para reproducirlo

### Opción 2: Desde la API (Para pruebas)

**Ejecutar scraping:**
```bash
curl -X POST http://localhost:8000/scraping/social-media/youtube/ejecutar
```

**Obtener videos:**
```bash
curl http://localhost:8000/social-media?diario=YouTube&limit=10
```

### Opción 3: Script de Python

```python
from backend.scraping_service import ScrapingService

service = ScrapingService()
result = service.execute_youtube_scraping()

print(f"Videos guardados: {result['total_saved']}")
```

## 🎬 Cómo Funciona la Reproducción

### 1. Detección de Videos de YouTube

El frontend detecta automáticamente que un item es un video de YouTube si:
- El campo `diario_nombre` es `"YouTube"` (case-insensitive), O
- El campo `diario` es `"YouTube"`, O
- El `enlace` contiene `youtube.com` o `youtu.be`

```javascript
const isYouTubeItem = (item) => {
  if (!item) return false;
  const source = (item.diario_nombre || item.diario || '').toLowerCase();
  const url = item.enlace || '';
  return source === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be');
};
```

### 2. Extracción del Video ID

Se extrae el ID del video desde diferentes formatos de URL:
- `youtube.com/watch?v=VIDEO_ID`
- `youtu.be/VIDEO_ID`
- `youtube.com/embed/VIDEO_ID`
- `youtube.com/shorts/VIDEO_ID`

```javascript
const extractYouTubeId = (url) => {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};
```

### 3. Embed del Video

Una vez se hace clic en el botón de play, se crea un iframe:

```html
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&rel=0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

**Parámetros del embed:**
- `autoplay=1`: Inicia automáticamente
- `rel=0`: No muestra videos relacionados al final
- `allow="autoplay"`: Permite reproducción automática

## 🐛 Solución de Problemas

### Problema 1: Los videos no se reproducen

**Verificar:**
1. ¿El `diario_nombre` es exactamente `"YouTube"`?
   ```bash
   python fix_youtube_videos.py
   ```

2. ¿El `enlace` es válido y contiene `youtube.com`?
3. Abrir la consola del navegador (F12) y buscar errores

**Solución:**
- Ejecutar un nuevo scraping: el nuevo código ya guarda los datos correctamente

### Problema 2: Los video IDs son inválidos (videos MOCK)

**Causa:** El scraper está usando datos mock en lugar de datos reales.

**Solución:**
1. Verificar la variable de entorno `USE_SELENIUM`:
   ```bash
   # En backend/.env
   USE_SELENIUM=true
   ```

2. Asegurarse de que el RSS feed está activo para los canales configurados:
   ```bash
   python scraping/verificar_canales_youtube.py
   ```

3. Si un canal no tiene RSS, el scraper usará Selenium automáticamente

### Problema 3: No se encuentran canales

**Verificar canales configurados:**
```bash
python scraping/verificar_canales_youtube.py
```

**Actualizar IDs de canales:**
```bash
python scraping/obtener_ids_youtube.py
```

### Problema 4: Error de encoding en Windows

**Causa:** Emojis en la consola de Windows.

**Solución:** Los scripts ya incluyen:
```python
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
```

## 📊 Estructura de Datos

### Base de Datos (tabla `noticias`)

| Campo | Tipo | Ejemplo | Descripción |
|-------|------|---------|-------------|
| `id` | Integer | `8652` | ID único |
| `titulo` | String | `"Últimas noticias de..."` | Título del video |
| `contenido` | Text | `"Descripción del video..."` | Descripción |
| `enlace` | String | `"https://youtube.com/watch?v=..."` | URL del video |
| `imagen_url` | String | `"https://img.youtube.com/vi/.../hqdefault.jpg"` | Miniatura |
| `categoria` | String | `"Política"` | Categoría |
| `diario_id` | Integer | `8` | FK a `diarios` (YouTube) |
| `autor` | String | `"CNN en Español"` | Nombre del canal |
| `fecha_publicacion` | DateTime | `2025-11-07 00:00:00` | Fecha de publicación |
| `metadata` | JSON | `{"video_id": "...", ...}` | Metadata adicional |

### Respuesta del API

```json
{
  "id": 8652,
  "titulo": "Política: Últimas noticias según CNN",
  "contenido": "Video informativo con las últimas actualizaciones...",
  "enlace": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "imagen_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "categoria": "Política",
  "diario_nombre": "YouTube",
  "autor": "CNN en Español",
  "fecha_publicacion": "2025-11-07T00:00:00"
}
```

## ✅ Checklist de Verificación

- [x] Scrapers actualizados con `diario='YouTube'`
- [x] Scrapers guardan URLs completas de videos
- [x] Scrapers validan URLs antes de guardar
- [x] Endpoint `/scraping/social-media/youtube/ejecutar` creado
- [x] Frontend detecta videos de YouTube correctamente
- [x] Frontend muestra botón de play sobre miniaturas
- [x] Frontend embebe videos con iframe
- [x] Frontend permite cerrar el video
- [x] Botón exclusivo de YouTube en el frontend
- [x] Estilos CSS para el reproductor
- [x] Scripts de verificación y prueba
- [x] Canales de YouTube verificados
- [x] Documentación completa

## 🎉 Resultado Final

El usuario ahora puede:
1. ✅ Hacer clic en el botón "YouTube" para scrapear videos
2. ✅ Ver los videos con sus miniaturas
3. ✅ Hacer clic en el botón de play (▶) para reproducir
4. ✅ Ver el video directamente en la página (sin salir a YouTube)
5. ✅ Cerrar el video y volver a la vista de miniatura
6. ✅ Ver videos de múltiples canales (RPP, CNN, BBC, etc.)

Todo sin necesidad de descargar videos, usando el API oficial de YouTube a través del embed iframe.

## 📝 Notas Adicionales

- Los videos se reproducen usando el player oficial de YouTube
- No se requiere API key de YouTube (usamos el embed público)
- Los videos se reproducen con autoplay cuando se hace clic
- Se puede cerrar el video en cualquier momento
- La miniatura del video se obtiene automáticamente de YouTube
- El scraper soporta tanto RSS feeds como Selenium según disponibilidad

