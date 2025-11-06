# 🚀 Sistema UGC (User Generated Content) con Roles y Ganancias

## 📋 Descripción

Sistema completo de contenido generado por usuarios con:
- **2 Roles**: Usuario (`user`) y Administrador (`admin`)
- **Publicaciones**: Usuarios pueden crear texto, imágenes, videos, comentarios, reseñas y posts
- **Sistema de Ingresos**: Cada interacción genera ingresos que se reparten automáticamente (70% admin / 30% creador)
- **Dashboard de Admin**: Visualización de usuarios, posts y ganancias
- **Autenticación JWT**: Sistema seguro de login y registro

---

## 🛠️ Tecnologías

### Backend
- **FastAPI** - Framework web moderno
- **PostgreSQL** - Base de datos relacional
- **SQLAlchemy** - ORM para Python
- **JWT** - Autenticación con tokens
- **bcrypt** - Encriptación de contraseñas

### Frontend
- **React** - Biblioteca de UI
- **styled-components** - CSS-in-JS
- **axios** - Cliente HTTP

---

## 📦 Instalación

### 1. Requisitos Previos

- Python 3.8+
- PostgreSQL 12+
- Node.js 16+
- npm o yarn

### 2. Configurar PostgreSQL

```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE diarios_scraping;
\q
```

### 3. Instalar Dependencias del Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements_ugc.txt
```

### 4. Configurar Variables de Entorno

Crear archivo `.env` en la carpeta `backend/`:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=diarios_scraping
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET_KEY=tu_clave_secreta_muy_segura_cambiar_en_produccion_2024
JWT_EXPIRE_MINUTES=60
```

### 5. Ejecutar Migración (Crear Tablas y Datos Iniciales)

```bash
cd backend
python migrate_ugc.py
```

**Esto creará:**
- Tablas: `users`, `posts`, `ingresos`
- Usuario admin: `admin@ugc.com` / `admin123`
- 3 usuarios de prueba: `user1@test.com`, `user2@test.com`, `user3@test.com` / `user123`
- 5 posts de ejemplo

### 6. Iniciar Backend

```bash
cd backend
python ugc_api.py
```

El backend estará disponible en: **http://localhost:8001**

API Docs: **http://localhost:8001/docs**

### 7. Instalar Dependencias del Frontend

```bash
cd frontend
npm install
```

### 8. Iniciar Frontend

Modificar `frontend/src/index.js`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppUGC from './AppUGC';  // Importar AppUGC

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppUGC />
  </React.StrictMode>
);
```

```bash
cd frontend
npm start
```

El frontend estará disponible en: **http://localhost:3000**

---

## 🎯 Cómo Probar el Sistema

### 1. **Login como Usuario**

1. Abrir **http://localhost:3000**
2. Hacer clic en "¿No tienes cuenta? Regístrate"
3. Crear una cuenta con tu email y contraseña
4. O usar cuenta de prueba: `user1@test.com` / `user123`

### 2. **Crear Publicaciones**

1. En la pestaña "✨ Crear Publicación"
2. Seleccionar tipo de contenido (texto, imagen, video, etc.)
3. Escribir o pegar URL del contenido
4. Hacer clic en "🚀 Publicar"

### 3. **Ver Mis Publicaciones**

1. Ir a la pestaña "📊 Mis Publicaciones"
2. Ver estadísticas: total posts, views, clicks, ganancias
3. Ver lista de posts con métricas individuales

### 4. **Simular Interacciones (Generar Ingresos)**

**Opción A: Usar API directamente**

```bash
# Simular 100 views y 50 clicks en post #1
curl -X POST "http://localhost:8001/admin/simulate-interactions/1?views=100&clicks=50" \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"
```

**Opción B: Usar Swagger UI**

1. Ir a **http://localhost:8001/docs**
2. Login como admin para obtener token
3. Usar endpoint `/admin/simulate-interactions/{post_id}`
4. Ingresar post_id, views y clicks

### 5. **Login como Admin**

1. Cerrar sesión (botón 🚪 Salir)
2. Login con: `admin@ugc.com` / `admin123`
3. Verás el "👑 Dashboard Admin"

### 6. **Ver Dashboard de Admin**

El dashboard muestra:
- **Ingresos Totales**: Suma de todas las ganancias
- **Ganancia Admin (70%)**: Tu parte de los ingresos
- **Ganancia Usuarios (30%)**: Parte de los creadores
- **Total Usuarios/Posts**: Métricas del sistema
- **Tabla de Ganancias por Usuario**: Detalle de cada usuario
- **Lista de Todos los Usuarios**: Información completa

---

## 🔄 Flujo Completo de Ejemplo

### **Escenario: Usuario Gana Dinero**

1. **Usuario crea un post**
   ```
   POST /ugc/create
   {
     "tipo": "texto",
     "contenido": "Mi primer post"
   }
   ```

2. **Admin simula interacciones**
   ```
   POST /admin/simulate-interactions/1?views=100&clicks=50
   ```
   
   **Resultado:**
   - 150 interacciones totales
   - 150 × $0.01 = $1.50 USD generados
   - Admin recibe: $1.50 × 70% = $1.05
   - Creador recibe: $1.50 × 30% = $0.45

3. **Usuario ve sus ganancias**
   ```
   GET /ugc/my-posts
   ```
   
   **Respuesta:**
   ```json
   {
     "stats": {
       "total_posts": 1,
       "total_views": 100,
       "total_clicks": 50,
       "total_ganancia": 0.45
     }
   }
   ```

4. **Admin ve dashboard**
   ```
   GET /admin/dashboard
   ```
   
   **Respuesta:**
   ```json
   {
     "total_ingresos": 1.50,
     "ganancia_admin": 1.05,
     "ganancia_usuarios": 0.45,
     "detalle_usuarios": [
       {
         "user_id": 2,
         "email": "user@test.com",
         "ganancia": 0.45
       }
     ]
   }
   ```

---

## 📡 API Endpoints

### **Autenticación**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registrar nuevo usuario |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/auth/me` | Obtener usuario actual |

### **Publicaciones (UGC)**

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/ugc/create` | Crear publicación | User |
| GET | `/ugc/my-posts` | Mis publicaciones | User |
| GET | `/ugc/feed` | Feed público | No |
| POST | `/ugc/interact/{post_id}` | Registrar interacción | No |

### **Admin**

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/admin/users` | Lista de usuarios | Admin |
| GET | `/admin/dashboard` | Dashboard completo | Admin |
| POST | `/admin/simulate-interactions/{post_id}` | Simular interacciones | Admin |

---

## 💰 Sistema de Ingresos

### **Configuración**

```python
INGRESO_POR_INTERACCION = 0.01  # $0.01 por interacción
PORCENTAJE_ADMIN = 0.70  # 70% para admin
PORCENTAJE_CREADOR = 0.30  # 30% para creador
```

### **Tipos de Interacciones**

- **View** (Vista): Cuando alguien ve el post
- **Click** (Clic): Cuando alguien hace clic
- **Other** (Otra): Otras interacciones (likes, shares, etc.)

### **Cálculo de Ingresos**

```
Total Interacciones = Views + Clicks + Otras
Ingreso Total = Total Interacciones × $0.01
Ingreso Admin = Ingreso Total × 70%
Ingreso Creador = Ingreso Total × 30%
```

### **Ejemplo Práctico**

Un post con:
- 500 views
- 200 clicks
- 100 otras interacciones

**Total:** 800 interacciones

**Cálculo:**
```
Ingreso Total = 800 × $0.01 = $8.00
Admin recibe = $8.00 × 70% = $5.60
Creador recibe = $8.00 × 30% = $2.40
```

---

## 🗄️ Esquema de Base de Datos

### **Tabla: users**

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);
```

### **Tabla: posts**

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('texto', 'imagen', 'video', 'comentario', 'resena', 'post')),
    contenido TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    interacciones INTEGER DEFAULT 0,
    aprobado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Tabla: ingresos**

```sql
CREATE TABLE ingresos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id),
    monto FLOAT NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('admin', 'creator')),
    concepto VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Seguridad

### **Autenticación JWT**

- Tokens con expiración de 24 horas
- Contraseñas encriptadas con bcrypt
- Headers de autorización en todas las rutas protegidas

### **Formato de Autenticación**

```
Authorization: Bearer <token>
```

### **Roles y Permisos**

| Rol | Permisos |
|-----|----------|
| **user** | Crear posts, ver sus posts, ver ganancias |
| **admin** | Todo lo de user + ver dashboard, gestionar usuarios, simular interacciones |

---

## 🧪 Testing

### **Test Manual con cURL**

**1. Registrar Usuario**
```bash
curl -X POST "http://localhost:8001/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**2. Login**
```bash
curl -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**3. Crear Post**
```bash
curl -X POST "http://localhost:8001/ugc/create" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "texto",
    "contenido": "Mi primer post de prueba"
  }'
```

**4. Simular Interacciones (Admin)**
```bash
curl -X POST "http://localhost:8001/admin/simulate-interactions/1?views=50&clicks=25" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**5. Ver Dashboard Admin**
```bash
curl -X GET "http://localhost:8001/admin/dashboard" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📊 Monitoreo

### **Logs**

El sistema genera logs en:
- Console output durante ejecución
- Logs de SQLAlchemy (queries de BD)

### **Health Check**

```bash
curl http://localhost:8001/health
```

### **API Documentation**

Swagger UI disponible en: **http://localhost:8001/docs**

---

## 🚨 Troubleshooting

### **Error: "relation 'users' does not exist"**

**Solución:** Ejecutar migración
```bash
python backend/migrate_ugc.py
```

### **Error: "Token inválido"**

**Solución:** Token expirado, hacer login nuevamente

### **Error: "CORS policy blocked"**

**Solución:** Verificar que el backend esté corriendo en puerto 8001 y frontend en 3000

### **Error: "connection refused to database"**

**Solución:** 
1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales en `.env`
3. Crear base de datos si no existe

---

## 🔄 Actualizaciones Futuras

- [ ] Sistema de notificaciones en tiempo real
- [ ] Upload de imágenes/videos directamente
- [ ] Sistema de reportes de contenido
- [ ] Analytics avanzados con gráficos
- [ ] Exportación de datos a CSV/PDF
- [ ] Sistema de badges y logros
- [ ] API rate limiting
- [ ] Sistema de comentarios en posts

---

## 📝 Notas Importantes

⚠️ **SEGURIDAD:**
- Cambiar `JWT_SECRET_KEY` en producción
- Cambiar contraseñas por defecto
- Usar HTTPS en producción
- Implementar rate limiting

💡 **TIPS:**
- Puedes ajustar `INGRESO_POR_INTERACCION` en `revenue_service.py`
- Puedes cambiar los porcentajes de reparto (70/30)
- Los posts son aprobados automáticamente por defecto

🎯 **PARA PRESENTACIÓN:**
1. Mostrar login/registro
2. Crear algunos posts
3. Simular interacciones
4. Mostrar dashboard con ganancias
5. Explicar el sistema de reparto

---

## 👥 Créditos

Sistema desarrollado para demostración de:
- Arquitectura FastAPI + React
- Sistema de roles y autenticación
- Modelo de negocio con reparto de ingresos
- CRUD completo con PostgreSQL

---

## 📧 Soporte

Para dudas o problemas:
1. Revisar logs del backend
2. Revisar console del frontend
3. Verificar API docs en `/docs`
4. Verificar que PostgreSQL esté corriendo

---

**¡Listo para usar! 🚀**
