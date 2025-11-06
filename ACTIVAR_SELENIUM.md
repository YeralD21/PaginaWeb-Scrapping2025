# 🚀 Cómo Activar Scraping REAL con Selenium

## 📋 Estado Actual

Por **defecto**, tu sistema usa **datos MOCK** (de prueba). Esto es:
- ✅ **Rápido** (instantáneo)
- ✅ **Siempre funciona**
- ❌ **Datos de prueba** (no reales de redes sociales)

## 🔄 Activar Selenium para Datos REALES

Selenium puede obtener datos **100% reales** de Facebook y Twitter con imágenes reales.

### **⚠️ IMPORTANTE:**
- ⏱️ **Es MUY LENTO** (2-3 minutos por scraping completo)
- 🐌 **Puede ser bloqueado** por CAPTCHAs
- 💻 **Requiere Chrome** instalado

---

## 🎯 Pasos para Activar

### **Opción 1: En la Terminal (antes de iniciar backend)**

**En PowerShell:**
```powershell
$env:USE_SELENIUM="true"
cd backend
python main.py
```

**En Linux/Mac:**
```bash
export USE_SELENIUM=true
cd backend
python main.py
```

### **Opción 2: Directamente en main.py (permanente)**

Edita `backend/main.py` línea 20:
```python
USE_SELENIUM_ENV = os.getenv('USE_SELENIUM', 'True')  # Cambiar 'False' a 'True'
```

---

## 🧪 Probar Selenium

Una vez activado, verás en la consola del backend:

```
🚀 SELENIUM ACTIVADO - Usando scraping REAL de redes sociales
🚀 Usando Selenium para scraping REAL de redes sociales
```

Cuando hagas clic en "Actualizar Noticias" en "Redes Sociales", verás:

```
🚀 Iniciando navegador Chromium...
🔍 Scrapeando @elcomercio_peru...
📊 Encontrados 11 elementos de tweet
✅ Tweet 1: [TEXTO REAL DEL TWEET]...
```

---

## 📊 Resultados Esperados

Con Selenium activado, obtendrás:

### **Twitter:**
- ✅ Tweets **100% reales**
- ✅ URLs a tweets reales (https://x.com/cuenta/status/...)
- ✅ Imágenes **reales** de los tweets
- ✅ Enlaces funcionando

### **Facebook:**
- ✅ Posts **reales** de las páginas
- ✅ Imágenes **reales** de los posts
- ✅ Enlaces a posts específicos

### **Instagram:**
- ⚠️ Sigue usando MOCK (requiere login)
- ✅ Imágenes variadas y títulos realistas en modo mock

### **YouTube:**
- ✅ Videos **100% reales** con Selenium
- ✅ URLs a videos reales (https://youtube.com/watch?v=...)
- ✅ Imágenes de thumbnails reales
- ✅ Enlaces funcionando
- ✅ Modo mock también disponible

---

## ⚙️ Volver a Modo Mock

Si Selenium es muy lento o no funciona:

```powershell
# NO configures USE_SELENIUM o configúralo como 'false'
$env:USE_SELENIUM="false"  # O simplemente no lo configures
cd backend
python main.py
```

---

## 🐛 Troubleshooting

### Error: "ChromeDriver not found"
**Solución:** Selenium 4.x descarga ChromeDriver automáticamente. Si falla:
```bash
pip install --upgrade selenium
```

### Error: "Timeout waiting for page"
**Solución:** Redes sociales bloquearon tu IP. Espera unos minutos y reintenta.

### No se obtienen datos reales
**Solución:** Facebook/Twitter tienen protecciones anti-bot muy fuertes. Es normal que a veces fallen.

---

## 💡 Recomendación

**Para uso normal:** Deja Selenium **desactivado** (usa mock). Es rápido y funciona siempre.

**Para demostración o testing:** Activa Selenium para mostrar datos reales (pero espera 2-3 minutos).

