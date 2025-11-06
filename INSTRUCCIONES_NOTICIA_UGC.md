# 📰 Nuevo Tipo de Contenido: NOTICIA

## ✅ Cambios Realizados

### **1. Backend - Modelo de Datos**
- ✅ Agregado enum `NOTICIA` en `TipoContenido`
- ✅ Agregadas columnas a la tabla `posts`:
  - `titulo` - Título de la noticia
  - `descripcion` - Descripción breve (máx. 200 chars)
  - `imagen_url` - URL de la imagen de portada
  - `fuente` - Fuente o medio de la noticia

### **2. Backend - API**
- ✅ Actualizado `PostCreate` schema para aceptar campos adicionales
- ✅ Actualizado `PostResponse` schema para retornar campos adicionales
- ✅ Actualizado endpoint `POST /ugc/create` para procesar campos de noticia

### **3. Frontend - Formulario**
- ✅ Agregada opción "📰 Noticia" en el selector de tipo
- ✅ Formulario dinámico que muestra campos adicionales cuando se selecciona "Noticia":
  - **Título** (obligatorio)
  - **Descripción Breve** (obligatoria, máx. 200 caracteres con contador)
  - **URL de Imagen** (opcional)
  - **Fuente** (opcional)
  - **Contenido Completo** (obligatorio, área más grande)

---

## 🚀 Cómo Aplicar los Cambios

### **Paso 1: Actualizar Base de Datos**
```powershell
cd backend
python fix_users_table.py
```

Esto agregará las columnas: `descripcion`, `imagen_url`, `fuente` a la tabla `posts`.

---

### **Paso 2: Reiniciar Backend**
```powershell
# Detener el backend actual (Ctrl + C)
# Luego reiniciar:
python main.py
```

Verifica en los logs:
```
✅ Módulo UGC Mejorado cargado correctamente (con revisión y reportes)
```

---

### **Paso 3: Refrescar Frontend**
- Presiona `F5` en el navegador
- O reinicia el servidor de desarrollo si es necesario

---

## 🎯 Cómo Usar

### **Crear una Noticia:**

1. Iniciar sesión como usuario
2. Ir a "Crear Publicación"
3. Seleccionar **"📰 Noticia"** en Tipo de Contenido
4. **Aparecerán nuevos campos:**
   - **Título de la Noticia** * (obligatorio)
   - **Descripción Breve** * (obligatorio, máx. 200 chars con contador)
   - **URL de Imagen** (opcional)
   - **Fuente** (opcional)
   - **Contenido Completo de la Noticia** * (obligatorio)
5. Llenar todos los campos
6. Click en "🚀 Publicar"

---

## 📋 Ejemplo de Noticia

### **Datos a Ingresar:**

**Tipo:** Noticia

**Título:**
```
Nueva ley de educación universitaria aprobada en el Congreso
```

**Descripción Breve:**
```
El Congreso aprobó una reforma educativa que beneficiará a más de 500,000 estudiantes universitarios con becas y mejoras en infraestructura.
```

**URL de Imagen:**
```
https://picsum.photos/800/400
```

**Fuente:**
```
El Comercio
```

**Contenido Completo:**
```
Lima, 12 de octubre de 2025 - El Congreso de la República aprobó hoy con 95 votos a favor 
la nueva Ley de Educación Universitaria que promete revolucionar el sistema educativo 
superior del país.

La reforma incluye un presupuesto de 500 millones de soles destinados a:
- Becas completas para estudiantes de bajos recursos
- Mejora de infraestructura en universidades públicas
- Programas de intercambio internacional
- Investigación científica y tecnológica

El ministro de Educación, Juan Pérez, celebró la aprobación señalando que "esta es una 
victoria histórica para la educación peruana y abre las puertas a miles de jóvenes 
que sueñan con una educación superior de calidad".

La ley entrará en vigencia el 1 de enero de 2026.
```

---

## 📊 Campos de la Tabla Posts

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `tipo` | enum | ✅ Sí | Tipo de contenido (noticia, texto, video, etc.) |
| `titulo` | string(255) | ⚠️ Solo para noticia | Título de la publicación |
| `descripcion` | text | ⚠️ Solo para noticia | Resumen breve (máx. 200 chars) |
| `imagen_url` | string(500) | ❌ No | URL de imagen de portada |
| `fuente` | string(255) | ❌ No | Fuente o medio |
| `contenido` | text | ✅ Sí | Contenido completo |
| `estado` | enum | ✅ Sí | Estado de la publicación (pending_review, published, etc.) |

---

## 🔍 Verificar en Swagger

1. Ir a: http://localhost:8000/docs
2. Buscar `POST /ugc/create`
3. Click en "Try it out"
4. Ver el schema - debería incluir:
   ```json
   {
     "tipo": "noticia",
     "titulo": "string",
     "contenido": "string",
     "descripcion": "string",
     "imagen_url": "string",
     "fuente": "string"
   }
   ```

---

## ✅ Checklist de Verificación

- [ ] Backend actualizado con nuevas columnas
- [ ] `fix_users_table.py` ejecutado exitosamente
- [ ] Backend reiniciado sin errores
- [ ] Frontend muestra opción "📰 Noticia"
- [ ] Al seleccionar "Noticia", aparecen campos adicionales:
  - [ ] Título de la Noticia
  - [ ] Descripción Breve (con contador de caracteres)
  - [ ] URL de Imagen
  - [ ] Fuente
  - [ ] Contenido Completo (área más grande)
- [ ] Puedes crear una noticia de prueba
- [ ] La noticia se guarda con estado "pending_review"
- [ ] Admin puede ver la noticia en "Publicaciones por aprobar"

---

## 🎨 Características del Formulario

### **Cuando seleccionas "Noticia":**

1. **Formulario expandido** - Muestra 5 campos en lugar de 1
2. **Validación visual** - Campos obligatorios marcados con *
3. **Contador de caracteres** - En descripción breve (0/200)
4. **Área de texto más grande** - Para contenido completo (200px vs 120px)
5. **Placeholders descriptivos** - Ayudan al usuario
6. **Campos opcionales** - Imagen y fuente no son obligatorios

---

## 💡 Próximas Mejoras (Opcional)

- 📸 Subir imagen en lugar de URL
- 🏷️ Categorías de noticias (política, economía, deportes, etc.)
- 🔗 Múltiples enlaces relacionados
- 📅 Fecha de publicación original
- 👤 Autor de la noticia
- 🌍 Ubicación geográfica
- #️⃣ Hashtags o etiquetas

---

¡Listo! Ahora los usuarios pueden crear noticias completas con toda la información necesaria. 📰✨
