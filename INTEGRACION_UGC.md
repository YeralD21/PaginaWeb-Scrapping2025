# 🔧 Integración de Sistema UGC en Backend Principal

## 📋 Problema

Tienes 2 backends:
- **`main.py`** en puerto 8000 (scraping de noticias)
- **`ugc_api.py`** en puerto 8001 (sistema UGC)

**Solución:** Integrar ambos en un solo backend.

---

## ✅ Opción 1: Integración Automática (RECOMENDADO)

### **Paso 1: Ejecutar Script de Integración**

```bash
cd backend
python integrate_ugc.py
```

Este script:
- ✅ Agrega imports UGC a `main.py`
- ✅ Incluye los routers de UGC
- ✅ Mantiene tu código existente intacto

### **Paso 2: Ejecutar Migración UGC**

```bash
python migrate_ugc.py
```

Esto crea:
- Tablas: `users`, `posts`, `ingresos`
- Usuario admin: `admin@ugc.com` / `admin123`
- Datos de prueba

### **Paso 3: Iniciar Backend Único**

```bash
python main.py
```

**Backend corriendo en:** http://localhost:8000

**Rutas disponibles:**
- **Noticias:** `/noticias`, `/comparativa`, `/estadisticas`
- **UGC:** `/auth/*`, `/ugc/*`, `/admin/*`

---

## ✅ Opción 2: Integración Manual

### **Paso 1: Editar `main.py`**

Agregar después de los imports existentes:

```python
# ===== IMPORTS UGC =====
try:
    from ugc_routes import router as ugc_router, auth_router, admin_router
    UGC_ENABLED = True
    logger.info("✅ Módulo UGC cargado correctamente")
except ImportError as e:
    UGC_ENABLED = False
    logger.warning(f"⚠️  Módulo UGC no disponible: {e}")
```

### **Paso 2: Incluir Routers**

Después de `app.add_middleware(...)`, agregar:

```python
# ===== INCLUIR RUTAS UGC =====
if UGC_ENABLED:
    app.include_router(auth_router)
    app.include_router(ugc_router)
    app.include_router(admin_router)
    logger.info("✅ Rutas UGC integradas: /auth, /ugc, /admin")
```

### **Paso 3: Ejecutar Migración**

```bash
python migrate_ugc.py
```

### **Paso 4: Iniciar Backend**

```bash
python main.py
```

---

## ✅ Opción 3: Usar Ambos Backends Separados (NO RECOMENDADO)

Si prefieres mantenerlos separados:

### **Terminal 1: Backend Principal**
```bash
cd backend
python main.py  # Puerto 8000
```

### **Terminal 2: Backend UGC**
```bash
cd backend
python ugc_api.py  # Puerto 8001
```

### **Modificar Frontend**

En `AppUGC.js`, cambiar:
```javascript
const API_BASE = 'http://localhost:8001';  // Backend UGC separado
```

**⚠️ Desventajas:**
- 2 procesos corriendo
- 2 puertos diferentes
- Más consumo de recursos
- Más complejo de mantener

---

## 🎯 Resultado Final (Opción 1 o 2)

### **Un Solo Backend en Puerto 8000**

**Rutas de Noticias (existentes):**
- `GET /noticias` - Todas las noticias
- `GET /comparativa` - Comparativa de diarios
- `GET /estadisticas` - Estadísticas

**Rutas UGC (nuevas):**
- `POST /auth/register` - Registro
- `POST /auth/login` - Login
- `GET /auth/me` - Usuario actual
- `POST /ugc/create` - Crear post
- `GET /ugc/my-posts` - Mis posts
- `GET /ugc/feed` - Feed público
- `GET /admin/users` - Lista usuarios (admin)
- `GET /admin/dashboard` - Dashboard (admin)

### **Swagger Docs Unificado**

http://localhost:8000/docs

Todas las rutas en un solo lugar.

---

## 🔄 Modificar Frontend para Usar Puerto 8000

### **Actualizar `AppUGC.js`**

```javascript
// Cambiar de:
const API_BASE = 'http://localhost:8001';

// A:
const API_BASE = 'http://localhost:8000';
```

### **Actualizar Componentes**

Cambiar en:
- `Login.js`
- `CreatePost.js`
- `MyPosts.js`
- `AdminDashboard.js`

```javascript
const API_BASE = 'http://localhost:8000';
```

---

## 📝 Estructura de Archivos

```
backend/
├── main.py                    # ← Backend principal (puerto 8000)
├── ugc_routes.py             # ← Rutas UGC (se importan en main.py)
├── models_ugc.py             # ← Modelos UGC
├── auth_ugc.py               # ← Autenticación JWT
├── revenue_service.py        # ← Lógica de ingresos
├── migrate_ugc.py            # ← Migración de tablas
├── integrate_ugc.py          # ← Script de integración
└── ugc_api.py                # ← (Opcional) Backend separado
```

---

## 🚀 Comandos Rápidos

### **Setup Completo**

```bash
# 1. Integrar rutas
cd backend
python integrate_ugc.py

# 2. Crear tablas y datos
python migrate_ugc.py

# 3. Iniciar backend único
python main.py

# 4. En otra terminal - Frontend
cd frontend
npm start
```

### **Ver Documentación**

```bash
# Abrir en navegador:
http://localhost:8000/docs
```

---

## ✅ Verificación

### **Comprobar que UGC está integrado:**

```bash
curl http://localhost:8000/auth/me
```

**Respuesta esperada:**
```json
{
  "detail": "Token de autorización requerido"
}
```

### **Ver todas las rutas:**

```bash
# Abrir en navegador:
http://localhost:8000/docs
```

Deberías ver:
- ✅ Sección "Noticias"
- ✅ Sección "Autenticación UGC"
- ✅ Sección "UGC - User Generated Content"
- ✅ Sección "Admin UGC"

---

## 🎯 Recomendación

**Usar Opción 1 (Integración Automática)**

✅ **Ventajas:**
- Un solo backend (puerto 8000)
- Un solo proceso
- Documentación unificada
- Fácil de mantener
- Menos consumo de recursos

❌ **Opción 3 (Separados) solo si:**
- Quieres escalar independientemente
- Necesitas deploys separados
- Tienes equipos diferentes

---

## 🔧 Troubleshooting

### **Error: "No module named 'ugc_routes'"**

```bash
# Verificar que existe:
ls backend/ugc_routes.py

# Si no existe:
cd backend
# Crear el archivo ugc_routes.py con el código proporcionado
```

### **Error: "No module named 'models_ugc'"**

```bash
# Ejecutar migración primero:
python migrate_ugc.py
```

### **Frontend no conecta**

```javascript
// Verificar API_BASE en todos los componentes:
const API_BASE = 'http://localhost:8000';  // NO 8001
```

---

## 📞 Resumen

1. **Ejecutar:** `python integrate_ugc.py`
2. **Ejecutar:** `python migrate_ugc.py`
3. **Iniciar:** `python main.py` (solo este)
4. **Cambiar frontend:** API_BASE a puerto 8000
5. **Listo:** Todo en http://localhost:8000

---

**¡Un solo backend, todo integrado! 🎉**

