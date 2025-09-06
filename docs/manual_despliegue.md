#  Manual de Despliegue - Sistema de Scraping de Diarios Peruanos

##  Descripción del Proyecto

Este proyecto implementa una plataforma web completa para la extracción, almacenamiento y visualización de noticias de tres diarios peruanos mediante técnicas de web scraping. El sistema incluye automatización, API REST y una interfaz web moderna.

###  Diarios Objetivo
- **Diario Correo**: Deportes, Economía, Espectáculos
- **El Comercio**: Deportes, Economía
- **El Popular**: Deportes, Espectáculos

##  Arquitectura del Sistema

`
        
   Web Scraping         Backend API          Frontend      
   (Python)         (FastAPI)        (React)       
        
                                
                                
    
   Scheduler            PostgreSQL    
   (Automático)         (Base Datos)  
    
`

##  Requisitos del Sistema

### Software Necesario
- **Python 3.8+**
- **Node.js 16+**
- **PostgreSQL 12+**
- **Git**

### Dependencias Python
- requests
- beautifulsoup4
- lxml
- fastapi
- uvicorn
- sqlalchemy
- psycopg2-binary
- schedule
- python-dotenv

### Dependencias Node.js
- React 18
- styled-components
- axios
- react-icons

##  Instalación y Configuración

### 1. Clonar el Repositorio
`ash
git clone <url-del-repositorio>
cd PaginaWeb-Scrapping2025
`

### 2. Configurar Base de Datos PostgreSQL

#### Instalar PostgreSQL
`ash
# Windows (usando Chocolatey)
choco install postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (usando Homebrew)
brew install postgresql
`

#### Crear Base de Datos
`sql
-- Conectar a PostgreSQL
psql -U postgres

-- Crear base de datos
CREATE DATABASE diarios_scraping;

-- Crear usuario (opcional)
CREATE USER scraping_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE diarios_scraping TO scraping_user;
`

### 3. Configurar Variables de Entorno

Copiar el archivo de ejemplo y configurar:
`ash
cp .env.example .env
`

Editar .env con tus credenciales:
`env
# Configuración de Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=diarios_scraping
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

# Configuración del Backend
BACKEND_HOST=localhost
BACKEND_PORT=8000
BACKEND_DEBUG=True

# Configuración del Frontend
FRONTEND_PORT=3000

# Configuración del Scheduler
SCHEDULE_INTERVAL_HOURS=12
`

### 4. Instalar Dependencias Python

`ash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
`

### 5. Instalar Dependencias Frontend

`ash
cd frontend
npm install
cd ..
`

##  Configuración del Backend

### 1. Inicializar Base de Datos
`ash
cd backend
python -c "from database import create_tables; create_tables()"
`

### 2. Ejecutar Backend
`ash
# Desde el directorio backend
python main.py

# O usando uvicorn directamente
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
`

El backend estará disponible en: http://localhost:8000

### 3. Verificar API
`ash
# Probar endpoint raíz
curl http://localhost:8000/

# Ver documentación automática
# Abrir en navegador: http://localhost:8000/docs
`

##  Configuración del Frontend

### 1. Ejecutar Frontend
`ash
cd frontend
npm start
`

El frontend estará disponible en: http://localhost:3000

### 2. Verificar Funcionamiento
- Abrir navegador en http://localhost:3000
- Verificar que se cargan las noticias
- Probar filtros por categoría y diario
- Verificar pestaña de comparativa

##  Configuración del Scheduler

### 1. Ejecutar Scheduler Manualmente
`ash
cd scheduler
python cron_job.py
`

### 2. Configurar como Servicio (Linux)

Crear archivo de servicio:
`ash
sudo nano /etc/systemd/system/diarios-scraping.service
`

Contenido del servicio:
`ini
[Unit]
Description=Diarios Scraping Scheduler
After=network.target

[Service]
Type=simple
User=tu_usuario
WorkingDirectory=/ruta/al/proyecto/scheduler
Environment=PATH=/ruta/al/proyecto/venv/bin
ExecStart=/ruta/al/proyecto/venv/bin/python cron_job.py
Restart=always

[Install]
WantedBy=multi-user.target
`

Activar servicio:
`ash
sudo systemctl daemon-reload
sudo systemctl enable diarios-scraping.service
sudo systemctl start diarios-scraping.service
`

### 3. Verificar Scheduler
`ash
# Ver logs del scheduler
tail -f scheduler.log

# Verificar estado del servicio (Linux)
sudo systemctl status diarios-scraping.service
`

##  Pruebas del Sistema

### 1. Prueba de Scraping Manual
`ash
cd scraping
python main_scraper.py
`

### 2. Prueba de API
`ash
# Obtener noticias
curl "http://localhost:8000/noticias?limit=5"

# Obtener comparativa
curl "http://localhost:8000/comparativa"

# Obtener estadísticas
curl "http://localhost:8000/estadisticas"
`

### 3. Prueba de Frontend
- Verificar carga de noticias
- Probar filtros
- Verificar comparativa
- Probar responsividad

##  Monitoreo y Logs

### 1. Logs del Sistema
- **Backend**: Logs en consola y archivo
- **Scheduler**: scheduler.log
- **Frontend**: Logs en consola del navegador

### 2. Monitoreo de Base de Datos
`sql
-- Verificar noticias
SELECT COUNT(*) FROM noticias;

-- Verificar por diario
SELECT d.nombre, COUNT(n.id) 
FROM diarios d 
LEFT JOIN noticias n ON d.id = n.diario_id 
GROUP BY d.nombre;

-- Verificar por categoría
SELECT categoria, COUNT(*) 
FROM noticias 
GROUP BY categoria;
`

### 3. Métricas de Rendimiento
- Tiempo de scraping por diario
- Cantidad de noticias extraídas
- Errores de conexión
- Uso de memoria y CPU

##  Solución de Problemas

### Problemas Comunes

#### 1. Error de Conexión a Base de Datos
`ash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar credenciales en .env
# Probar conexión manual
psql -h localhost -U postgres -d diarios_scraping
`

#### 2. Error de Scraping
`ash
# Verificar conectividad a internet
ping diariocorreo.pe
ping elcomercio.pe
ping elpopular.pe

# Verificar logs de scraping
tail -f scheduler.log
`

#### 3. Error de CORS en Frontend
`ash
# Verificar que el backend esté corriendo en puerto 8000
# Verificar configuración CORS en backend/main.py
`

#### 4. Dependencias Faltantes
`ash
# Reinstalar dependencias Python
pip install -r requirements.txt --force-reinstall

# Reinstalar dependencias Node.js
cd frontend
rm -rf node_modules package-lock.json
npm install
`

### Logs de Depuración

#### Habilitar Logs Detallados
`python
# En backend/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
`

#### Verificar Estado del Sistema
`ash
# Verificar procesos
ps aux | grep python
ps aux | grep node

# Verificar puertos
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000
`

##  Optimización y Escalabilidad

### 1. Optimizaciones de Rendimiento
- Implementar caché Redis
- Optimizar consultas SQL
- Usar paginación en API
- Implementar compresión gzip

### 2. Escalabilidad
- Usar Docker para contenedores
- Implementar load balancer
- Usar base de datos distribuida
- Implementar microservicios

### 3. Monitoreo Avanzado
- Integrar Prometheus/Grafana
- Implementar alertas
- Monitoreo de uptime
- Análisis de logs

##  Seguridad

### 1. Medidas de Seguridad Implementadas
- Variables de entorno para credenciales
- Validación de entrada en API
- CORS configurado
- Logs de auditoría

### 2. Recomendaciones Adicionales
- Usar HTTPS en producción
- Implementar autenticación
- Validar rate limiting
- Backup regular de base de datos

##  Mantenimiento

### 1. Tareas Regulares
- Monitorear logs de errores
- Verificar funcionamiento del scheduler
- Backup de base de datos
- Actualización de dependencias

### 2. Backup de Base de Datos
`ash
# Backup completo
pg_dump -h localhost -U postgres diarios_scraping > backup_.sql

# Restaurar backup
psql -h localhost -U postgres diarios_scraping < backup_20240101.sql
`

### 3. Actualización del Sistema
`ash
# Actualizar código
git pull origin main

# Actualizar dependencias Python
pip install -r requirements.txt --upgrade

# Actualizar dependencias Node.js
cd frontend
npm update
`

##  Soporte

Para soporte técnico o reportar problemas:
1. Revisar logs del sistema
2. Verificar configuración
3. Consultar este manual
4. Crear issue en el repositorio

---

**Versión del Manual**: 1.0  
**Fecha de Actualización**: Enero 2025  
**Autor**: Sistema de Scraping de Diarios Peruanos
