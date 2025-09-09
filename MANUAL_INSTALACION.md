# Manual de Instalación y Configuración
## Sistema de Scraping de Diarios Peruanos

---

## 📋 Tabla de Contenidos

1. [Descripción del Sistema](#descripción-del-sistema)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Instalación de Prerrequisitos](#instalación-de-prerrequisitos)
4. [Configuración del Proyecto](#configuración-del-proyecto)
5. [Configuración de Base de Datos](#configuración-de-base-de-datos)
6. [Instalación de Dependencias](#instalación-de-dependencias)
7. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
8. [Ejecución del Sistema](#ejecución-del-sistema)
9. [Verificación de Funcionamiento](#verificación-de-funcionamiento)
10. [Solución de Problemas](#solución-de-problemas)
11. [Despliegue en Otra PC](#despliegue-en-otra-pc)
12. [Comandos Útiles](#comandos-útiles)

---

## 🎯 Descripción del Sistema

Este sistema es una plataforma web completa para la extracción, almacenamiento y visualización de noticias de tres diarios peruanos mediante técnicas de web scraping. Incluye:

- **Backend**: API REST con FastAPI
- **Frontend**: Interfaz web moderna con React
- **Base de Datos**: PostgreSQL para almacenamiento
- **Scraping**: Extracción automática de noticias
- **Scheduler**: Actualización automática cada 12 horas

### Diarios Objetivo
- **Diario Correo** (https://diariocorreo.pe)
- **El Comercio** (https://elcomercio.pe)
- **El Popular** (https://elpopular.pe)

---

## 💻 Requisitos del Sistema

### Software Requerido
- **Python 3.8 o superior**
- **Node.js 16 o superior**
- **PostgreSQL 12 o superior**
- **Git** (para clonar el repositorio)

### Hardware Mínimo
- **RAM**: 4GB mínimo, 8GB recomendado
- **Almacenamiento**: 2GB libres
- **Procesador**: Dual-core 2.0GHz mínimo

### Sistema Operativo
- Windows 10/11
- macOS 10.15+
- Ubuntu 18.04+ / Linux Mint 19+

---

## 🔧 Instalación de Prerrequisitos

### 1. Instalar Python

#### Windows:
1. Descargar Python desde [python.org](https://www.python.org/downloads/)
2. **IMPORTANTE**: Marcar "Add Python to PATH" durante la instalación
3. Verificar instalación:
```bash
python --version
pip --version
```

#### macOS:
```bash
# Usando Homebrew
brew install python

# Verificar instalación
python3 --version
pip3 --version
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv

# Verificar instalación
python3 --version
pip3 --version
```

### 2. Instalar Node.js

#### Windows/macOS:
1. Descargar desde [nodejs.org](https://nodejs.org/)
2. Instalar la versión LTS (Long Term Support)
3. Verificar instalación:
```bash
node --version
npm --version
```

#### Linux (Ubuntu/Debian):
```bash
# Instalar Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 3. Instalar PostgreSQL

#### Windows:
1. Descargar desde [postgresql.org](https://www.postgresql.org/download/windows/)
2. Instalar con configuración por defecto
3. **Recordar la contraseña del usuario postgres**

#### macOS:
```bash
# Usando Homebrew
brew install postgresql
brew services start postgresql

# Crear usuario postgres
createuser -s postgres
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar usuario postgres
sudo -u postgres psql
ALTER USER postgres PASSWORD 'tu_password_aqui';
\q
```

---

## 📁 Configuración del Proyecto

### 1. Clonar el Repositorio
```bash
# Clonar el proyecto
git clone [URL_DEL_REPOSITORIO]
cd PaginaWeb-Scrapping2025

# O si tienes el proyecto en ZIP, extraerlo y navegar a la carpeta
```

### 2. Estructura del Proyecto
```
PaginaWeb-Scrapping2025/
├── backend/                 # API FastAPI
├── frontend/               # Aplicación React
├── scraping/               # Módulos de web scraping
├── scheduler/              # Automatización
├── requirements.txt        # Dependencias Python
├── .env.example           # Variables de entorno (ejemplo)
└── README.md              # Documentación
```

---

## 🗄️ Configuración de Base de Datos

### 1. Crear Base de Datos
```sql
-- Conectar a PostgreSQL
psql -U postgres

-- Crear base de datos
CREATE DATABASE diarios_scraping;

-- Verificar creación
\l

-- Salir
\q
```

### 2. Configurar Usuario (Opcional)
```sql
-- Crear usuario específico (opcional)
CREATE USER scraping_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE diarios_scraping TO scraping_user;
```

---

## 📦 Instalación de Dependencias

### 1. Configurar Entorno Virtual Python
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Verificar activación (debe mostrar (venv) al inicio)
```

### 2. Instalar Dependencias Python
```bash
# Instalar dependencias del backend
pip install -r requirements.txt

# Verificar instalación
pip list
```

### 3. Instalar Dependencias Node.js
```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Verificar instalación
npm list

# Volver al directorio raíz
cd ..
```

---

## ⚙️ Configuración de Variables de Entorno

### 1. Crear Archivo .env
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus configuraciones
```

### 2. Configurar Variables
```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=diarios_scraping
DB_USER=postgres
DB_PASSWORD=tu_password_postgres

# Backend
BACKEND_HOST=localhost
BACKEND_PORT=8000

# Frontend
FRONTEND_PORT=3000

# Scheduler
SCHEDULE_INTERVAL_HOURS=12
```

**⚠️ IMPORTANTE**: Reemplazar `tu_password_postgres` con la contraseña real de PostgreSQL.

---

## 🚀 Ejecución del Sistema

### Opción 1: Ejecución Manual (Desarrollo)

#### Terminal 1 - Backend:
```bash
# Activar entorno virtual
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Navegar al backend
cd backend

# Ejecutar servidor
python main.py
```

#### Terminal 2 - Frontend:
```bash
# Navegar al frontend
cd frontend

# Ejecutar aplicación React
npm start
```

#### Terminal 3 - Scheduler (Opcional):
```bash
# Activar entorno virtual
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Navegar al scheduler
cd scheduler

# Ejecutar scheduler
python cron_job.py
```

### Opción 2: Ejecución Automática
```bash
# Script para iniciar todo el sistema
python start_system.py
```

---

## 🔄 Comandos de Ejecución Detallados

### 1. Ejecutar Scraping Manual

#### Scraping Individual por Diario:
```bash
# Activar entorno virtual
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Scraping de Diario Correo
cd scraping
python scraper_correo.py

# Scraping de El Comercio
python scraper_comercio.py

# Scraping de El Popular
python scraper_popular.py
```

#### Scraping Completo (Todos los Diarios):
```bash
# Activar entorno virtual
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Ejecutar scraping de todos los diarios
cd scraping
python main_scraper.py
```

#### Scraping con Logs Detallados:
```bash
# Scraping con información detallada
python main_scraper.py --verbose

# Scraping con logs en archivo
python main_scraper.py > scraping_log.txt 2>&1
```

### 2. Ejecutar Backend (API)

#### Inicio Básico:
```bash
# Activar entorno virtual
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Navegar al backend
cd backend

# Ejecutar servidor
python main.py
```

#### Inicio con Configuración Personalizada:
```bash
# Ejecutar en puerto específico
python main.py --port 8001

# Ejecutar con logs detallados
python main.py --log-level debug

# Ejecutar en modo desarrollo
python main.py --reload
```

#### Inicio con Uvicorn (Alternativo):
```bash
# Usando uvicorn directamente
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Con configuración específica
uvicorn main:app --host localhost --port 8000 --workers 4
```

### 3. Ejecutar Frontend (React)

#### Inicio Básico:
```bash
# Navegar al frontend
cd frontend

# Ejecutar aplicación
npm start
```

#### Inicio con Configuración Personalizada:
```bash
# Ejecutar en puerto específico
PORT=3001 npm start

# Ejecutar con variables de entorno
REACT_APP_API_URL=http://localhost:8001 npm start

# Ejecutar en modo producción
npm run build
npm run serve
```

#### Comandos de Desarrollo:
```bash
# Instalar dependencias
npm install

# Actualizar dependencias
npm update

# Limpiar cache
npm cache clean --force

# Verificar dependencias
npm audit
npm audit fix
```

### 4. Ejecutar Scheduler (Automatización)

#### Scheduler Básico:
```bash
# Activar entorno virtual
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Navegar al scheduler
cd scheduler

# Ejecutar scheduler
python cron_job.py
```

#### Scheduler con Configuración:
```bash
# Scheduler con intervalo personalizado
python cron_job.py --interval 6  # Cada 6 horas

# Scheduler con logs
python cron_job.py --log-file scheduler.log

# Scheduler en segundo plano (Linux/macOS)
nohup python cron_job.py > scheduler.log 2>&1 &
```

### 5. Scripts de Inicio Automático

#### Inicio Completo del Sistema:
```bash
# Activar entorno virtual
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Ejecutar script de inicio completo
python start_system.py
```

#### Inicio con Scraping Inicial:
```bash
# Ejecutar scraping inicial y luego iniciar sistema
python start_auto_system.py
```

### 6. Comandos de Verificación

#### Verificar Estado del Backend:
```bash
# Verificar si el backend está ejecutándose
curl http://localhost:8000

# Verificar endpoints específicos
curl http://localhost:8000/noticias/ultima-actualizacion
curl http://localhost:8000/categorias-disponibles
```

#### Verificar Estado del Frontend:
```bash
# Verificar si el frontend está ejecutándose
curl http://localhost:3000

# Verificar en navegador
# Abrir: http://localhost:3000
```

#### Verificar Base de Datos:
```bash
# Conectar a PostgreSQL
psql -U postgres -d diarios_scraping

# Verificar noticias
SELECT COUNT(*) FROM noticias;
SELECT * FROM noticias ORDER BY fecha_extraccion DESC LIMIT 5;

# Salir
\q
```

### 7. Comandos de Mantenimiento

#### Limpiar Cache y Logs:
```bash
# Limpiar logs del scheduler
del scheduler.log  # Windows
rm scheduler.log  # macOS/Linux

# Limpiar cache de Node.js
cd frontend
npm cache clean --force

# Limpiar cache de Python
pip cache purge
```

#### Reiniciar Servicios:
```bash
# Detener procesos (Ctrl+C en cada terminal)
# Luego reiniciar siguiendo los pasos de ejecución

# O usar comandos del sistema:
# Windows:
taskkill /f /im python.exe
taskkill /f /im node.exe

# macOS/Linux:
pkill -f python
pkill -f node
```

### 8. Comandos de Debug

#### Debug del Scraping:
```bash
# Scraping con debug
cd scraping
python main_scraper.py --debug

# Ver logs en tiempo real
tail -f scraping.log  # macOS/Linux
```

#### Debug del Backend:
```bash
# Backend con logs detallados
cd backend
python main.py --log-level debug

# Ver logs de la API
tail -f api.log  # macOS/Linux
```

#### Debug del Frontend:
```bash
# Frontend con logs detallados
cd frontend
npm start -- --verbose

# Ver logs en consola del navegador (F12)
```

---

## ✅ Verificación de Funcionamiento

### 1. Verificar Backend
- Abrir navegador en: `http://localhost:8000`
- Debe mostrar: `{"message": "API de Scraping de Diarios Peruanos", "version": "1.0.0"}`
- Documentación API: `http://localhost:8000/docs`

### 2. Verificar Frontend
- Abrir navegador en: `http://localhost:3000`
- Debe mostrar la interfaz principal del sistema
- Verificar que carguen las noticias

### 3. Verificar Base de Datos
```bash
# Conectar a PostgreSQL
psql -U postgres -d diarios_scraping

# Verificar tablas
\dt

# Verificar datos
SELECT COUNT(*) FROM noticias;
SELECT COUNT(*) FROM diarios;

# Salir
\q
```

### 4. Probar Scraping Manual
```bash
# Activar entorno virtual
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Ejecutar scraping manual
cd scraping
python main_scraper.py
```

---

## 🔧 Solución de Problemas

### Error: "react-scripts no se reconoce"
```bash
cd frontend
npm install
npm start
```

### Error: "No se pudo conectar a la base de datos"
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar credenciales en archivo `.env`
3. Verificar que la base de datos existe

### Error: "Module not found"
```bash
# Reinstalar dependencias Python
pip install -r requirements.txt

# Reinstalar dependencias Node.js
cd frontend
npm install
```

### Error: "Port already in use"
```bash
# Cambiar puerto en archivo .env
BACKEND_PORT=8001
FRONTEND_PORT=3001
```

### Error de CORS
- Verificar que el backend esté ejecutándose en puerto 8000
- Verificar configuración CORS en `backend/main.py`

---

## 🖥️ Despliegue en Otra PC

### 1. Preparar Archivos
```bash
# Crear archivo ZIP del proyecto (excluyendo node_modules y venv)
# O usar Git para clonar en la nueva PC
```

### 2. En la Nueva PC
```bash
# 1. Instalar prerrequisitos (Python, Node.js, PostgreSQL)
# 2. Clonar/extraer proyecto
# 3. Seguir pasos de configuración desde el inicio
# 4. Configurar archivo .env con credenciales locales
# 5. Ejecutar sistema
```

### 3. Checklist de Migración
- [ ] Python 3.8+ instalado
- [ ] Node.js 16+ instalado
- [ ] PostgreSQL instalado y configurado
- [ ] Base de datos `diarios_scraping` creada
- [ ] Archivo `.env` configurado
- [ ] Dependencias Python instaladas
- [ ] Dependencias Node.js instaladas
- [ ] Backend ejecutándose en puerto 8000
- [ ] Frontend ejecutándose en puerto 3000

---

## 📚 Comandos Útiles

### Comandos Python
```bash
# Activar entorno virtual
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Instalar dependencias
pip install -r requirements.txt

# Actualizar dependencias
pip install --upgrade -r requirements.txt

# Ver paquetes instalados
pip list

# Desactivar entorno virtual
deactivate
```

### Comandos Node.js
```bash
# Instalar dependencias
npm install

# Actualizar dependencias
npm update

# Ver paquetes instalados
npm list

# Limpiar cache
npm cache clean --force
```

### Comandos PostgreSQL
```bash
# Conectar a base de datos
psql -U postgres -d diarios_scraping

# Ver tablas
\dt

# Ver estructura de tabla
\d nombre_tabla

# Ejecutar consulta
SELECT * FROM noticias LIMIT 5;

# Salir
\q
```

### Comandos del Sistema
```bash
# Verificar puertos en uso
netstat -an | findstr :8000  # Windows
lsof -i :8000  # macOS/Linux

# Verificar procesos Python
tasklist | findstr python  # Windows
ps aux | grep python  # macOS/Linux

# Verificar procesos Node
tasklist | findstr node  # Windows
ps aux | grep node  # macOS/Linux
```

---

## 📞 Soporte Técnico

### Logs del Sistema
- **Backend**: Logs en consola y archivos
- **Frontend**: Logs en consola del navegador (F12)
- **Scheduler**: Archivo `scheduler.log`

### Información de Debug
```bash
# Verificar estado del sistema
curl http://localhost:8000/noticias/ultima-actualizacion

# Verificar fechas disponibles
curl http://localhost:8000/noticias/fechas-disponibles

# Verificar categorías
curl http://localhost:8000/categorias-disponibles
```

### Contacto
Para soporte técnico:
1. Revisar este manual
2. Verificar logs del sistema
3. Consultar documentación en `docs/`
4. Crear issue en el repositorio

---

## 📄 Información Adicional

### Versiones Probadas
- Python 3.8.10, 3.9.7, 3.10.5
- Node.js 16.14.0, 18.12.1
- PostgreSQL 12.9, 13.5, 14.2

### Navegadores Compatibles
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Tiempo de Instalación Estimado
- **Primera instalación**: 30-45 minutos
- **Instalación en PC conocida**: 15-20 minutos
- **Migración de datos**: 10-15 minutos

---

**🎉 ¡Felicitaciones! Tu sistema de scraping de diarios peruanos está listo para usar.**

*Última actualización: Enero 2025*
