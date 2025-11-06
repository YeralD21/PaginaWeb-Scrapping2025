# 📸 Subida de Imágenes - Instrucciones

## ✅ Cambios Implementados

### **Backend:**
- ✅ Endpoint `POST /ugc/upload-image` para subir archivos
- ✅ Endpoint `GET /uploads/images/{filename}` para servir imágenes
- ✅ Validación de tipo de archivo (solo imágenes)
- ✅ Validación de tamaño (máx. 5MB)
- ✅ Nombres únicos con UUID
- ✅ Directorio `backend/uploads/images/` creado

### **Frontend:**
- ✅ Input de tipo `file` en lugar de URL
- ✅ Preview de imagen automático
- ✅ Subida automática al seleccionar archivo
- ✅ Estados de carga y error
- ✅ Información de tamaño del archivo

---

## 🚀 Cómo Aplicar los Cambios

### **Paso 1: Reiniciar Backend**
```powershell
cd backend
python main.py
```

### **Paso 2: Refrescar Frontend**
- Presiona `F5` en el navegador

---

## 🎯 Cómo Usar

### **Crear Noticia con Imagen:**

1. **Iniciar sesión** como usuario
2. **Ir a "Crear Publicación"**
3. **Seleccionar "📰 Noticia"**
4. **Llenar campos obligatorios:**
   - Título de la Noticia *
   - Descripción Breve *
   - Contenido Completo *
5. **Para la imagen:**
   - Hacer clic en **"Seleccionar archivo"**
   - Elegir imagen desde tu PC/laptop
   - **La imagen se sube automáticamente**
   - Verás preview y confirmación
6. **Llenar campo opcional:**
   - Fuente (opcional)
7. **Click en "🚀 Publicar"**

---

## 📋 Características

### **Tipos de Archivo Permitidos:**
- ✅ JPG/JPEG
- ✅ PNG
- ✅ GIF
- ✅ WebP
- ✅ BMP

### **Límites:**
- 📏 **Tamaño máximo:** 5MB
- 🔒 **Solo imágenes** (validación automática)

### **Funcionalidades:**
- 🖼️ **Preview automático** al seleccionar
- ⚡ **Subida automática** (no necesitas hacer clic en "subir")
- 📊 **Información de tamaño** en KB
- ✅ **Confirmación visual** de subida exitosa
- ❌ **Manejo de errores** con mensajes claros

---

## 🔍 Verificar en Swagger

1. Ir a: http://localhost:8000/docs
2. Buscar `POST /ugc/upload-image`
3. Click en "Try it out"
4. Seleccionar archivo de imagen
5. Execute
6. ✅ Debería retornar:
   ```json
   {
     "success": true,
     "image_url": "/uploads/images/uuid-filename.jpg",
     "filename": "uuid-filename.jpg",
     "size": 123456
   }
   ```

---

## 📁 Estructura de Archivos

```
backend/
├── uploads/
│   └── images/
│       ├── .gitignore
│       ├── uuid1.jpg
│       ├── uuid2.png
│       └── ...
└── ...
```

**Nota:** Las imágenes se guardan con nombres únicos (UUID) para evitar conflictos.

---

## 🎨 Interfaz de Usuario

### **Antes (URL):**
```
[URL de Imagen]
[Input text: https://ejemplo.com/imagen.jpg]
```

### **Después (Archivo):**
```
[Imagen de la Noticia]
[Seleccionar archivo] [Botón azul]
✅ Imagen subida exitosamente (245.3 KB)
[Preview de la imagen]
```

---

## ⚠️ Troubleshooting

### **Error: "Solo se permiten archivos de imagen"**
- **Causa:** Archivo no es una imagen
- **Solución:** Seleccionar archivo JPG, PNG, GIF, etc.

### **Error: "El archivo es demasiado grande"**
- **Causa:** Archivo > 5MB
- **Solución:** Comprimir imagen o usar una más pequeña

### **Error: "Network Error"**
- **Causa:** Backend no está corriendo
- **Solución:** Verificar que `python main.py` esté ejecutándose

### **No se ve el preview**
- **Causa:** Archivo corrupto o no es imagen válida
- **Solución:** Probar con otra imagen

---

## 🔒 Seguridad

- ✅ **Validación de tipo MIME** en backend
- ✅ **Límite de tamaño** (5MB)
- ✅ **Nombres únicos** (UUID) para evitar conflictos
- ✅ **Autenticación requerida** para subir
- ✅ **Solo usuarios logueados** pueden subir

---

## 📈 Próximas Mejoras (Opcional)

- 🖼️ **Redimensionamiento automático** de imágenes grandes
- 🎨 **Filtros y efectos** básicos
- 📱 **Optimización para móviles**
- 🗂️ **Galería de imágenes** del usuario
- 🏷️ **Etiquetas automáticas** con IA
- 📊 **Estadísticas de uso** de imágenes

---

¡Listo! Ahora puedes subir imágenes directamente desde tu PC al crear noticias. 📸✨
