# 📊 INFORME COMPLETO: SCRAPING DE NOTICIAS DE REDES SOCIALES

## 📋 Índice
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Fuentes de Datos](#fuentes-de-datos)
4. [Procedimiento de Scraping](#procedimiento-de-scraping)
5. [Uso de Selenium](#uso-de-selenium)
6. [Almacenamiento en Base de Datos](#almacenamiento-en-base-de-datos)
7. [Integración Frontend](#integración-frontend)
8. [Flujo Completo del Sistema](#flujo-completo-del-sistema)
9. [Configuración y Activación](#configuración-y-activación)
10. [Estructura de Datos](#estructura-de-datos)

---

## 1. Introducción

El sistema de scraping de redes sociales permite extraer noticias publicadas en plataformas como **Facebook**, **Twitter/X**, **Instagram** y **YouTube** de medios de comunicación peruanos. El sistema utiliza **Selenium** para realizar scraping real cuando está activado, o genera datos mock para pruebas rápidas cuando Selenium está desactivado.

### Objetivo
Extraer noticias actualizadas de redes sociales de medios peruanos y almacenarlas en una base de datos PostgreSQL para su visualización en una interfaz web React.

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  Componente: SocialMediaFeed.js                             │
│  - Visualiza noticias filtradas por red social              │
│  - Botón "Actualizar Noticias" ejecuta scraping             │
│  - Filtros por plataforma (Twitter, Facebook, Instagram,    │
│    YouTube)                                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP POST
                            │ /scraping/social-media/ejecutar
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│  Archivo: backend/main.py                                   │
│  Endpoint: /scraping/social-media/ejecutar                  │
│  - Recibe petición de scraping                              │
│  - Ejecuta ScrapingService.execute_social_scraping()        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              SCRAPING SERVICE                                │
│  Archivo: backend/scraping_service.py                       │
│  Clase: ScrapingService                                     │
│  Método: execute_social_scraping()                          │
│  - Llama a MainScraper.scrape_social_media()                │
│  - Guarda resultados en BD con save_news_to_database()      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              MAIN SCRAPER                                    │
│  Archivo: scraping/main_scraper.py                          │
│  Clase: MainScraper                                         │
│  Método: scrape_social_media()                              │
│  - Selecciona scrapers según USE_SELENIUM                   │
│  - Ejecuta cada scraper de redes sociales                   │
│  - Retorna lista unificada de noticias                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Scraper      │  │ Scraper      │  │ Scraper      │
│ Facebook     │  │ Twitter      │  │ Instagram    │
│ Selenium     │  │ Selenium     │  │ Selenium     │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                      │
│  Tablas:                                                     │
│  - diarios: Almacena información de cada red social         │
│  - noticias: Almacena todas las noticias extraídas          │
│  - Campos: id, titulo, contenido, enlace, imagen_url,       │
│    categoria, fecha_publicacion, diario_id, etc.            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Fuentes de Datos

### 3.1 Facebook
**Archivo**: `scraping/scraper_facebook_selenium.py`

**Páginas monitoreadas**:
- `elcomercio.pe` → **El Comercio**
- `CorreoPeru` → **Diario Correo**
- `cnn` → **CNN en Español**
- `elpopular.pe` → **El Popular**
- `larepublicape` → **La República**

**URLs base**: `https://www.facebook.com/{pagina}`

### 3.2 Twitter/X
**Archivo**: `scraping/scraper_twitter_selenium.py`

**Cuentas monitoreadas**:
- `elcomercio_peru` → @elcomercio_peru
- `DiarioCorreo` → @DiarioCorreo
- `rppnoticias` → @rppnoticias
- `Peru21` → @Peru21
- `cnnespanol` → @cnnespanol

**URLs base**: `https://twitter.com/{cuenta}`

### 3.3 Instagram
**Archivo**: `scraping/scraper_instagram_selenium.py`

**Cuentas monitoreadas**:
- `elcomercio.pe` → @elcomercio.pe
- `diariocorreo` → @diariocorreo
- `rppnoticias` → @rppnoticias
- `cnnespanol` → @cnnespanol

**URLs base**: `https://www.instagram.com/{cuenta}/`

**Nota**: Instagram requiere login, por lo que actualmente usa datos mock por defecto.

### 3.4 YouTube
**Archivo**: `scraping/scraper_youtube_selenium.py`

**Canales monitoreados** (usando IDs de canal verificados):
- `channel/UCyjzd3PHwG6TgCZCHHZWBYA` → **El Comercio**
- `channel/UCuRsgsgZXkgjhHhbKEwJ1_A` → **Diario Correo**
- `channel/UChOF38ucKKJm7BZqrB_55LA` → **RPP Noticias**
- `channel/UC4vzdGCAYyE4DLKJZQC3cZQ` → **Perú21**
- `channel/UCQi90C5nDOa5qe6OOmytdCA` → **CNN en Español**

**URLs base**: `https://www.youtube.com/{canal}/videos`

---

## 4. Procedimiento de Scraping

### 4.1 Flujo General

1. **Usuario hace clic en "Actualizar Noticias"** en el frontend
2. **Frontend envía POST** a `/scraping/social-media/ejecutar`
3. **Backend ejecuta** `ScrapingService.execute_social_scraping()`
4. **MainScraper** determina qué scrapers usar (Selenium o Mock)
5. **Cada scraper** extrae noticias de su plataforma
6. **Noticias se guardan** en base de datos con detección de duplicados
7. **Frontend recarga** y muestra las nuevas noticias

### 4.2 Proceso Detallado por Plataforma

#### 4.2.1 Facebook (Selenium)

**Método**: `_scrape_page_real(fb_page, max_posts=5)`

1. **Configuración del WebDriver**:
   ```python
   - Inicializa ChromeDriver
   - Configura opciones anti-detección
   - User-Agent personalizado
   - Desactiva características de automatización
   ```

2. **Navegación**:
   ```python
   - Abre URL: https://www.facebook.com/{pagina}
   - Espera hasta 20 segundos a que cargue contenido
   - Usa WebDriverWait con EC.presence_of_element_located
   - Selector principal: 'div[role="article"]'
   - Selector alternativo: '[data-pagelet]'
   ```

3. **Scroll para cargar más contenido**:
   ```python
   - Ejecuta scrollTo(0, document.body.scrollHeight / 2)
   - Espera 2 segundos
   - Ejecuta scrollBy(0, 1000)
   - Espera 2 segundos más
   ```

4. **Extracción de datos** (`_extract_post_data`):
   - **Texto del post**:
     - Busca `span[dir="auto"]` con texto > 20 caracteres
     - Alternativa: `div[data-testid]` con texto largo
   - **Imagen**:
     - Busca todas las `img` en el post
     - Filtra avatares, emojis y data URLs
     - Prefiere imágenes con `alt` text (contenido)
   - **Enlace**:
     - Busca `a[href*="/posts/"]`
     - Si no existe, usa URL de la página
   - **Clasificación de categoría**:
     - Analiza palabras clave en el texto
     - Categorías: Deportes, Economía, Política, Espectáculos, Tecnología, General

5. **Retorno de datos**:
   ```python
   {
       'titulo': texto[:200],
       'contenido': texto_completo,
       'enlace': url_del_post,
       'imagen_url': url_de_imagen,
       'categoria': categoria_detectada,
       'fecha_publicacion': datetime.now(timezone.utc),
       'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
       'diario': 'Facebook',
       'diario_nombre': nombre_del_diario,
       'autor': nombre_del_diario
   }
   ```

#### 4.2.2 Twitter (Selenium)

**Método**: `_scrape_account_real(account, max_tweets=10)`

1. **Navegación**:
   - Abre `https://twitter.com/{cuenta}`
   - Espera elementos `article` o `[data-testid="tweet"]`
   - Realiza **scroll múltiple** (3 iteraciones) para cargar más tweets recientes

2. **Extracción y filtros** (`_extract_tweet_data`):
   - **Detección de tweets fijados**: `_is_pinned_tweet()` omite cualquier tweet marcado como "Tweet fijado" o "Pinned Tweet" para priorizar contenido actual.
   - **Fecha real**: `_extract_tweet_date()` intenta tres estrategias (atributo `datetime`, texto relativo como "hace 2 horas" y análisis del HTML) para obtener la fecha exacta.
   - **Filtro de actualidad**: `_is_recent_tweet()` solo acepta publicaciones del **2025** o de los **últimos 30 días**. Tweets antiguos (ej. 2019, 2020) se descartan automáticamente.
   - **Texto**:
     - Busca `div[lang]` o `[data-testid="tweetText"]`
     - Requiere mínimo 20 caracteres para evitar tweets vacíos
   - **Imagen**:
     - Filtra imágenes de perfil y emojis
     - Selecciona imágenes de contenido cuando están disponibles
   - **Enlace**:
     - Busca `a[href*="/status/"]`
     - Construye URL completa del tweet

3. **Clasificación**:
   - Igual lógica que Facebook (palabras clave por categoría)
   - Registra logs informativos indicando si un tweet fue aceptado o filtrado por fecha

#### 4.2.3 YouTube (Selenium)

**Método**: `_scrape_channel_real(channel, max_videos=5)`

1. **Navegación**:
   - Abre `https://www.youtube.com/{canal}/videos`
   - Espera elementos `ytd-rich-item-renderer`
   - Scroll para cargar más videos

2. **Extracción** (`_extract_video_data`):
   - **Título**: `#video-title` (texto)
   - **Descripción**: `#metadata-line span` o fallback
   - **URL**: `href` de `#video-title`
   - **Thumbnail**: `src` de `img`, mejora calidad si es posible
   - **Clasificación**: Basada en título y descripción

#### 4.2.4 Instagram (Mock por defecto)

**Nota**: Instagram requiere autenticación, por lo que usa datos mock.

---

### 4.3 Modo Mock (Fallback)

Cuando Selenium no está activado o falla, cada scraper genera datos mock:

**Características**:
- Títulos variados por categoría
- Descripciones genéricas
- Imágenes de Picsum Photos con seeds únicos
- Enlaces a perfiles oficiales (no posts específicos)
- Fechas actuales

**Ejemplo Facebook Mock**:
```python
{
    'titulo': 'Política: Información política actual de último momento según El Comercio',
    'contenido': 'Desde El Comercio: Información política actual...',
    'enlace': 'https://www.facebook.com/elcomercio.pe',
    'imagen_url': 'https://picsum.photos/800/400?random={seed}',
    'categoria': 'Política',
    ...
}
```

---

## 5. Uso de Selenium

### 5.1 Configuración del WebDriver

Todos los scrapers Selenium comparten configuración similar:

```python
chrome_options = Options()
# chrome_options.add_argument('--headless')  # Opcional: modo sin ventana
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--disable-blink-features=AutomationControlled')
chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
chrome_options.add_experimental_option('useAutomationExtension', False)
chrome_options.add_argument('user-agent=Mozilla/5.0...')

driver = webdriver.Chrome(options=chrome_options)
```

### 5.2 Esperas Explícitas (WebDriverWait)

Para manejar contenido dinámico:

```python
wait = WebDriverWait(driver, 20)  # Timeout de 20 segundos
wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[role="article"]')))
```

### 5.3 Manejo de Errores

- **Try/Except** alrededor de cada operación
- **TimeoutException**: Si no carga el contenido en 20 segundos
- **NoSuchElementException**: Si no se encuentra un elemento específico
- **Fallback a Mock**: Si falla completamente

### 5.4 Activación de Selenium

**Variable de entorno**: `USE_SELENIUM`

**Valor**: `'true'` o `'True'` para activar

**Lugar de configuración**:
- Al iniciar el backend: `$env:USE_SELENIUM="true"; python main.py` (Windows PowerShell)
- Script: `start_backend_selenium.bat`
- Archivo `.env`: `USE_SELENIUM=true`

**Verificación en código**:
```python
use_selenium = HAS_SELENIUM_SCRAPERS and os.getenv('USE_SELENIUM', 'False').lower() == 'true'
```

---

## 6. Almacenamiento en Base de Datos

### 6.1 Tabla `diarios`

**Campos principales**:
- `id`: Primary key
- `nombre`: Nombre único (ej: "Facebook", "Twitter", "Instagram", "YouTube")
- `url`: URL base de la plataforma
- `activo`: Boolean

**Valores para redes sociales**:
- Facebook: `nombre = 'Facebook'`
- Twitter: `nombre = 'Twitter'`
- Instagram: `nombre = 'Instagram'`
- YouTube: `nombre = 'YouTube'`

### 6.2 Tabla `noticias`

**Campos principales**:
- `id`: Primary key (auto-increment)
- `titulo`: Título de la noticia (hasta 500 caracteres)
- `contenido`: Texto completo (TEXT)
- `enlace`: URL de la publicación original
- `imagen_url`: URL de la imagen
- `categoria`: Categoría (Política, Economía, Deportes, etc.)
- `fecha_publicacion`: Fecha de publicación original
- `fecha_extraccion`: Fecha en que se extrajo la noticia
- `diario_id`: Foreign key a `diarios.id`
- `autor`: Autor o nombre del medio

**Campos extendidos** (para detección de duplicados):
- `titulo_hash`: MD5 del título normalizado
- `contenido_hash`: MD5 del contenido normalizado
- `similarity_hash`: Hash para comparación de similitud

**Campos geográficos**:
- `geographic_type`: Tipo (internacional, nacional, regional, local)
- `geographic_confidence`: Confianza de clasificación (0-1)
- `geographic_keywords`: Palabras clave encontradas (JSON)

### 6.3 Proceso de Guardado

**Archivo**: `backend/scraping_service.py`
**Método**: `save_news_to_database_enhanced()`

**Pasos**:

1. **Buscar el diario**:
   ```python
   diario = db.query(Diario).filter(Diario.nombre == news_item['diario']).first()
   ```
   - Busca por nombre exacto ("Facebook", "Twitter", etc.)

2. **Procesar fecha de publicación**:
   ```python
   - Convierte a datetime si es string
   - Maneja diferentes formatos
   - Si falla, deja como None
   ```

3. **Detección de duplicados**:
   ```python
   duplicate_check = self.duplicate_detector.check_duplicate(
       db=db,
       titulo=news_item['titulo'],
       contenido=news_item.get('contenido', ''),
       enlace=news_item.get('enlace', ''),
       diario_id=diario.id
   )
   ```
   - Verifica si ya existe una noticia similar
   - Compara título, contenido y enlace
   - Si es duplicado, **NO se guarda**

4. **Generación de contenido** (si falta):
   ```python
   if not original_content or len(original_content) < 100:
       generated_content = generate_content_for_news(...)
       news_item['contenido'] = generated_content
   ```

5. **Clasificación geográfica**:
   ```python
   geographic_info = get_geographic_classification(
       title=news_item['titulo'],
       content=news_item.get('contenido', ''),
       category=news_item.get('categoria', '')
   )
   ```

6. **Crear registro**:
   ```python
   noticia = Noticia(
       titulo=enhanced_news['titulo'],
       contenido=enhanced_news.get('contenido', ''),
       enlace=enhanced_news.get('enlace', ''),
       imagen_url=enhanced_news.get('imagen_url', ''),
       categoria=enhanced_news['categoria'],
       fecha_publicacion=fecha_publicacion,
       fecha_extraccion=datetime.fromisoformat(enhanced_news['fecha_extraccion']),
       diario_id=diario.id,
       autor=enhanced_news.get('autor'),
       titulo_hash=enhanced_news.get('titulo_hash'),
       contenido_hash=enhanced_news.get('contenido_hash'),
       similarity_hash=enhanced_news.get('similarity_hash'),
       geographic_type=enhanced_news.get('geographic_type', 'nacional'),
       geographic_confidence=enhanced_news.get('geographic_confidence', 0.5),
       geographic_keywords=enhanced_news.get('geographic_keywords', {})
   )
   ```

7. **Guardar y verificar alertas**:
   ```python
   db.add(noticia)
   db.flush()  # Obtener ID
   alert_result = self.alert_system.process_news_alerts(db, noticia)
   db.commit()
   ```

### 6.4 ID de Noticia

El ID se genera automáticamente por PostgreSQL:
- Tipo: `Integer` con `primary_key=True` y `index=True`
- Valor: Auto-incremental (1, 2, 3, ...)
- Uso: Identificador único para cada noticia en la base de datos

**Cómo se asigna**:
```python
db.add(noticia)
db.flush()  # Guarda en BD sin commit, pero obtiene el ID
noticia.id  # Ahora contiene el ID asignado
db.commit()  # Confirma el guardado
```

---

## 7. Integración Frontend

### 7.1 Componente React

**Archivo**: `frontend/src/components/SocialMediaFeed.js`

**Funcionalidades**:
- Visualización de noticias filtradas por red social
- Contador de noticias por plataforma
- Botón "Actualizar Noticias" que ejecuta scraping
- Filtros individuales por plataforma (Twitter, Facebook, Instagram, YouTube)
- Cards visuales con imagen, título, categoría y fecha

### 7.2 Endpoints Utilizados

#### GET `/social-media`
**Propósito**: Obtener noticias de redes sociales ya guardadas

**Parámetros**:
- `categoria` (opcional): Filtrar por categoría
- `diario` (opcional): Filtrar por plataforma (Twitter, Facebook, etc.)
- `limit`: Límite de resultados (default: 100)
- `offset`: Desplazamiento para paginación (default: 0)

**Respuesta**:
```json
[
  {
    "id": 123,
    "titulo": "Título de la noticia",
    "contenido": "Contenido completo...",
    "enlace": "https://...",
    "imagen_url": "https://...",
    "categoria": "Política",
    "fecha_publicacion": "2025-01-15T10:30:00",
    "fecha_extraccion": "2025-01-15T11:00:00",
    "diario_id": 5,
    "diario_nombre": "Twitter"
  },
  ...
]
```

#### POST `/scraping/social-media/ejecutar`
**Propósito**: Ejecutar scraping de redes sociales

**Respuesta**:
```json
{
  "success": true,
  "total_extracted": 28,
  "total_saved": 9,
  "duplicates_detected": 19,
  "alerts_triggered": 0,
  "duration_seconds": 45,
  "error": null,
  "errors": []
}
```

### 7.3 Flujo en Frontend

1. **Carga inicial**:
   ```javascript
   useEffect(() => {
     fetchSocialNews();  // GET /social-media
     fetchAllNewsForCounts();  // Para contadores
   }, []);
   ```

2. **Actualizar noticias**:
   ```javascript
   const handleRefresh = async () => {
     setScraping(true);
     // POST /scraping/social-media/ejecutar
     const scrapResponse = await axios.post('http://localhost:8000/scraping/social-media/ejecutar');
     // Esperar 2 segundos
     setTimeout(() => {
       fetchSocialNews();  // Recargar noticias
       fetchAllNewsForCounts();  // Actualizar contadores
       setScraping(false);
     }, 2000);
   };
   ```

3. **Filtrado**:
   ```javascript
   const filteredNews = socialNews.filter(item => {
     if (activeFilter === 'all') return true;
     return item.diario_nombre === activeFilter;
   });
   ```

4. **Visualización**:
   - Cards con imagen, categoría, título, fecha
   - Badge de plataforma (Twitter, Facebook, Instagram, YouTube)
   - Click en card abre enlace en nueva pestaña

---

## 8. Flujo Completo del Sistema

### Diagrama de Secuencia

```
Usuario (Frontend)          Backend API         ScrapingService    MainScraper    Scrapers Selenium    Base de Datos
     │                           │                     │                │                 │                   │
     │  Click "Actualizar"       │                     │                │                 │                   │
     │──────────────────────────>│                     │                │                 │                   │
     │                           │  execute_social_    │                │                 │                   │
     │                           │  scraping()         │                │                 │                   │
     │                           │────────────────────>│                │                 │                   │
     │                           │                     │ scrape_social_ │                 │                   │
     │                           │                     │ media()        │                 │                   │
     │                           │                     │───────────────>│                 │                   │
     │                           │                     │                │ get_all_news()  │                   │
     │                           │                     │                │────────────────>│                   │
     │                           │                     │                │                 │ Setup WebDriver   │
     │                           │                     │                │                 │────┐              │
     │                           │                     │                │                 │<───┘              │
     │                           │                     │                │                 │ Navegar a URL     │
     │                           │                     │                │                 │────┐              │
     │                           │                     │                │                 │<───┘              │
     │                           │                     │                │                 │ Extraer datos     │
     │                           │                     │                │                 │────┐              │
     │                           │                     │                │                 │<───┘              │
     │                           │                     │                │<─────────────────│                 │
     │                           │                     │                │ [lista noticias] │                 │
     │                           │                     │<───────────────│                 │                   │
     │                           │                     │ save_news_to_  │                 │                   │
     │                           │                     │ database()     │                 │                   │
     │                           │                     │──────────────────────────────────────────────────────>│
     │                           │                     │                │                 │                   │ INSERT
     │                           │                     │<──────────────────────────────────────────────────────│
     │                           │<────────────────────│                │                 │                   │
     │<──────────────────────────│                     │                │                 │                   │
     │ {success: true, ...}      │                     │                │                 │                   │
     │                           │                     │                │                 │                   │
     │ GET /social-media         │                     │                │                 │                   │
     │──────────────────────────>│                     │                │                 │                   │
     │                           │                     │                │                 │                   │
     │                           │                     │                │                 │ SELECT * FROM     │
     │                           │                     │                │                 │ noticias WHERE... │
     │                           │                     │                │                 │<──────────────────│
     │<──────────────────────────│                     │                │                 │                   │
     │ [lista noticias]          │                     │                │                 │                   │
     │                           │                     │                │                 │                   │
     │ Renderiza cards           │                     │                │                 │                   │
```

### Paso a Paso Detallado

1. **Usuario hace clic en "Actualizar Noticias"**
   - Frontend muestra indicador de carga
   - Se desactiva el botón temporalmente

2. **Frontend envía POST a `/scraping/social-media/ejecutar`**
   - Usa `axios.post()` desde React
   - No requiere autenticación (endpoint público)

3. **Backend recibe la petición**
   - `main.py` ejecuta `ejecutar_social_scraping()`
   - Crea instancia de `ScrapingService`

4. **ScrapingService ejecuta scraping**
   - Llama a `self.main_scraper.scrape_social_media()`
   - Registra tiempo de inicio

5. **MainScraper selecciona scrapers**
   - Verifica `USE_SELENIUM` environment variable
   - Si `True`: Usa scrapers Selenium
   - Si `False`: Usa scrapers Mock

6. **Cada scraper ejecuta su lógica**
   - **Selenium**: Abre navegador, navega, extrae datos
   - **Mock**: Genera datos de prueba

7. **Resultados se consolidan**
   - `MainScraper` retorna lista unificada de noticias
   - Formato estándar para todas las plataformas

8. **Guardado en base de datos**
   - Para cada noticia:
     - Busca diario en BD
     - Verifica duplicados
     - Genera contenido si falta
     - Clasifica geográficamente
     - Crea registro `Noticia`
     - Guarda con commit

9. **Respuesta al frontend**
   - Retorna JSON con estadísticas:
     - `total_extracted`: Noticias extraídas
     - `total_saved`: Noticias guardadas (sin duplicados)
     - `duplicates_detected`: Duplicados filtrados
     - `duration_seconds`: Tiempo total

10. **Frontend recarga noticias**
    - Espera 2 segundos
    - Hace GET a `/social-media`
    - Actualiza contadores
    - Renderiza nuevas noticias

---

## 9. Configuración y Activación

### 9.1 Activación de Selenium

#### Opción 1: Script Batch (Windows)
**Archivo**: `start_backend_selenium.bat`
```batch
@echo off
cd backend
set USE_SELENIUM=true
python main.py
```

#### Opción 2: PowerShell
```powershell
cd backend
$env:USE_SELENIUM="true"
python main.py
```

#### Opción 3: Variables de entorno del sistema
- Windows: Panel de Control → Sistema → Variables de entorno
- Agregar: `USE_SELENIUM=true`

#### Opción 4: Archivo `.env` (no implementado actualmente)
```env
USE_SELENIUM=true
```

### 9.2 Verificación de Activación

**En logs del backend**:
```
🚀 SELENIUM ACTIVADO - Usando scraping REAL de redes sociales
🚀 Usando Selenium para scraping REAL de redes sociales
```

**Si no está activado**:
```
📦 Usando scrapers MOCK para redes sociales (configura USE_SELENIUM=true para usar Selenium)
```

### 9.3 Requisitos para Selenium

1. **Chrome instalado** en el sistema
2. **ChromeDriver** instalado y en PATH
3. **Selenium** instalado: `pip install selenium`
4. **Permisos** de escritura para logs temporales

---

## 10. Estructura de Datos

### 10.1 Formato de Noticia en Scrapers

Todos los scrapers retornan el mismo formato:

```python
{
    'titulo': str,              # Título o texto principal (hasta 200 chars)
    'contenido': str,           # Contenido completo del post/tweet/video
    'enlace': str,              # URL de la publicación original
    'imagen_url': str,          # URL de la imagen/thumbnail
    'categoria': str,           # Política, Economía, Deportes, etc.
    'fecha_publicacion': datetime,  # Fecha de publicación (UTC)
    'fecha_extraccion': str,    # ISO format de fecha de extracción
    'diario': str,              # 'Facebook', 'Twitter', 'Instagram', 'YouTube'
    'diario_nombre': str,       # Nombre del medio (ej: 'El Comercio')
    'autor': str                # Autor o nombre del medio
}
```

### 10.2 Mapeo de Plataformas a Diarios

**Facebook**:
- `diario`: `'Facebook'`
- `diario_nombre`: `'El Comercio'`, `'Diario Correo'`, etc.

**Twitter**:
- `diario`: `'Twitter'`
- `diario_nombre`: `'Twitter'`
- `autor`: `'@elcomercio_peru'`, etc.

**Instagram**:
- `diario`: `'Instagram'`
- `diario_nombre`: `'Instagram'`
- `autor`: `'@elcomercio.pe'`, etc.

**YouTube**:
- `diario`: `'YouTube'`
- `diario_nombre`: `'El Comercio'`, `'Diario Correo'`, etc.
- `autor`: Nombre del canal

### 10.3 Clasificación de Categorías

**Palabras clave detectadas**:

- **Deportes**: `'deporte', 'futbol', 'selección', 'gol', 'liga', 'atleta'`
- **Economía**: `'económ', 'dólar', 'inflación', 'mercado', 'negocio'`
- **Política**: `'polític', 'congreso', 'presidente', 'gobierno'`
- **Espectáculos**: `'actor', 'actriz', 'música', 'película', 'celebrity', 'entretenimiento'`
- **Tecnología**: `'tecnolog', 'digital', 'app', 'tech', 'smartphone'`
- **Internacional**: `'internacional', 'mundo', 'foreign', 'global'`
- **General**: Si no coincide con ninguna

---

## 11. Logs y Debugging

### 11.1 Logs del Backend

**Nivel**: `INFO` por defecto

**Ejemplos**:
```
🌐 Iniciando scraping de redes sociales con Playwright...
🚀 Usando Selenium para scraping REAL de redes sociales
🔍 Scrapeando El Comercio...
📄 Accediendo a https://www.facebook.com/elcomercio.pe
✅ Posts detectados usando CSS selector 'div[role="article"]'
📊 Encontrados 15 elementos de post
✅ Post 1: Información política actual de último momento según...
✅ 3 posts reales obtenidos de El Comercio
📊 Total extraído de scrapers: 28
✅ Scraping de redes sociales completado: 9 noticias guardadas, 19 duplicados detectados
```

### 11.2 Logs del Frontend

**Consola del navegador** (F12 → Console):
```javascript
Scraping completado: {success: true, total_extracted: 28, ...}
Error fetching social news: ...
```

### 11.3 Errores Comunes

1. **ChromeDriver no encontrado**:
   ```
   ❌ Error inicializando ChromeDriver: 'chromedriver' executable needs to be in PATH
   ```
   **Solución**: Instalar ChromeDriver y agregarlo al PATH

2. **Timeout esperando contenido**:
   ```
   ⏱️ Timeout esperando contenido de elcomercio.pe
   ```
   **Solución**: La página tardó más de 20 segundos. Verificar conexión o aumentar timeout.

3. **Diario no encontrado en BD**:
   ```
   Diario no encontrado: Facebook
   ```
   **Solución**: Ejecutar `init_diarios()` para crear registros de diarios.

---

## 12. Rendimiento y Optimizaciones

### 12.1 Tiempos Estimados

**Modo Mock**:
- Duración total: **< 1 segundo**
- Por scraper: **~0.1 segundos**

**Modo Selenium**:
- Facebook: **~10-15 segundos** por página (5 páginas = ~60-75s)
- Twitter: **~10-15 segundos** por cuenta (5 cuentas = ~60-75s)
- YouTube: **~10-15 segundos** por canal (5 canales = ~60-75s)
- Instagram: **~2 segundos** (mock)
- **Total**: **~3-4 minutos** para todas las plataformas

### 12.2 Optimizaciones Implementadas

1. **Filtro de actualidad en Twitter**: Solo guarda tweets recientes (2025 o últimos 30 días) y omite contenido fijado antiguo.
2. **Paralelización**: No implementada (secuencial)
3. **Headless mode**: Opcional (comentado en código)
4. **Cache de imágenes**: No implementado
5. **Detección de duplicados**: Evita guardar noticias repetidas
6. **Paginación en frontend**: Límite de 100 noticias por defecto

### 12.3 Limitaciones

- **Rate limiting**: No implementado explícitamente (pausas de 2-3 segundos entre requests)
- **Bloqueos**: Facebook/Twitter pueden bloquear si se hacen demasiadas peticiones
- **Cambios de HTML**: Selectores CSS pueden romperse si cambia la estructura

---

## 13. Conclusiones

El sistema de scraping de redes sociales es una solución completa que:

1. ✅ **Extrae noticias reales** usando Selenium cuando está activado
2. ✅ **Genera datos mock** cuando Selenium no está disponible
3. ✅ **Almacena en base de datos** con detección de duplicados
4. ✅ **Visualiza en interfaz web** con filtros por plataforma
5. ✅ **Maneja errores** robustamente con fallbacks
6. ✅ **Clasifica automáticamente** por categoría y geografía
7. ✅ **Logs detallados** para debugging

**Mejoras futuras posibles**:
- Implementar autenticación para Instagram
- Paralelizar scraping de múltiples plataformas
- Agregar más plataformas (LinkedIn, TikTok)
- Implementar cache de resultados
- Agregar sistema de notificaciones push

---

**Fecha de creación**: Enero 2025 (Actualizado octubre 2025 con filtros de fecha para Twitter)
**Versión**: 1.1
**Autor**: Sistema de Scraping de Noticias
