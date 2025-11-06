# 🚀 Pasos para Integrar UGC Mejorado

## ✅ Estado Actual

- ✅ **main.py actualizado** - Importa `ugc_routes_enhanced`
- ✅ **Todos los archivos creados**
- ✅ **Fallback implementado** - Si no existe el mejorado, usa el básico

---

## 📋 Pasos de Integración

### **Paso 1: Verificar Integración**

```bash
cd backend
python test_ugc_integration.py
```

**Salida esperada:**
```
✅ models_ugc_enhanced.py - OK
✅ notification_service.py - OK
✅ report_service.py - OK
✅ ugc_routes_enhanced.py - OK
✅ Conexión a PostgreSQL - OK
✅ Auth Router: 3 rutas
✅ UGC Router: 8 rutas
✅ Admin Router: 7 rutas
```

---

### **Paso 2: Ejecutar Migración**

```bash
python migrate_ugc_enhanced.py
```

**Esto creará:**
- ✅ Tablas: `posts`, `reports`, `notifications`, `system_settings`
- ✅ Usuario admin: `admin@ugc.com` / `admin123`
- ✅ 3 usuarios de prueba
- ✅ 5 posts de ejemplo en diferentes estados
- ✅ Configuración inicial (umbral = 10)

**Salida esperada:**
```
🚀 Iniciando migración UGC mejorada...
🔧 Creando tablas UGC mejoradas...
✅ Tablas creadas exitosamente.
⚙️ Creando configuración del sistema...
✅ Configuración creada: report_threshold = 10
👤 Creando usuarios iniciales...
✅ Usuario admin creado: admin@ugc.com
📝 Creando publicaciones de ejemplo...
✅ Post creado: Nueva ley de educación aprobada (estado: pending_review)
🎉 Migración UGC mejorada completada exitosamente!
```

---

### **Paso 3: Iniciar Backend**

```bash
python main.py
```

**Verifica en los logs que aparezca:**
```
✅ Módulo UGC Mejorado cargado correctamente (con revisión y reportes)
✅ Rutas UGC integradas: /auth, /ugc, /admin
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

### **Paso 4: Verificar en Swagger**

Abrir en navegador:
```
http://localhost:8000/docs
```

**Deberías ver estas secciones:**

1. **📰 Noticias** (tus endpoints existentes)
   - GET /noticias
   - GET /comparativa
   - etc.

2. **🔐 Auth** (nuevos)
   - POST /auth/register
   - POST /auth/login
   - GET /auth/me

3. **👤 User Generated Content - Enhanced** (nuevos)
   - POST /ugc/create
   - GET /ugc/my-posts
   - GET /ugc/feed
   - POST /ugc/report
   - GET /ugc/notifications

4. **👨‍💼 Admin Dashboard - Enhanced** (nuevos)
   - GET /admin/posts/pending
   - POST /admin/posts/{id}/approve
   - POST /admin/posts/{id}/reject
   - GET /admin/posts/reported
   - POST /admin/posts/{id}/confirm-fake
   - POST /admin/posts/{id}/dismiss-reports
   - GET /admin/reports/stats
   - POST /admin/settings/report-threshold

---

### **Paso 5: Prueba Rápida con Swagger**

#### **A) Login como Admin:**
1. Ir a `POST /auth/login`
2. Hacer clic en "Try it out"
3. Body:
   ```json
   {
     "email": "admin@ugc.com",
     "password": "admin123"
   }
   ```
4. Execute
5. **Copiar el `access_token`** de la respuesta

#### **B) Autorizar en Swagger:**
1. Hacer clic en el botón **"Authorize"** (arriba a la derecha)
2. Pegar: `Bearer YOUR_ACCESS_TOKEN`
3. Autorizar

#### **C) Ver publicaciones pendientes:**
1. Ir a `GET /admin/posts/pending`
2. Execute
3. Deberías ver publicaciones en estado `pending_review`

#### **D) Aprobar una publicación:**
1. Ir a `POST /admin/posts/{post_id}/approve`
2. Ingresar el ID de un post (ejemplo: 1)
3. Execute
4. Respuesta: `{"success": true, "message": "Publicación aprobada"}`

---

## 🧪 Pruebas con cURL

### **1. Login:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ugc.com","password":"admin123"}'
```

### **2. Crear publicación (usuario):**
```bash
curl -X POST http://localhost:8000/ugc/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "noticia",
    "titulo": "Mi primera noticia",
    "contenido": "Contenido de prueba..."
  }'
```

### **3. Aprobar publicación (admin):**
```bash
curl -X POST http://localhost:8000/admin/posts/1/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### **4. Reportar publicación (usuario):**
```bash
curl -X POST http://localhost:8000/ugc/report \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": 1,
    "motivo": "informacion_falsa",
    "comentario": "Esta información es incorrecta porque..."
  }'
```

---

## 🗄️ Verificar en PostgreSQL

```bash
psql -U postgres -d news_scraping
```

### **Ver posts y estados:**
```sql
SELECT id, titulo, estado, total_reportes 
FROM posts 
ORDER BY created_at DESC;
```

### **Ver reportes:**
```sql
SELECT 
  p.titulo,
  u.email as reporter,
  r.motivo,
  r.comentario
FROM reports r
JOIN posts p ON r.post_id = p.id
JOIN users u ON r.reporter_id = u.id;
```

### **Ver notificaciones:**
```sql
SELECT 
  u.email,
  n.titulo,
  n.mensaje,
  n.leida
FROM notifications n
JOIN users u ON n.user_id = u.id
ORDER BY n.created_at DESC;
```

### **Ver configuración:**
```sql
SELECT * FROM system_settings;
```

---

## ⚠️ Troubleshooting

### **Error: "No module named 'models_ugc_enhanced'"**
**Solución:** Asegúrate de estar en el directorio `backend/`
```bash
cd backend
python main.py
```

### **Error: "No module named 'bcrypt'"**
**Solución:** Instalar dependencias
```bash
pip install bcrypt PyJWT email-validator
```

### **Error: "relation 'posts' does not exist"**
**Solución:** Ejecutar migración
```bash
python migrate_ugc_enhanced.py
```

### **Error: "psycopg2.OperationalError: could not connect"**
**Solución:** Verificar que PostgreSQL esté corriendo y configurado
```bash
# Windows
net start postgresql-x64-14

# Verificar archivo .env en backend/
DB_HOST=localhost
DB_PORT=5432
DB_NAME=news_scraping
DB_USER=postgres
DB_PASSWORD=tu_password
```

---

## ✅ Checklist de Verificación

### **Backend:**
- [ ] Ejecutado `test_ugc_integration.py` - OK
- [ ] Ejecutado `migrate_ugc_enhanced.py` - OK
- [ ] Backend inicia sin errores
- [ ] Swagger muestra endpoints UGC Enhanced
- [ ] Login funciona en Swagger
- [ ] Endpoints responden correctamente

### **Base de Datos:**
- [ ] Tabla `posts` con columna `estado`
- [ ] Tabla `reports` existe
- [ ] Tabla `notifications` existe
- [ ] Tabla `system_settings` con umbral configurado
- [ ] Usuario admin existe
- [ ] Posts de ejemplo creados

### **Pruebas Funcionales:**
- [ ] Crear publicación → `pending_review`
- [ ] Admin puede aprobar/rechazar
- [ ] Usuario recibe notificaciones
- [ ] Reportar publicación funciona
- [ ] Auto-flagging al alcanzar umbral
- [ ] Confirmar fake suspende usuario

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu sistema UGC mejorado estará completamente funcional con:

- ✅ Revisión previa de publicaciones
- ✅ Sistema de reportes con comentarios
- ✅ Detección automática de fake news
- ✅ Suspensión automática de infractores
- ✅ Sistema de notificaciones
- ✅ Dashboard admin completo

**Documentación completa en:** `GUIA_COMPLETA_UGC_MEJORADO.md`

---

**¿Problemas?** Revisa la sección de Troubleshooting o ejecuta `python test_ugc_integration.py` para diagnóstico.
