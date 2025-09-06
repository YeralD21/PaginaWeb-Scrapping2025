#  Sistema de Scraping de Diarios Peruanos

##  Descripción

Plataforma web completa para la extracción, almacenamiento y visualización de noticias de tres diarios peruanos mediante técnicas de web scraping. El sistema incluye automatización, API REST y una interfaz web moderna.

##  Diarios Objetivo

| Diario | URL | Categorías |
|--------|-----|------------|
| Diario Correo | https://diariocorreo.pe | Deportes, Economía, Espectáculos |
| El Comercio | https://elcomercio.pe | Deportes, Economía |
| El Popular | https://elpopular.pe | Deportes, Espectáculos |

##  Arquitectura

`
        
   Web Scraping         Backend API          Frontend      
   (Python)         (FastAPI)        (React)       
        ─
                                
                                
    
   Scheduler            PostgreSQL    
   (Automático)         (Base Datos)  
    
`

##  Características

-  **Web Scraping Automatizado**: Extracción de noticias de 3 diarios peruanos
-  **API REST Completa**: Endpoints para noticias, comparativas y estadísticas
-  **Frontend Moderno**: Interfaz React con diseño responsivo
-  **Base de Datos PostgreSQL**: Almacenamiento estructurado de noticias
-  **Scheduler Automático**: Actualización cada 12 horas
-  **Filtros Avanzados**: Por categoría, diario y fecha
-  **Comparativa de Diarios**: Estadísticas por categoría
-  **Validación de Duplicados**: Evita noticias repetidas

##  Estructura del Proyecto

`
PaginaWeb-Scrapping2025/
 scraping/                 # Módulos de web scraping
    scraper_correo.py    # Scraper para Diario Correo
    scraper_comercio.py  # Scraper para El Comercio
    scraper_popular.py   # Scraper para El Popular
    main_scraper.py      # Coordinador principal
 backend/                  # API FastAPI
    main.py              # Aplicación principal
    models.py            # Modelos de base de datos
    database.py          # Configuración de BD
    scraping_service.py  # Servicio de scraping
 frontend/                 # Aplicación React
    src/
       App.js           # Componente principal
       index.js         # Punto de entrada
    public/
       index.html       # HTML base
    package.json         # Dependencias Node.js
 scheduler/                # Automatización
    cron_job.py          # Scheduler principal
 docs/                     # Documentación
    manual_despliegue.md # Manual completo
 requirements.txt          # Dependencias Python
 .env.example             # Variables de entorno
 README.md                # Este archivo
`

##  Tecnologías Utilizadas

### Backend
- **Python 3.8+**
- **FastAPI** - Framework web moderno
- **SQLAlchemy** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **BeautifulSoup** - Parsing HTML
- **Requests** - Cliente HTTP

### Frontend
- **React 18** - Biblioteca de UI
- **Styled Components** - CSS-in-JS
- **Axios** - Cliente HTTP
- **React Icons** - Iconografía

### Scraping
- **BeautifulSoup** - Parsing HTML
- **LXML** - Parser XML/HTML rápido
- **Requests** - Cliente HTTP
- **Schedule** - Programación de tareas

##  Instalación Rápida

### 1. Prerrequisitos
`ash
# Instalar Python 3.8+
# Instalar Node.js 16+
# Instalar PostgreSQL 12+
`

### 2. Clonar y Configurar
`ash
git clone <url-del-repositorio>
cd PaginaWeb-Scrapping2025

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Instalar dependencias Python
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
pip install -r requirements.txt

# Instalar dependencias Node.js
cd frontend
npm install
cd ..
`

### 3. Configurar Base de Datos
`sql
-- Crear base de datos
CREATE DATABASE diarios_scraping;
`

### 4. Ejecutar Sistema
`ash
# Terminal 1: Backend
cd backend
python main.py

# Terminal 2: Frontend
cd frontend
npm start

# Terminal 3: Scheduler (opcional)
cd scheduler
python cron_job.py
`

##  API Endpoints

### Noticias
- GET /noticias - Obtener todas las noticias
- GET /noticias?categoria=Deportes - Filtrar por categoría
- GET /noticias?diario=El Comercio - Filtrar por diario
- GET /noticias/{id} - Obtener noticia específica

### Comparativa
- GET /comparativa - Estadísticas por diario y categoría

### Diarios
- GET /diarios - Lista de diarios
- GET /categorias - Categorías disponibles

### Estadísticas
- GET /estadisticas - Estadísticas generales del sistema

##  Características del Frontend

- **Diseño Responsivo**: Adaptable a móviles y desktop
- **Filtros Dinámicos**: Por categoría y diario
- **Comparativa Visual**: Tabla de estadísticas
- **Actualización en Tiempo Real**: Botón de refresh
- **Interfaz Moderna**: Diseño con gradientes y sombras

##  Automatización

El sistema incluye un scheduler que:
- Ejecuta scraping cada 12 horas (configurable)
- Guarda noticias en base de datos
- Registra estadísticas de ejecución
- Maneja errores y reintentos
- Genera logs detallados

##  Monitoreo

### Logs Disponibles
- **Backend**: Logs en consola y archivo
- **Scheduler**: scheduler.log
- **Frontend**: Logs en consola del navegador

### Métricas
- Cantidad de noticias extraídas
- Tiempo de ejecución
- Errores de scraping
- Estadísticas por diario/categoría

##  Configuración Avanzada

### Variables de Entorno
`env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=diarios_scraping
DB_USER=postgres
DB_PASSWORD=tu_password

# Backend
BACKEND_HOST=localhost
BACKEND_PORT=8000

# Frontend
FRONTEND_PORT=3000

# Scheduler
SCHEDULE_INTERVAL_HOURS=12
`

### Personalización de Scraping
- Modificar selectores CSS en scrapers
- Ajustar intervalos de scraping
- Agregar nuevos diarios
- Implementar nuevas categorías

##  Pruebas

### Prueba Manual de Scraping
`ash
cd scraping
python main_scraper.py
`

### Prueba de API
`ash
curl http://localhost:8000/noticias?limit=5
`

### Prueba de Frontend
- Abrir http://localhost:3000
- Verificar carga de noticias
- Probar filtros
- Verificar comparativa

##  Documentación

- **Manual Completo**: docs/manual_despliegue.md
- **API Docs**: http://localhost:8000/docs (cuando el backend esté corriendo)
- **Código**: Comentarios detallados en todos los archivos

##  Contribución

1. Fork el proyecto
2. Crear rama para feature (git checkout -b feature/nueva-funcionalidad)
3. Commit cambios (git commit -m 'Agregar nueva funcionalidad')
4. Push a la rama (git push origin feature/nueva-funcionalidad)
5. Abrir Pull Request

##  Licencia

Este proyecto está bajo la Licencia MIT. Ver LICENSE para más detalles.

##  Soporte

Para soporte técnico:
1. Revisar documentación en docs/
2. Verificar logs del sistema
3. Crear issue en el repositorio

##  Roadmap

### Próximas Características
- [ ] Autenticación de usuarios
- [ ] Notificaciones push
- [ ] Exportación de datos
- [ ] Dashboard de administración
- [ ] API de búsqueda avanzada
- [ ] Integración con redes sociales

---

**Desarrollado con  para el análisis de noticias peruanas**
