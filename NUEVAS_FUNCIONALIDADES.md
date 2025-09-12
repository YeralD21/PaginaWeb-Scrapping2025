# 🚀 NUEVAS FUNCIONALIDADES - SISTEMA DE NOTICIAS

## 📋 **RESUMEN DE MEJORAS IMPLEMENTADAS**

### ✅ **1. DETECCIÓN DE DUPLICADOS AVANZADA**
- **Hash MD5** para títulos y contenido normalizado
- **Similitud de texto** usando SequenceMatcher
- **Ventana de tiempo** configurable (24h por defecto)
- **Detección por enlace** para duplicados exactos
- **Palabras clave** para similitud semántica

### ✅ **2. SISTEMA DE ALERTAS Y NOTIFICACIONES**
- **Alertas automáticas** por palabras clave
- **Niveles de urgencia**: crítica, alta, media, baja
- **Notificaciones por email** y webhook
- **Filtros por categoría** y diario
- **Análisis de sentimientos** automático

### ✅ **3. NUEVOS CAMPOS EN BASE DE DATOS**
- **Metadatos**: autor, tags, tiempo de lectura
- **Análisis**: sentimiento, palabras clave
- **Hashes**: para detección de duplicados
- **Alertas**: nivel de urgencia, keywords

### ✅ **4. NUEVOS ENDPOINTS API**
- **Búsqueda avanzada** de noticias
- **Gestión de alertas** CRUD completo
- **Analytics**: sentimientos, palabras clave
- **Estadísticas** de duplicados y alertas

---

## 🛠️ **INSTALACIÓN Y MIGRACIÓN**

### **Paso 1: Ejecutar Migración de Base de Datos**
```bash
cd backend
python migrate_database.py
```

### **Paso 2: Configurar Variables de Entorno**
Copiar `env_example.txt` a `.env` y configurar:
```bash
# Email para alertas (opcional)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password_de_aplicacion

# Configuración de duplicados
DUPLICATE_SIMILARITY_THRESHOLD=0.85
DUPLICATE_TIME_WINDOW_HOURS=24
```

### **Paso 3: Instalar Dependencias (si es necesario)**
```bash
pip install difflib  # Para similitud de texto
```

---

## 📡 **NUEVOS ENDPOINTS API**

### **🚨 SISTEMA DE ALERTAS**

#### Crear Alerta
```http
POST /alertas/crear
Content-Type: application/json

{
  "nombre": "Noticias Urgentes",
  "descripcion": "Alertas para emergencias",
  "keywords": ["emergencia", "crisis", "urgente"],
  "categorias": ["Política", "Economía"],
  "nivel_urgencia": "alta",
  "notificar_email": true,
  "email_destino": "admin@ejemplo.com"
}
```

#### Listar Alertas
```http
GET /alertas?activa=true
```

#### Ver Disparos de Alerta
```http
GET /alertas/1/disparos?limit=20
```

### **🔍 BÚSQUEDA AVANZADA**

```http
GET /noticias/buscar?q=economia&categoria=Economía&sentimiento=positivo&limit=50
```

Parámetros disponibles:
- `q`: Término de búsqueda (título y contenido)
- `categoria`: Filtrar por categoría
- `diario`: Filtrar por diario
- `sentimiento`: positivo, negativo, neutral
- `fecha_desde` / `fecha_hasta`: Rango de fechas (YYYY-MM-DD)

### **📈 NOTICIAS TRENDING**

```http
GET /noticias/trending?limit=20&categoria=Deportes
```

### **📊 ANALYTICS**

#### Análisis de Sentimientos
```http
GET /analytics/sentimientos?dias=7
```

#### Palabras Clave Trending
```http
GET /analytics/palabras-clave?dias=7&categoria=Política&limit=20
```

#### Estadísticas de Duplicados
```http
GET /analytics/duplicados?dias=7
```

---

## 🎯 **EJEMPLOS DE USO**

### **1. Crear Alerta para Noticias de Crisis**

```python
import requests

alerta_data = {
    "nombre": "Crisis Nacional",
    "descripcion": "Alertas para situaciones de crisis",
    "keywords": ["crisis", "emergencia", "estado de emergencia", "desastre"],
    "nivel_urgencia": "critica",
    "notificar_email": True,
    "email_destino": "admin@miempresa.com"
}

response = requests.post("http://localhost:8000/alertas/crear", json=alerta_data)
print(response.json())
```

### **2. Buscar Noticias sobre Economía Positiva**

```python
params = {
    "q": "crecimiento económico",
    "categoria": "Economía", 
    "sentimiento": "positivo",
    "limit": 10
}

response = requests.get("http://localhost:8000/noticias/buscar", params=params)
noticias = response.json()

for noticia in noticias:
    print(f"📰 {noticia['titulo']}")
    print(f"😊 Sentimiento: {noticia['sentimiento']}")
    print(f"⏱️ Tiempo lectura: {noticia['tiempo_lectura_min']} min")
    print("---")
```

### **3. Obtener Estadísticas de la Semana**

```python
# Análisis de sentimientos
sentimientos = requests.get("http://localhost:8000/analytics/sentimientos?dias=7").json()
print("📊 Análisis de Sentimientos:", sentimientos)

# Palabras clave trending
keywords = requests.get("http://localhost:8000/analytics/palabras-clave?dias=7").json()
print("🔥 Palabras Trending:", [kw['palabra'] for kw in keywords[:5]])

# Estadísticas de duplicados
duplicados = requests.get("http://localhost:8000/analytics/duplicados?dias=7").json()
print(f"🔄 Duplicados detectados: {duplicados['duplicates_detected']}")
```

---

## ⚙️ **CONFIGURACIÓN AVANZADA**

### **Sistema de Duplicados**
```python
# En duplicate_detector.py, puedes ajustar:
SIMILARITY_THRESHOLD = 0.85  # 85% similitud mínima
TIME_WINDOW_HOURS = 24       # Ventana de 24 horas
```

### **Sistema de Alertas**
```python
# Palabras clave por nivel de urgencia
urgency_keywords = {
    'critica': ['emergencia', 'crisis', 'terremoto', 'tsunami'],
    'alta': ['importante', 'grave', 'manifestacion', 'huelga'],
    'media': ['anuncio', 'decision', 'acuerdo', 'reforma'],
    'baja': ['evento', 'celebracion', 'inauguracion']
}
```

---

## 🔧 **MONITOREO Y MANTENIMIENTO**

### **Verificar Estado del Sistema**
```http
GET /analytics/duplicados?dias=1
GET /analytics/alertas?dias=1
```

### **Ejecutar Scraping Manual**
```http
POST /scraping/ejecutar
```

### **Ver Logs de Alertas**
```bash
# Los logs se guardan en scheduler.log
tail -f scheduler.log | grep "ALERTA"
```

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Problema: No se detectan duplicados**
**Solución:**
1. Verificar que los hashes se estén generando:
```sql
SELECT titulo, titulo_hash FROM noticias WHERE titulo_hash IS NOT NULL LIMIT 5;
```

2. Ejecutar migración de hashes:
```python
python migrate_database.py
```

### **Problema: No llegan emails de alertas**
**Solución:**
1. Verificar configuración en `.env`:
```bash
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password  # No tu contraseña normal
```

2. Habilitar "Contraseñas de aplicación" en Gmail
3. Verificar logs de errores

### **Problema: Muchas alertas falsas**
**Solución:**
1. Ajustar palabras clave más específicas
2. Agregar filtros por categoría/diario
3. Cambiar nivel de urgencia

---

## 📈 **MÉTRICAS Y ESTADÍSTICAS**

El sistema ahora proporciona métricas detalladas:

- **📊 Duplicados detectados**: Evita contenido repetido
- **🚨 Alertas activadas**: Monitoreo en tiempo real
- **😊 Análisis de sentimientos**: Tendencias emocionales
- **🔥 Palabras trending**: Temas populares
- **⏱️ Tiempo de lectura**: Estimación automática
- **🎯 Precisión de filtros**: Mejores resultados

---

## 🎉 **¡LISTO PARA USAR!**

Tu sistema de scraping ahora tiene capacidades avanzadas de:
- ✅ **Detección inteligente de duplicados**
- ✅ **Sistema de alertas en tiempo real**
- ✅ **Análisis automático de sentimientos**
- ✅ **Búsqueda avanzada y filtrado**
- ✅ **Analytics y estadísticas completas**

¡Disfruta de tu sistema mejorado! 🚀
