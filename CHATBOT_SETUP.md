# 🤖 Configuración del ChatBot

El ChatBot está integrado en todas las secciones principales de la aplicación y puede responder preguntas sobre las noticias usando:
1. **Búsqueda en base de datos** (prioridad alta)
2. **LLM (OpenRouter u Ollama)** (cuando no hay coincidencia en BD)
3. **Respuestas predefinidas** (fallback)

## 📍 Ubicaciones del ChatBot

El ChatBot aparece automáticamente en:
- ✅ Menú Principal (`/`)
- ✅ Noticias Premium (`/premium`)
- ✅ El Comercio (`/diario/el-comercio`)
- ✅ Diario Correo (`/diario/diario-correo`)
- ✅ El Popular (`/diario/el-popular`)
- ✅ CNN en Español (`/diario/cnn-en-español`)

## 🔧 Configuración del Backend

### 🚀 Método Rápido: Script de Configuración

Ejecuta el script de ayuda para configurar las variables de entorno fácilmente:

```bash
cd backend
python setup_chatbot_env.py
```

Este script te guiará paso a paso para:
- Obtener tu API Key de OpenRouter
- Configurar Ollama (si lo prefieres)
- Guardar las variables en un archivo `.env`

### Opción 1: Usar OpenRouter (Recomendado)

**Paso 1: Obtener tu API Key**

1. Visita [https://openrouter.ai/](https://openrouter.ai/)
2. Haz clic en **"Sign Up"** para crear una cuenta (es gratis)
3. Una vez registrado, ve a [https://openrouter.ai/keys](https://openrouter.ai/keys)
4. Haz clic en **"Create Key"**
5. **Copia la API key** (solo se muestra una vez)

**💡 OpenRouter ofrece créditos gratuitos para empezar!**

**Paso 2: Configurar la variable de entorno**

**Windows PowerShell:**
```powershell
$env:OPENROUTER_API_KEY="sk-or-v1-tu-api-key-aqui"
```

**Windows CMD:**
```cmd
set OPENROUTER_API_KEY=sk-or-v1-tu-api-key-aqui
```

**Linux/Mac:**
```bash
export OPENROUTER_API_KEY="sk-or-v1-tu-api-key-aqui"
```

**Para hacerlo permanente (Windows):**
```powershell
[System.Environment]::SetEnvironmentVariable('OPENROUTER_API_KEY', 'sk-or-v1-tu-api-key-aqui', 'User')
```

**Para hacerlo permanente (Linux/Mac):**
Agrega al archivo `~/.bashrc` o `~/.zshrc`:
```bash
export OPENROUTER_API_KEY="sk-or-v1-tu-api-key-aqui"
```

3. Configura el LLM preferido (opcional, por defecto es "openrouter"):

```bash
# Windows PowerShell
$env:PREFERRED_LLM="openrouter"  # o "ollama"

# Linux/Mac
export PREFERRED_LLM="openrouter"  # o "ollama"
```

### Opción 2: Usar Ollama (Local)

1. Instala [Ollama](https://ollama.ai/)
2. Descarga un modelo:

```bash
ollama pull llama2
# o
ollama pull mistral
```

3. Configura las variables de entorno:

```bash
$env:OLLAMA_API_URL="http://localhost:11434/api/generate"
$env:OLLAMA_MODEL="llama2"  # o el modelo que prefieras
$env:PREFERRED_LLM="ollama"
```

### Opción 3: Sin LLM (Solo Base de Datos + Fallback)

Si no configuras ninguna API de LLM, el chatbot funcionará usando:
- ✅ Búsqueda en base de datos
- ✅ Respuestas predefinidas para preguntas comunes

## 📝 Variables de Entorno Disponibles

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `OPENROUTER_API_KEY` | API Key de OpenRouter | "" (vacío) |
| `OLLAMA_API_URL` | URL de la API de Ollama | `http://localhost:11434/api/generate` |
| `OLLAMA_MODEL` | Modelo de Ollama a usar | `llama2` |
| `PREFERRED_LLM` | LLM preferido (`openrouter` o `ollama`) | `openrouter` |

## 🎯 Funcionalidades del ChatBot

### Búsqueda en Base de Datos

El chatbot puede responder automáticamente a preguntas como:
- "¿Cuál fue la noticia más relevante de la última semana?"
- "¿Qué noticias hay sobre política?"
- "¿Cuáles son las noticias más recientes?"
- "¿Qué diarios están disponibles?"
- "¿Qué noticias hay de CNN?" (cuando estás en la sección de CNN)
- Búsqueda por palabras clave en títulos y contenido

### Integración con LLM

Cuando no encuentra información específica en la base de datos, el chatbot usa el LLM configurado para generar respuestas contextuales.

### Respuestas Predefinidas

Para preguntas comunes como saludos o agradecimientos, el chatbot tiene respuestas predefinidas.

## 🧪 Probar el ChatBot

1. Inicia el backend:

```bash
cd backend
python main.py
```

2. Inicia el frontend:

```bash
cd frontend
npm start
```

3. Abre cualquier sección de la aplicación y haz clic en el botón del chatbot (esquina inferior derecha)

4. Prueba preguntas como:
   - "¿Cuál fue la noticia más relevante de la última semana?"
   - "¿Qué noticias hay sobre política?"
   - "¿Qué diarios están disponibles?"

## 🔍 Endpoint de Salud

Puedes verificar el estado del chatbot y los servicios LLM:

```bash
GET http://localhost:8000/chatbot/health
```

Respuesta:
```json
{
  "status": "ok",
  "llm_available": true,
  "llm_provider": "openrouter",
  "database_available": true
}
```

## 📡 API Endpoint

### POST `/chatbot/ask`

Envía una pregunta al chatbot.

**Request:**
```json
{
  "question": "¿Cuál fue la noticia más relevante de la última semana?",
  "context": "premium"  // opcional: "premium", "cnn", "correo", "popular", "comercio"
}
```

**Response:**
```json
{
  "answer": "📰 **Noticias más relevantes de la última semana:**\n\n1. **Título de noticia**\n   📅 15/01/2025 | 📰 El Comercio | 📂 Política\n\n...",
  "source": "database",  // "database", "llm", o "fallback"
  "confidence": 0.9
}
```

## 🎨 Personalización

### Cambiar Preguntas Rápidas

Edita `frontend/src/components/ChatBot.js` y modifica la función `getQuickQuestions()`:

```javascript
const getQuickQuestions = () => {
  // Agrega tus preguntas personalizadas aquí
  return [
    'Tu pregunta personalizada 1',
    'Tu pregunta personalizada 2',
    // ...
  ];
};
```

### Agregar Más Intenciones

Edita `backend/chatbot_routes.py` y agrega nuevas condiciones en `search_news_in_database()`:

```python
if any(word in question_lower for word in ['tu_palabra_clave']):
    return get_news_by_category(db, 'TuCategoria', context)
```

## 🐛 Solución de Problemas

### El chatbot no responde

1. Verifica que el backend esté corriendo
2. Revisa la consola del navegador para errores
3. Verifica el endpoint de salud: `GET /chatbot/health`

### El LLM no funciona

1. Verifica que las variables de entorno estén configuradas
2. Para OpenRouter: verifica que tu API key sea válida
3. Para Ollama: verifica que Ollama esté corriendo (`ollama serve`)

### Respuestas genéricas

Si el chatbot solo da respuestas genéricas, es porque:
- No hay coincidencias en la base de datos
- El LLM no está configurado o no está disponible
- Está usando el fallback

## 📚 Recursos

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Ollama Documentation](https://ollama.ai/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

