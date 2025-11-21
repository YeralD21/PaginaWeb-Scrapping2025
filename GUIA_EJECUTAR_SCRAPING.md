# Guía: Cómo Ejecutar el Scraping desde el Backend

## 📋 Resumen

Para que las noticias scrapeadas se **guarden automáticamente en la base de datos** y aparezcan en tu frontend, necesitas ejecutar el scraping **desde el backend**, no directamente desde el script de Python.

---

## 🚀 Paso 1: Iniciar el Backend

### Opción A: Desde PowerShell (Windows)

```powershell
# Navegar al directorio del backend
cd backend

# Activar el entorno virtual (si lo tienes)
.\venv\Scripts\Activate.ps1

# Iniciar el servidor FastAPI
python main.py
```

### Opción B: Desde CMD (Windows)

```cmd
cd backend
venv\Scripts\activate
python main.py
```

### Opción C: Con uvicorn directamente

```powershell
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**✅ El backend debería iniciarse en:** `http://localhost:8000`

---

## 📡 Paso 2: Ejecutar el Scraping

Una vez que el backend esté corriendo, tienes varias opciones para ejecutar el scraping:

### **Opción 1: Usando Invoke-WebRequest (PowerShell) - RECOMENDADO**

```powershell
# Desde otra terminal PowerShell
Invoke-WebRequest -Uri http://localhost:8000/scraping/ejecutar -Method POST
```

**Para ver la respuesta en formato JSON:**
```powershell
$response = Invoke-WebRequest -Uri http://localhost:8000/scraping/ejecutar -Method POST
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### **Opción 2: Usando curl.exe (si está instalado)**

```powershell
# Usar curl.exe explícitamente (no el alias de PowerShell)
curl.exe -X POST http://localhost:8000/scraping/ejecutar
```

### **Opción 3: Usando Postman**

1. Abre Postman
2. Crea una nueva petición
3. Método: **POST**
4. URL: `http://localhost:8000/scraping/ejecutar`
5. Haz clic en **Send**

### **Opción 4: Desde el navegador (solo verificación)**

Abre en tu navegador:
```
http://localhost:8000/docs
```

Busca el endpoint `/scraping/ejecutar` y haz clic en "Try it out" → "Execute"

### **Opción 5: Script Python simple**

Crea un archivo `ejecutar_scraping.py`:

```python
import requests

response = requests.post("http://localhost:8000/scraping/ejecutar")
print("Status:", response.status_code)
print("Resultado:", response.json())
```

Ejecuta:
```powershell
python ejecutar_scraping.py
```

---

## 📊 Respuesta del Endpoint

Cuando ejecutes el scraping, recibirás una respuesta JSON como esta:

```json
{
  "success": true,
  "total_extracted": 150,
  "total_saved": 120,
  "duplicates_detected": 30,
  "alerts_triggered": 5,
  "duration_seconds": 180
}
```

**Campos importantes:**
- `total_extracted`: Total de noticias scrapeadas
- `total_saved`: Noticias guardadas en la BD (después de filtrar duplicados)
- `duplicates_detected`: Noticias duplicadas que no se guardaron
- `duration_seconds`: Tiempo que tardó el scraping

---

## ✅ Paso 3: Verificar en el Frontend

Después de ejecutar el scraping:

1. **Abre tu frontend:** `http://localhost:3000`
2. **Ve a CNN:** `http://localhost:3000/diario/cnn-en-espa%C3%B1ol`
3. **Las noticias deberían aparecer automáticamente** desde la base de datos

---

## 🔍 Verificar Noticias en la Base de Datos

### Opción 1: Desde el Backend API

```powershell
# Ver todas las noticias de CNN
curl http://localhost:8000/noticias?diario=CNN%20en%20Espa%C3%B1ol
```

### Opción 2: Desde la documentación interactiva

Abre: `http://localhost:8000/docs`

Busca el endpoint `GET /noticias` y prueba con:
- `diario`: `CNN en Español`

---

## ⚙️ Configuración Avanzada

### Ejecutar solo scraping de CNN

El endpoint `/scraping/ejecutar` ejecuta **TODOS los diarios** (Correo, Comercio, Popular, CNN).

Si quieres ejecutar solo CNN, puedes modificar temporalmente el código o crear un endpoint específico.

### Ver logs del scraping

Los logs aparecen en la terminal donde ejecutaste `python main.py`. Verás:
- Progreso del scraping
- Noticias encontradas
- Errores (si los hay)

---

## 🐛 Solución de Problemas

### Error: "Connection refused"

**Problema:** El backend no está corriendo.

**Solución:**
```powershell
cd backend
python main.py
```

### Error: "Module not found"

**Problema:** Faltan dependencias.

**Solución:**
```powershell
cd backend
pip install -r requirements.txt
```

### Error: "Database connection failed"

**Problema:** PostgreSQL no está corriendo o la configuración es incorrecta.

**Solución:** Verifica tu archivo `.env` en el directorio `backend` y asegúrate de que PostgreSQL esté corriendo.

---

## 📝 Resumen de Comandos Rápidos

```powershell
# 1. Iniciar backend (Terminal 1)
cd backend
python main.py

# 2. Ejecutar scraping (Terminal 2)
curl -X POST http://localhost:8000/scraping/ejecutar

# 3. Ver noticias de CNN
curl http://localhost:8000/noticias?diario=CNN%20en%20Espa%C3%B1ol
```

---

## 🎯 Flujo Completo

```
1. Backend corriendo (puerto 8000)
   ↓
2. Ejecutar: POST /scraping/ejecutar
   ↓
3. Scraping ejecuta todos los diarios (incluyendo CNN con Selenium)
   ↓
4. Noticias se guardan en PostgreSQL
   ↓
5. Frontend consulta la BD y muestra las noticias
   ↓
6. ✅ Noticias visibles en http://localhost:3000/diario/cnn-en-espa%C3%B1ol
```

---

## 💡 Tips

- **El scraping puede tardar varios minutos** (especialmente CNN con Selenium)
- **No cierres la terminal** donde está corriendo el backend mientras se ejecuta el scraping
- **Los duplicados se detectan automáticamente** y no se guardan
- **Puedes ejecutar el scraping múltiples veces** sin problemas (los duplicados se filtran)

