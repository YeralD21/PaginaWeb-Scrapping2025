# 🔍 Debug: Imagen en Vista Previa

## ✅ Cambios Implementados para Debug

### **Mejoras Agregadas:**
- ✅ **Indicador de debug** en la vista previa
- ✅ **Logging mejorado** en consola
- ✅ **Fallback a imagePreview** si imagenUrl no está disponible
- ✅ **Placeholder visual** cuando no hay imagen
- ✅ **Validación mejorada** para mostrar vista previa

---

## 🔍 Cómo Debuggear

### **Paso 1: Abrir Consola del Navegador**
1. Presiona `F12` o `Ctrl+Shift+I`
2. Ve a la pestaña **"Console"**

### **Paso 2: Probar el Flujo Completo**
1. **Seleccionar "📰 Noticia"**
2. **Llenar campos** (título, descripción, contenido)
3. **Seleccionar imagen** desde tu PC
4. **En el editor:**
   - Ajustar área de recorte
   - Click "✅ Guardar Imagen"
5. **Ver mensajes en consola:**
   - "Imagen editada recibida: [File object]"
   - "Preview de imagen creado: data:image/jpeg;base64..."
   - "Imagen subida exitosamente: /uploads/images/..."

### **Paso 3: Verificar Vista Previa**
1. **Click "👁️ Ver Vista Previa"**
2. **Ver indicador de debug:**
   ```
   🔍 Debug: imagenUrl=Sí, imagePreview=Sí
   ```
3. **Verificar que la imagen se muestra**

---

## 🎯 Posibles Problemas y Soluciones

### **Problema 1: imagenUrl=No, imagePreview=No**
**Causa:** La imagen no se subió correctamente
**Solución:**
1. Verificar que el backend esté corriendo
2. Revisar errores en la consola
3. Verificar que el endpoint `/ugc/upload-image` funcione

### **Problema 2: imagenUrl=No, imagePreview=Sí**
**Causa:** La imagen se procesó pero no se subió al servidor
**Solución:**
1. Verificar conexión con el backend
2. Revisar errores de red en la pestaña "Network"
3. Verificar autenticación (token válido)

### **Problema 3: imagenUrl=Sí, imagePreview=No**
**Causa:** La imagen se subió pero el preview no se creó
**Solución:**
1. Verificar que el FileReader funcione
2. Revisar errores en la consola
3. Probar con una imagen más pequeña

### **Problema 4: imagenUrl=Sí, imagePreview=Sí pero no se ve**
**Causa:** Error en la URL o problema de CORS
**Solución:**
1. Verificar que la URL sea correcta
2. Revisar errores de carga de imagen
3. Verificar que el endpoint `/uploads/images/{filename}` funcione

---

## 🔧 Verificaciones Técnicas

### **1. Verificar Backend:**
```bash
# Verificar que el backend esté corriendo
curl http://localhost:8000/health

# Verificar endpoint de subida
curl -X POST http://localhost:8000/ugc/upload-image
```

### **2. Verificar Archivos:**
```bash
# Verificar que el directorio de uploads existe
ls -la backend/uploads/images/

# Verificar permisos
chmod 755 backend/uploads/images/
```

### **3. Verificar Consola del Navegador:**
- **Console:** Buscar errores de JavaScript
- **Network:** Verificar solicitudes HTTP
- **Application:** Verificar localStorage/sessionStorage

---

## 📋 Checklist de Debug

### **Backend:**
- [ ] Backend corriendo en puerto 8000
- [ ] Endpoint `/ugc/upload-image` disponible
- [ ] Endpoint `/uploads/images/{filename}` disponible
- [ ] Directorio `backend/uploads/images/` existe
- [ ] Permisos de escritura en el directorio

### **Frontend:**
- [ ] Token de autenticación válido
- [ ] API_BASE configurado correctamente
- [ ] No hay errores de CORS
- [ ] FileReader funciona correctamente
- [ ] Estados de React se actualizan

### **Imagen:**
- [ ] Archivo es una imagen válida
- [ ] Tamaño menor a 5MB
- [ ] Formato soportado (JPG, PNG, GIF, etc.)
- [ ] No está corrupta

---

## 🎨 Interfaz de Debug

### **Indicador de Debug:**
```
🔍 Debug: imagenUrl=Sí, imagePreview=Sí
```

### **Placeholder de Imagen:**
```
┌─────────────────────────────────┐
│                                 │
│        🖼️ No hay imagen        │
│        seleccionada             │
│                                 │
└─────────────────────────────────┘
```

### **Mensajes de Consola:**
```
Imagen editada recibida: File {name: "optimized-image.jpg", ...}
Preview de imagen creado: data:image/jpeg;base64...
Imagen subida exitosamente: /uploads/images/uuid-filename.jpg
Imagen cargada exitosamente: /uploads/images/uuid-filename.jpg
```

---

## 🚀 Para Aplicar los Cambios

### **Paso 1: Reiniciar Backend**
```powershell
cd backend
python main.py
```

### **Paso 2: Refrescar Frontend**
- Presiona `F5` en el navegador

### **Paso 3: Probar Flujo Completo**
1. Crear noticia con imagen
2. Ver mensajes en consola
3. Verificar vista previa
4. Reportar resultados

---

## 📞 Reportar Problemas

Si el problema persiste, proporcionar:

1. **Mensajes de consola** (copiar y pegar)
2. **Indicador de debug** (imagenUrl=Sí/No, imagePreview=Sí/No)
3. **Errores de red** (pestaña Network)
4. **Tipo de imagen** (formato, tamaño)
5. **Pasos exactos** que seguiste

---

¡Con estos cambios podremos identificar exactamente dónde está el problema! 🔍✨
