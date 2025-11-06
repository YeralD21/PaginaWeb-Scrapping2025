# 🚀 Sistema UGC Mejorado - Documentación Completa

## 📋 Resumen de Mejoras Implementadas

Se ha implementado un sistema completo de **revisión previa**, **reportes de usuarios** y **detección de fake news** para el módulo UGC.

---

## 🎯 Funcionalidades Principales

### **1. Flujo de Publicación con Revisión**
- ✅ Todas las publicaciones nuevas entran en estado `pending_review`
- ✅ Solo administradores pueden aprobar/rechazar
- ✅ Notificaciones automáticas al usuario

### **2. Sistema de Estados**
```
DRAFT → PENDING_REVIEW → PUBLISHED
                       ↓
                    REJECTED

PUBLISHED → (reportes) → FLAGGED → FAKE (+ suspensión)
                                 ↓
                              PUBLISHED (descartado)
```

### **3. Sistema de Reportes**
- ✅ Usuarios pueden reportar publicaciones (1 reporte por usuario/post)
- ✅ Comentario obligatorio al reportar
- ✅ Umbral configurable (defecto: 10 reportes)
- ✅ Auto-flagging al alcanzar umbral

### **4. Dashboard de Admin Mejorado**
- ✅ Sección: Publicaciones por aprobar
- ✅ Sección: Noticias reportadas
- ✅ Sección: Configuración de umbral
- ✅ Estadísticas de reportes

---

## 🗄️ Estructura de Base de Datos

### **Tablas Nuevas:**

#### **`posts` (Actualizada)**
```sql
- estado: ENUM (draft, pending_review, published, rejected, flagged, fake)
- titulo: VARCHAR(255)
- total_reportes: INTEGER
- fecha_flagged: TIMESTAMP
- verificado_como_fake: BOOLEAN
- revisado_por: INTEGER (FK users.id)
- motivo_rechazo: TEXT
```

#### **`reports`**
```sql
- id: SERIAL PRIMARY KEY
- post_id: INTEGER FK
- reporter_id: INTEGER FK  
- motivo: ENUM (informacion_falsa, spam, violencia, etc.)
- comentario: TEXT NOT NULL
- estado: ENUM (pending, reviewed, dismissed)
- created_at: TIMESTAMP
- revisado_por: INTEGER FK
- UNIQUE(post_id, reporter_id)  -- ¡Solo un reporte por usuario/post!
```

#### **`notifications`**
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER FK
- titulo: VARCHAR(255)
- mensaje: TEXT
- tipo: VARCHAR(50)
- post_id: INTEGER FK (opcional)
- leida: BOOLEAN
- created_at: TIMESTAMP
```

#### **`system_settings`**
```sql
- id: SERIAL PRIMARY KEY
- clave: VARCHAR(100) UNIQUE
- valor: VARCHAR(255)
- descripcion: TEXT
- updated_by: INTEGER FK
```

#### **`users` (Actualizada)**
```sql
- suspendido: BOOLEAN
- motivo_suspension: TEXT
- fecha_suspension: TIMESTAMP
- suspendido_por: INTEGER FK
```

---

## 🔧 Archivos Creados

### **Backend:**
1. ✅ `backend/models_ugc_enhanced.py` - Modelos actualizados
2. ✅ `backend/migrate_ugc_enhanced.py` - Script de migración
3. ✅ `backend/notification_service.py` - Servicio de notificaciones
4. ✅ `backend/report_service.py` - Servicio de reportes
5. ⏳ `backend/ugc_routes_enhanced.py` - Endpoints mejorados (ver abajo)

### **Frontend:**
6. ⏳ Componentes de UI para reportes y estados (ver abajo)

---

## 📡 Endpoints del Backend

### **Para Usuarios:**

#### **1. Crear Publicación**
```http
POST /ugc/create
{
  "tipo": "noticia",
  "titulo": "Título de la noticia",
  "contenido": "Contenido..."
}

Response:
{
  "id": 1,
  "estado": "pending_review",
  "message": "Publicación enviada a revisión"
}
```

#### **2. Reportar Publicación**
```http
POST /ugc/report
{
  "post_id": 1,
  "motivo": "informacion_falsa",
  "comentario": "Esta noticia contiene datos incorrectos..."
}

Response:
{
  "success": true,
  "total_reportes": 5,
  "flagged": false
}
```

#### **3. Mis Notificaciones**
```http
GET /ugc/notifications?unread_only=true

Response:
[
  {
    "id": 1,
    "titulo": "Publicación aprobada",
    "mensaje": "Tu publicación...",
    "leida": false,
    "created_at": "2025-10-13T..."
  }
]
```

### **Para Administradores:**

#### **4. Publicaciones Pendientes**
```http
GET /admin/posts/pending

Response:
[
  {
    "id": 1,
    "titulo": "...",
    "user_email": "user@test.com",
    "created_at": "...",
    "estado": "pending_review"
  }
]
```

#### **5. Aprobar Publicación**
```http
POST /admin/posts/{post_id}/approve

Response:
{
  "success": true,
  "message": "Publicación aprobada"
}
```

#### **6. Rechazar Publicación**
```http
POST /admin/posts/{post_id}/reject
{
  "motivo": "Contenido inapropiado..."
}
```

#### **7. Posts Reportados**
```http
GET /admin/posts/reported

Response:
[
  {
    "id": 2,
    "titulo": "...",
    "total_reportes": 12,
    "estado": "flagged",
    "reportes": [
      {
        "reporter_email": "user3@test.com",
        "motivo": "informacion_falsa",
        "comentario": "...",
        "created_at": "..."
      }
    ]
  }
]
```

#### **8. Confirmar como Fake**
```http
POST /admin/posts/{post_id}/confirm-fake

Response:
{
  "success": true,
  "message": "Post marcado como fake, usuario suspendido"
}
```

#### **9. Descartar Reportes**
```http
POST /admin/posts/{post_id}/dismiss-reports

Response:
{
  "success": true,
  "message": "Reportes descartados"
}
```

#### **10. Configurar Umbral**
```http
POST /admin/settings/report-threshold
{
  "threshold": 15
}
```

#### **11. Estadísticas de Reportes**
```http
GET /admin/reports/stats

Response:
{
  "total_reportes": 45,
  "reportes_pendientes": 12,
  "posts_flagged": 3,
  "posts_fake": 1,
  "threshold_actual": 10
}
```

---

## 🚀 Pasos para Implementar

### **1. Ejecutar Migración**
```bash
cd backend
python migrate_ugc_enhanced.py
```

**Resultado esperado:**
```
✅ Tablas creadas
✅ Configuración inicializada
✅ Usuarios de prueba creados
✅ Posts de ejemplo en diferentes estados
```

### **2. Probar Endpoints**

#### **A) Crear publicación (se queda en pending_review):**
```bash
curl -X POST http://localhost:8000/ugc/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "noticia",
    "titulo": "Mi primera noticia",
    "contenido": "Contenido de la noticia..."
  }'
```

#### **B) Admin aprueba:**
```bash
curl -X POST http://localhost:8000/admin/posts/1/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

#### **C) Usuario reporta:**
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

### **3. Verificar en Base de Datos**

```sql
-- Ver posts y sus estados
SELECT id, titulo, estado, total_reportes FROM posts;

-- Ver reportes
SELECT r.id, p.titulo, u.email as reporter, r.motivo, r.comentario 
FROM reports r
JOIN posts p ON r.post_id = p.id
JOIN users u ON r.reporter_id = u.id;

-- Ver notificaciones
SELECT n.titulo, n.mensaje, u.email 
FROM notifications n
JOIN users u ON n.user_id = u.id
ORDER BY n.created_at DESC;

-- Ver configuración
SELECT * FROM system_settings;
```

---

## 🎨 Frontend - Componentes a Crear

### **1. Estado de Publicación (Badge)**
```jsx
// frontend/src/components/UGC/PostStatusBadge.jsx
const getStatusColor = (estado) => {
  switch(estado) {
    case 'pending_review': return '#FFA500';  // Naranja
    case 'published': return '#28a745';       // Verde
    case 'rejected': return '#dc3545';        // Rojo
    case 'flagged': return '#ffc107';         // Amarillo
    case 'fake': return '#6c757d';            // Gris
    default: return '#6c757d';
  }
};
```

### **2. Botón de Reportar**
```jsx
// frontend/src/components/UGC/ReportButton.jsx
<button onClick={() => setShowReportModal(true)}>
  🚩 Reportar
</button>

// Modal con:
// - Select de motivo
// - Textarea de comentario (obligatorio)
// - Botón Enviar
```

### **3. Dashboard Admin - Sección Revisión**
```jsx
// frontend/src/components/Admin/PendingReviewSection.jsx
<div>
  <h3>Publicaciones por Aprobar ({pendingCount})</h3>
  {pendingPosts.map(post => (
    <div key={post.id}>
      <h4>{post.titulo}</h4>
      <p>Por: {post.user_email}</p>
      <p>{post.contenido.substring(0, 150)}...</p>
      <button onClick={() => approvePost(post.id)}>✅ Aprobar</button>
      <button onClick={() => showRejectModal(post.id)}>❌ Rechazar</button>
    </div>
  ))}
</div>
```

### **4. Dashboard Admin - Sección Reportes**
```jsx
// frontend/src/components/Admin/ReportedPostsSection.jsx
<div>
  <h3>Noticias Reportadas ({flaggedCount})</h3>
  {reportedPosts.map(post => (
    <div key={post.id}>
      <h4>{post.titulo}</h4>
      <span>🚩 {post.total_reportes} reportes</span>
      
      <div className="reportes">
        {post.reportes.map(reporte => (
          <div key={reporte.id}>
            <strong>{reporte.reporter_email}:</strong>
            <em>{reporte.motivo}</em>
            <p>{reporte.comentario}</p>
          </div>
        ))}
      </div>
      
      <button onClick={() => confirmFake(post.id)}>
        🚫 Confirmar Fake (Suspender autor)
      </button>
      <button onClick={() => dismissReports(post.id)}>
        ✅ Descartar Reportes
      </button>
    </div>
  ))}
</div>
```

### **5. Configuración de Umbral**
```jsx
// frontend/src/components/Admin/ReportSettingsSection.jsx
<div>
  <h3>⚙️ Configuración de Reportes</h3>
  <label>
    Umbral de reportes para auto-flagging:
    <input 
      type="number" 
      value={threshold} 
      onChange={(e) => setThreshold(e.target.value)}
      min="1"
      max="100"
    />
  </label>
  <button onClick={updateThreshold}>Guardar</button>
  <p>Actual: {currentThreshold} reportes</p>
</div>
```

---

## 📊 Flujo Completo de Prueba

### **Escenario 1: Publicación Normal**
1. Usuario crea publicación → `pending_review`
2. Usuario recibe notificación: "Enviada a revisión"
3. Admin revisa en dashboard
4. Admin aprueba → `published`
5. Usuario recibe notificación: "Aprobada"

### **Escenario 2: Publicación Rechazada**
1. Usuario crea publicación → `pending_review`
2. Admin rechaza con motivo → `rejected`
3. Usuario recibe notificación con motivo

### **Escenario 3: Detección de Fake News**
1. Publicación está `published`
2. Usuario A reporta (1/10)
3. Usuario B reporta (2/10)
4. ...
5. Usuario J reporta (10/10)
6. ¡AUTO-FLAGGING! → `flagged`
7. Autor recibe notificación: "Marcada como sospechosa"
8. Admin revisa reportes y comentarios
9. Admin confirma fake → `fake` + suspensión
10. Autor recibe 2 notificaciones:
    - "Confirmada como falsa"
    - "Cuenta suspendida"

### **Escenario 4: Reportes Infundados**
1. Post tiene 12 reportes → `flagged`
2. Admin revisa
3. Admin descarta reportes → `published`
4. Reportes marcados como `dismissed`

---

## ✅ Checklist de Implementación

### **Backend:**
- [x] Modelos actualizados con estados
- [x] Tabla de reportes con constraint único
- [x] Tabla de notificaciones
- [x] Tabla de configuración
- [x] Script de migración
- [x] Servicio de notificaciones
- [x] Servicio de reportes
- [ ] Endpoints en ugc_routes_enhanced.py
- [ ] Integrar en main.py

### **Frontend:**
- [ ] Badge de estado de publicación
- [ ] Botón y modal de reportar
- [ ] Sección "Publicaciones por aprobar"
- [ ] Sección "Noticias reportadas"
- [ ] Configuración de umbral
- [ ] Sistema de notificaciones en header
- [ ] Actualizar MyPosts con estados

---

## 🔐 Seguridad Implementada

1. ✅ **Constraint único:** Un usuario no puede reportar dos veces la misma publicación
2. ✅ **Validación:** No puedes reportar tu propia publicación
3. ✅ **Validación:** Solo se reportan posts `published`
4. ✅ **Comentario obligatorio:** Evita reportes spam
5. ✅ **Suspensión automática:** Al confirmar fake news
6. ✅ **Auditoría completa:** Quién revisó qué y cuándo

---

## 📈 Próximos Pasos

1. **Ejecutar migración:** `python migrate_ugc_enhanced.py`
2. **Crear endpoints restantes** (ver sección siguiente)
3. **Crear componentes de frontend**
4. **Probar flujo completo**
5. **Ajustar umbrales según uso real**

---

**¡Sistema UGC con revisión, reportes y detección de fake news listo!** 🎉

