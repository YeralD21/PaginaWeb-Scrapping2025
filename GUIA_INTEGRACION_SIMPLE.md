# 🔧 Guía Simple: Integrar UGC en main.py

## ✅ Archivos que NECESITAS (mantener):

```
backend/
├── main.py                 # ← Tu backend principal
├── ugc_routes.py          # ← Rutas UGC (ya creado) ✅
├── models_ugc.py          # ← Modelos UGC ✅
├── auth_ugc.py            # ← Autenticación JWT ✅
├── revenue_service.py     # ← Lógica de ingresos ✅
├── migrate_ugc.py         # ← Script de migración ✅
└── requirements_ugc.txt   # ← Dependencias ✅
```

## ❌ Archivos ELIMINADOS (redundantes):

- ~~`ugc_api.py`~~ → Ya no lo necesitas (eliminado ✅)
- ~~`integrate_ugc.py`~~ → Ya no lo necesitas (eliminado ✅)

---

## 🚀 PASOS DE INTEGRACIÓN MANUAL

### **Paso 1: Editar `backend/main.py`**

#### **A) Agregar imports (después de la línea 22)**

Buscar esta línea en `main.py`:
```python
from pydantic import BaseModel
```

**Agregar DESPUÉS de esa línea:**

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

#### **B) Incluir routers (después de la línea ~149)**

Buscar esta sección en `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Agregar DESPUÉS de esa sección:**

```python
# ===== INCLUIR RUTAS UGC =====
if UGC_ENABLED:
    app.include_router(auth_router)
    app.include_router(ugc_router)
    app.include_router(admin_router)
    logger.info("✅ Rutas UGC integradas: /auth, /ugc, /admin")
```

---

### **Paso 2: Instalar Dependencias UGC**

```bash
cd backend
pip install -r requirements_ugc.txt
```

**Dependencias que se instalarán:**
- PyJWT (para tokens)
- bcrypt (para contraseñas)
- email-validator (para validar emails)

---

### **Paso 3: Ejecutar Migración**

```bash
cd backend
python migrate_ugc.py
```

**Esto crea:**
- ✅ Tablas: `users`, `posts`, `ingresos`
- ✅ Admin: `admin@ugc.com` / `admin123`
- ✅ 3 usuarios de prueba
- ✅ 5 posts de ejemplo

---

### **Paso 4: Iniciar Backend Único**

```bash
cd backend
python main.py
```

**Backend corriendo en:** http://localhost:8000 ✅

---

### **Paso 5: Actualizar Frontend (API_BASE)**

Cambiar en **todos** estos archivos:

#### **`frontend/src/components/UGC/Login.js`**
```javascript
const API_BASE = 'http://localhost:8000';  // Cambiar de 8001 a 8000
```

#### **`frontend/src/components/UGC/CreatePost.js`**
```javascript
const API_BASE = 'http://localhost:8000';  // Cambiar de 8001 a 8000
```

#### **`frontend/src/components/UGC/MyPosts.js`**
```javascript
const API_BASE = 'http://localhost:8000';  // Cambiar de 8001 a 8000
```

#### **`frontend/src/components/UGC/AdminDashboard.js`**
```javascript
const API_BASE = 'http://localhost:8000';  // Cambiar de 8001 a 8000
```

---

### **Paso 6: Iniciar Frontend**

```bash
cd frontend
npm start
```

**Frontend corriendo en:** http://localhost:3000 ✅

---

## ✅ Verificación

### **1. Comprobar que UGC está integrado:**

Abrir en navegador:
```
http://localhost:8000/docs
```

Deberías ver estas secciones:
- ✅ **Noticias** (tus endpoints existentes)
- ✅ **Autenticación UGC** (/auth/*)
- ✅ **UGC - User Generated Content** (/ugc/*)
- ✅ **Admin UGC** (/admin/*)

### **2. Probar endpoint UGC:**

```bash
curl http://localhost:8000/auth/me
```

**Respuesta esperada:**
```json
{
  "detail": "Token de autorización requerido"
}
```

✅ Si ves esto, ¡está funcionando!

---

## 📊 Resultado Final

### **Un Solo Proceso (Backend):**
```bash
python main.py  # Puerto 8000
```

### **Rutas Disponibles:**

**Noticias (existentes):**
- `GET /noticias`
- `GET /comparativa`
- `GET /estadisticas`
- `GET /alertas`

**UGC (nuevas):**
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /ugc/create`
- `GET /ugc/my-posts`
- `GET /ugc/feed`
- `GET /admin/users`
- `GET /admin/dashboard`

---

## 🎯 Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| `admin@ugc.com` | `admin123` | ADMIN |
| `user1@test.com` | `user123` | USER |
| `user2@test.com` | `user123` | USER |

---

## 🐛 Troubleshooting

### **Error: "No module named 'ugc_routes'"**

**Solución:**
```bash
# Verificar que existe el archivo:
ls backend/ugc_routes.py

# Debe existir ✅
```

### **Error: "No module named 'models_ugc'"**

**Solución:**
```bash
# Instalar dependencias:
pip install -r backend/requirements_ugc.txt

# Ejecutar migración:
python backend/migrate_ugc.py
```

### **Frontend no conecta**

**Solución:**
- Verificar que `API_BASE = 'http://localhost:8000'` en todos los componentes
- Verificar que backend está corriendo en puerto 8000
- Verificar CORS en `main.py`

### **Tablas no existen**

**Solución:**
```bash
# Ejecutar migración:
python backend/migrate_ugc.py
```

---

## 📝 Resumen de Cambios

### **Antes:**
```
Terminal 1: python main.py (puerto 8000)      # Noticias
Terminal 2: python ugc_api.py (puerto 8001)   # UGC
Terminal 3: npm start (puerto 3000)           # Frontend
```

### **Después:**
```
Terminal 1: python main.py (puerto 8000)      # Noticias + UGC ✅
Terminal 2: npm start (puerto 3000)           # Frontend ✅
```

**¡De 3 terminales a 2!** 🎉

---

## ✅ Checklist Final

- [ ] Editar `main.py` (agregar imports y routers)
- [ ] Instalar dependencias: `pip install -r requirements_ugc.txt`
- [ ] Ejecutar migración: `python migrate_ugc.py`
- [ ] Actualizar `API_BASE` en componentes React
- [ ] Iniciar backend: `python main.py`
- [ ] Iniciar frontend: `npm start`
- [ ] Verificar en http://localhost:8000/docs
- [ ] Login con `admin@ugc.com` / `admin123`

---

**¡Listo! Todo integrado en un solo backend. 🚀**

