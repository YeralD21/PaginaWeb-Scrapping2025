# 🔐 Sistema de Autenticación UGC - Guía de Prueba

## 📋 Resumen

Se ha integrado exitosamente un sistema de autenticación completo en tu frontend React que se conecta con el backend UGC. Los usuarios pueden registrarse, iniciar sesión, y acceder a dashboards específicos según su rol.

---

## ✅ Componentes Implementados

### **1. Contexto de Autenticación**
- **Archivo:** `frontend/src/contexts/AuthContext.js`
- **Funcionalidad:** Maneja el estado global de autenticación, tokens JWT, y funciones de login/logout

### **2. Componentes de UI**
- **LoginModal:** `frontend/src/components/Auth/LoginModal.jsx`
- **RegisterModal:** `frontend/src/components/Auth/RegisterModal.jsx`
- **AuthNavbar:** `frontend/src/components/Auth/AuthNavbar.jsx`

### **3. Integración en App Principal**
- **Archivo:** `frontend/src/App.js`
- **Cambios:** Header modificado para incluir botones de autenticación en la parte superior derecha

---

## 🎨 Diseño Visual

### **Botones en Header:**
- **Login:** Fondo rojo (#D32F2F), texto blanco, bordes redondeados
- **Registrarse:** Fondo azul (#1976D2), texto blanco, mismo estilo
- **Posición:** Parte superior derecha del header

### **Modales:**
- **Diseño:** Modales centrados con backdrop blur
- **Animaciones:** Transiciones suaves de entrada/salida
- **Validación:** Formularios con validación en tiempo real

### **Menú de Usuario:**
- **Avatar:** Círculo con inicial del email
- **Dropdown:** Menú desplegable con opciones según rol
- **Logout:** Botón rojo para cerrar sesión

---

## 🚀 Flujo de Prueba Completo

### **Paso 1: Iniciar el Sistema**

```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend  
cd frontend
npm start
```

**Verificar que ambos estén corriendo:**
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

---

### **Paso 2: Probar Registro de Usuario**

1. **Abrir navegador:** http://localhost:3000
2. **Hacer clic en "Registrarse"** (botón azul en la parte superior derecha)
3. **Completar formulario:**
   - Email: `test@example.com`
   - Contraseña: `test123` (mínimo 6 caracteres)
   - Confirmar contraseña: `test123`
4. **Hacer clic en "Crear Cuenta"**
5. **Resultado esperado:** Mensaje de éxito y redirección automática al modal de login

---

### **Paso 3: Probar Login de Usuario**

1. **En el modal de login** (o hacer clic en "Login" si se cerró)
2. **Completar credenciales:**
   - Email: `test@example.com`
   - Contraseña: `test123`
3. **Hacer clic en "Iniciar Sesión"**
4. **Resultado esperado:** 
   - Mensaje de éxito
   - Redirección automática a `/user-dashboard`
   - Header muestra avatar del usuario y botón "Logout"

---

### **Paso 4: Probar Dashboard de Usuario**

1. **Verificar que estás en:** http://localhost:3000/user-dashboard
2. **Funcionalidades disponibles:**
   - Crear nuevos posts
   - Ver "Mis Posts" con métricas
   - Navegar por el feed UGC
3. **Probar crear un post:**
   - Hacer clic en "Crear Post"
   - Seleccionar tipo: "Texto"
   - Escribir contenido: "Mi primer post de prueba"
   - Hacer clic en "Crear Post"

---

### **Paso 5: Probar Login como Admin**

1. **Hacer clic en "Logout"** en el header
2. **Hacer clic en "Login"**
3. **Usar credenciales de admin:**
   - Email: `admin@ugc.com`
   - Contraseña: `admin123`
4. **Resultado esperado:**
   - Redirección automática a `/admin-dashboard`
   - Header muestra "ADMIN" como rol
   - Acceso a dashboard administrativo

---

### **Paso 6: Probar Dashboard de Admin**

1. **Verificar que estás en:** http://localhost:3000/admin-dashboard
2. **Funcionalidades disponibles:**
   - Ver estadísticas generales
   - Lista de usuarios registrados
   - Ganancias totales y distribución
   - Simular interacciones para generar ingresos

---

### **Paso 7: Probar Navegación**

1. **Desde el header, hacer clic en el avatar del usuario**
2. **Verificar opciones del menú:**
   - "Mi Dashboard" (para usuarios) / "Dashboard Admin" (para admin)
   - "Feed UGC"
3. **Probar navegación entre secciones**
4. **Verificar que el estado de autenticación se mantiene**

---

### **Paso 8: Probar Logout**

1. **Hacer clic en "Logout"** (botón rojo)
2. **Resultado esperado:**
   - Redirección a página principal
   - Header vuelve a mostrar botones "Login" y "Registrarse"
   - Token eliminado del localStorage

---

## 🔧 Credenciales de Prueba

### **Usuarios Creados por Migración:**
| Email | Password | Rol | Dashboard |
|-------|----------|-----|-----------|
| `admin@ugc.com` | `admin123` | ADMIN | `/admin-dashboard` |
| `user1@test.com` | `user123` | USER | `/user-dashboard` |
| `user2@test.com` | `user123` | USER | `/user-dashboard` |
| `user3@test.com` | `user123` | USER | `/user-dashboard` |

### **Usuarios Nuevos:**
- Cualquier email válido que registres
- Contraseña: mínimo 6 caracteres con al menos 1 letra y 1 número

---

## 🛠️ Endpoints del Backend Utilizados

### **Autenticación:**
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/me` - Obtener información del usuario actual

### **UGC:**
- `POST /ugc/create` - Crear nuevo post
- `GET /ugc/my-posts` - Obtener posts del usuario
- `GET /ugc/feed` - Obtener feed público

### **Admin:**
- `GET /admin/users` - Lista de usuarios
- `GET /admin/dashboard` - Estadísticas administrativas

---

## 🎯 Rutas del Frontend

### **Públicas:**
- `/` - Página principal de noticias
- `/diario/*` - Páginas de diarios específicos
- `/comparativa` - Comparativa de diarios
- `/alertas` - Sistema de alertas
- `/buscar` - Búsqueda avanzada
- `/analytics` - Dashboard de analytics
- `/trending` - Noticias trending
- `/filtro-fechas` - Filtro por fechas

### **Protegidas (requieren autenticación):**
- `/user-dashboard` - Dashboard de usuario UGC
- `/admin-dashboard` - Dashboard de administrador
- `/ugc-feed` - Feed de contenido UGC

---

## 🔍 Verificaciones Técnicas

### **1. Verificar Token en localStorage:**
```javascript
// En DevTools del navegador
localStorage.getItem('access_token')
// Debe devolver un JWT válido cuando estés logueado
```

### **2. Verificar Estado de Autenticación:**
```javascript
// En DevTools del navegador
// El contexto AuthContext debe estar disponible
```

### **3. Verificar Redirecciones:**
- Login exitoso → Dashboard según rol
- Logout → Página principal
- Acceso sin autenticación → Página principal

---

## 🐛 Troubleshooting

### **Error: "No se pudieron validar las credenciales"**
- **Causa:** Token expirado o inválido
- **Solución:** Hacer logout y login nuevamente

### **Error: "Módulo UGC no disponible"**
- **Causa:** Backend no tiene las rutas UGC cargadas
- **Solución:** Verificar que `main.py` tenga las rutas UGC integradas

### **Error: "Network Error"**
- **Causa:** Backend no está corriendo
- **Solución:** Iniciar backend con `python main.py`

### **Error: "CORS Error"**
- **Causa:** Configuración CORS incorrecta
- **Solución:** Verificar que el backend permita `http://localhost:3000`

---

## 📊 Funcionalidades Implementadas

### ✅ **Completadas:**
- [x] Botones Login/Registrarse en header
- [x] Modales de autenticación con validación
- [x] Contexto de autenticación global
- [x] Redirección automática según rol
- [x] Menú de usuario con dropdown
- [x] Integración con dashboards UGC existentes
- [x] Manejo de tokens JWT
- [x] Logout funcional

### 🔄 **Flujo Completo:**
1. **Registro** → Validación → Redirección a Login
2. **Login** → Autenticación → Redirección a Dashboard
3. **Dashboard** → Crear posts → Ver métricas
4. **Admin** → Ver estadísticas → Gestionar usuarios
5. **Logout** → Limpiar estado → Volver a inicio

---

## 🎉 Resultado Final

**¡Sistema de autenticación completamente funcional!**

- ✅ **UI/UX:** Botones integrados en header existente
- ✅ **Funcionalidad:** Login, registro, logout, redirección
- ✅ **Seguridad:** Tokens JWT, validación de formularios
- ✅ **Integración:** Conectado con backend UGC existente
- ✅ **Navegación:** React Router configurado
- ✅ **Roles:** Diferentes dashboards para USER/ADMIN

**El usuario puede ahora:**
1. Registrarse en la plataforma
2. Iniciar sesión con sus credenciales
3. Acceder a su dashboard personalizado
4. Crear contenido UGC
5. Ver métricas y ganancias
6. Cerrar sesión de forma segura

---

**¡Listo para probar! 🚀**
