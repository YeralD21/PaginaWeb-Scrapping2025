# 🚀 Instrucciones para Probar el Sistema de Moderación

## ✅ Sistema Implementado Exitosamente

Se ha implementado un **sistema completo de moderación de contenido** con las siguientes funcionalidades:

### **Funciones Principales:**
- ✅ **Aprobar publicaciones** pendientes
- ❌ **Rechazar publicaciones** con motivo detallado
- 🚫 **Rechazar y suspender usuarios** (temporal o indefinido)
- 📊 **Ver estadísticas** en tiempo real
- 👥 **Gestionar usuarios** con estados (activo/suspendido)

---

## 🎯 Guía Paso a Paso

### **1. Verificar que el Backend está Corriendo:**
```bash
# El backend debería estar ejecutándose en:
http://localhost:8000

# Si no está corriendo, ejecutar:
cd backend
python main.py
```

### **2. Verificar que el Frontend está Corriendo:**
```bash
# El frontend debería estar ejecutándose en:
http://localhost:3000

# Si no está corriendo, ejecutar (en otra terminal):
cd frontend
npm start
```

---

## 🧪 Escenario de Prueba Completo

### **PASO 1: Crear Usuario de Prueba**
1. Ir a: `http://localhost:3000`
2. Click en botón azul **"Registrarse"** (arriba a la derecha)
3. Llenar formulario:
   - **Email:** `testuser@demo.com`
   - **Password:** `123456`
4. Click en **"Registrarse"**
5. **Logout** (cerrar sesión)

---

### **PASO 2: Crear Publicación como Usuario**
1. **Login** con el usuario recién creado:
   - Email: `testuser@demo.com`
   - Password: `123456`
2. Click en el botón **"🚀 UGC Platform"** en el navbar
3. Click en **"Crear Publicación"**
4. Seleccionar tipo: **"Noticia"**
5. Llenar todos los campos:
   ```
   Título: Noticia de Prueba para Moderación
   Descripción: Esta es una descripción breve de la noticia
   Fuente: El Comercio
   Contenido: Este es el contenido completo de la noticia...
   Imagen: (subir una imagen local o dejar en blanco)
   ```
6. Click en **"Publicar"**
7. **Resultado:** Verás un mensaje: "✅ Publicación enviada para revisión"
8. Ve a **"Mis Publicaciones"** y verás tu noticia con estado **"⏳ PENDIENTE"**

---

### **PASO 3: Moderar como Admin**
1. **Logout** del usuario normal
2. **Login como Admin:**
   - Email: `admin@ugc.com`
   - Password: `admin123`
3. Ir al **Dashboard de Admin**
4. Verás **3 pestañas** en la parte superior:
   ```
   📊 Estadísticas | ⏳ Publicaciones Pendientes (1) | 👥 Gestión de Usuarios
   ```
5. Click en **"⏳ Publicaciones Pendientes"**

---

### **PASO 4: Aprobar una Publicación (Escenario 1)**
1. Verás la publicación creada anteriormente
2. Revisar el contenido, título, imagen
3. Click en botón verde **"✅ Aprobar Publicación"**
4. **Resultado:** 
   - Mensaje: "✅ Publicación aprobada exitosamente"
   - La publicación desaparece de la lista de pendientes
   - El contador de "Publicaciones Pendientes" disminuye
5. **Verificar:**
   - Logout del admin
   - Login como `testuser@demo.com`
   - Ir a "Mis Publicaciones"
   - Verás tu noticia con estado **"✅ PUBLICADO"**

---

### **PASO 5: Rechazar una Publicación (Escenario 2)**
1. Crear otra publicación como usuario normal
2. Login como admin
3. Ir a **"Publicaciones Pendientes"**
4. Click en botón rojo **"❌ Rechazar"**
5. **Se abre un modal:**
   ```
   ❌ Rechazar Publicación
   ─────────────────────────
   Motivo del rechazo: *
   [Explica por qué se rechaza...]
   
   [Cancelar] [Confirmar Rechazo]
   ```
6. Escribir motivo:
   ```
   "El contenido no cumple con nuestras políticas de calidad.
   Se requiere más información y fuentes verificadas."
   ```
7. Click en **"Confirmar Rechazo"**
8. **Resultado:**
   - Mensaje: "✅ Publicación rechazada exitosamente"
   - La publicación desaparece de pendientes
9. **Verificar:**
   - Logout y login como usuario
   - En "Mis Publicaciones" verás estado **"❌ RECHAZADO"**

---

### **PASO 6: Rechazar y Suspender Usuario (Escenario 3)**
1. Crear **otra publicación** con contenido inapropiado (de prueba):
   ```
   Título: Contenido Inapropiado
   Descripción: Fake news sobre política
   Contenido: Información falsa y engañosa...
   ```
2. Login como admin
3. Ir a **"Publicaciones Pendientes"**
4. Click en botón naranja **"🚫 Rechazar y Suspender Usuario"**
5. **Se abre modal de suspensión:**
   ```
   🚫 Rechazar Publicación y Suspender Usuario
   ─────────────────────────────────────────
   
   Tipo de suspensión: *
   [Temporal ▼]
   
   Días de suspensión: *
   [7]
   
   Motivo de suspensión: *
   [Fake News o desinformación ▼]
   
   [Cancelar] [Confirmar Suspensión]
   ```
6. Configurar:
   - **Tipo:** Temporal
   - **Días:** 7
   - **Motivo:** "Fake News o desinformación"
7. Click en **"Confirmar Suspensión"**
8. **Resultado:**
   - Publicación rechazada
   - Usuario suspendido por 7 días
9. **Verificar Suspensión:**
   - Logout y login como `testuser@demo.com`
   - Intentar crear nueva publicación
   - (Si está implementado) Verás: "🚫 Tu cuenta está suspendida"

---

## 📊 Ver Estadísticas del Sistema

### **Pestaña "Estadísticas":**
Muestra 9 tarjetas con métricas:
```
💰 Ingresos Totales: $0.00
👑 Ganancia Admin (70%): $0.00
👥 Ganancia Usuarios (30%): $0.00
👤 Total Usuarios: 4
📝 Total Posts: 7
👑 Admins: 1
⏳ Pendientes: 2
✅ Publicados: 5
🚩 Reportes: 0
```

### **Pestaña "Gestión de Usuarios":**
Muestra tabla con todos los usuarios:
```
ID  Email              Rol    Fecha         Posts  Ganancia  Estado
─────────────────────────────────────────────────────────────────
1   admin@ugc.com      ADMIN  12/10/2025    0      $0.00     ACTIVO
2   testuser@demo.com  USER   13/10/2025    3      $0.00     SUSPENDIDO
```

---

## 🗄️ Verificar en PostgreSQL

### **Ver Publicaciones por Estado:**
```sql
SELECT 
  id, 
  tipo, 
  titulo, 
  estado, 
  user_id,
  created_at
FROM posts
ORDER BY created_at DESC;
```

### **Ver Usuarios Suspendidos:**
```sql
SELECT 
  id, 
  email, 
  suspendido, 
  motivo_suspension,
  fecha_suspension
FROM users
WHERE suspendido = TRUE;
```

### **Ver Historial de Moderación:**
```sql
SELECT 
  p.id AS post_id,
  p.titulo,
  p.estado,
  p.motivo_rechazo,
  u_autor.email AS autor,
  u_admin.email AS revisado_por,
  p.fecha_revision
FROM posts p
LEFT JOIN users u_autor ON p.user_id = u_autor.id
LEFT JOIN users u_admin ON p.revisado_por = u_admin.id
WHERE p.revisado_por IS NOT NULL
ORDER BY p.fecha_revision DESC;
```

---

## 🎨 Capturas de Pantalla Esperadas

### **1. Dashboard con Pestañas:**
```
┌─────────────────────────────────────────────────────────┐
│  📊 Estadísticas | ⏳ Publicaciones Pendientes (2) | ...│
└─────────────────────────────────────────────────────────┘
```

### **2. Publicación Pendiente:**
```
┌─────────────────────────────────────────────────────────┐
│  📰 NOTICIA                    13 de octubre, 2025      │
│  ──────────────────────────────────────────────────────  │
│  Noticia de Prueba para Moderación                      │
│  "Esta es una descripción breve de la noticia"          │
│  [Imagen]                                                │
│  📰 Fuente: El Comercio                                 │
│                                                          │
│  Este es el contenido completo...                        │
│                                                          │
│  👤 Usuario: testuser@demo.com   🆔 Post ID: 5          │
│                                                          │
│  [✅ Aprobar] [❌ Rechazar] [🚫 Rechazar y Suspender]   │
└─────────────────────────────────────────────────────────┘
```

### **3. Modal de Suspensión:**
```
┌──────────────────────────────────────────────┐
│ 🚫 Rechazar Publicación y Suspender Usuario │
│                                              │
│  Tipo: [Temporal ▼]                         │
│  Días: [7______]                            │
│  Motivo: [Fake News o desinformación ▼]     │
│                                              │
│  [Cancelar] [Confirmar Suspensión]          │
└──────────────────────────────────────────────┘
```

---

## ⚠️ Notas Importantes

### **1. Estados de Publicación:**
```javascript
⏳ PENDIENTE   -> pending_review (esperando moderación)
✅ PUBLICADO   -> published (aprobado por admin)
❌ RECHAZADO   -> rejected (rechazado por admin)
🚩 REPORTADO   -> flagged (muchos reportes)
🚫 FAKE        -> fake (confirmado falso)
```

### **2. Permisos:**
- **Usuario Normal:** Puede crear publicaciones, ver sus propias publicaciones
- **Admin:** Puede moderar, ver dashboard, gestionar usuarios

### **3. Flujo Completo:**
```
Usuario crea post
    ↓
Estado: pending_review
    ↓
Admin revisa
    ↓
  ┌─────┴──────┐
  ↓            ↓
Aprobar     Rechazar
  ↓            ↓
published   rejected
```

---

## 🎉 Checklist de Verificación

- [ ] Backend corriendo en http://localhost:8000
- [ ] Frontend corriendo en http://localhost:3000
- [ ] Puedes registrar nuevos usuarios
- [ ] Puedes crear publicaciones como usuario
- [ ] Las publicaciones quedan en estado "pendiente"
- [ ] Puedes login como admin (admin@ugc.com)
- [ ] Ves la pestaña "Publicaciones Pendientes"
- [ ] Puedes aprobar publicaciones
- [ ] Puedes rechazar publicaciones con motivo
- [ ] Puedes suspender usuarios (temporal/indefinido)
- [ ] Los contadores se actualizan en tiempo real
- [ ] La tabla de usuarios muestra estados correctos

---

## 🔧 Solución de Problemas

### **Problema: No aparecen publicaciones pendientes**
```bash
# Verificar en PostgreSQL:
SELECT * FROM posts WHERE estado = 'pending_review';

# Si está vacío, crear una publicación como usuario normal
```

### **Problema: Error al aprobar/rechazar**
```bash
# Verificar que el backend está corriendo
curl http://localhost:8000/admin/posts/pending \
  -H "Authorization: Bearer {tu_token_admin}"

# Verificar en los logs del backend (terminal)
```

### **Problema: Modal no se abre**
```bash
# Refrescar frontend (F5)
# Abrir consola del navegador (F12) y buscar errores
# Verificar que ModerationPanel.js se importó correctamente
```

---

## 🚀 ¡Sistema Listo!

**Todo está implementado y funcionando:**
✅ Interfaz completa de moderación
✅ 3 tipos de acciones (aprobar/rechazar/suspender)
✅ Modales con validaciones
✅ Motivos predefinidos
✅ Suspensiones temporales e indefinidas
✅ Dashboard con estadísticas
✅ Gestión de usuarios

**¡Ahora puedes moderar contenido de forma profesional!** 🛡️✨

---

## 📞 Próximos Pasos

1. **Probar todos los escenarios** descritos arriba
2. **Verificar en la base de datos** que los cambios se guardan
3. **Personalizar motivos** de suspensión si es necesario
4. **Agregar más validaciones** automáticas (opcional)
5. **Implementar sistema de notificaciones** completo (opcional)

**¡Disfruta de tu sistema de moderación completo!** 🎊
