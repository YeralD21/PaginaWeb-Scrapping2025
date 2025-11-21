"""
Rutas del ChatBot con integración LLM
Soporta OpenRouter y Ollama con fallback a respuestas predefinidas
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_, and_
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel
import requests
import os
import logging

# Intentar cargar variables de entorno desde .env si existe
try:
    from load_env import load_env_file
    load_env_file()
except ImportError:
    pass  # Si no existe load_env.py, continuar sin él

from database import get_db
from models import Noticia, Diario

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chatbot", tags=["ChatBot"])

# ===== CONFIGURACIÓN LLM =====

# OpenRouter API
# Cargar desde variable de entorno o usar la key por defecto del proyecto
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "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")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Ollama API
OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama2")

# Configuración de LLM preferido
PREFERRED_LLM = os.getenv("PREFERRED_LLM", "openrouter")  # "openrouter" o "ollama"

# ===== SCHEMAS =====

class ChatRequest(BaseModel):
    question: str
    context: Optional[str] = None  # 'premium', 'cnn', 'correo', 'popular', 'comercio', etc.

class ChatResponse(BaseModel):
    answer: str
    source: str  # 'database', 'llm', 'fallback'
    confidence: Optional[float] = None
    suggested_questions: Optional[List[str]] = None  # Preguntas sugeridas para continuar

# ===== FUNCIONES DE BÚSQUEDA EN BASE DE DATOS =====

def search_news_in_database(db: Session, question: str, context: Optional[str] = None) -> Optional[str]:
    """
    Busca noticias en la base de datos basándose en la pregunta
    Retorna una respuesta formateada si encuentra información relevante
    """
    question_lower = question.lower()
    
    # Detectar intenciones específicas
    if any(word in question_lower for word in ['relevante', 'importante', 'destacada', 'última semana']):
        return get_most_relevant_news(db, context)
    
    if any(word in question_lower for word in ['reciente', 'última', 'nueva', 'actual']):
        return get_recent_news(db, context)
    
    if any(word in question_lower for word in ['política', 'político', 'gobierno']):
        return get_news_by_category(db, 'Política', context)
    
    if any(word in question_lower for word in ['deporte', 'deportivo', 'futbol']):
        return get_news_by_category(db, 'Deportes', context)
    
    if any(word in question_lower for word in ['economía', 'económico', 'finanzas']):
        return get_news_by_category(db, 'Economía', context)
    
    if any(word in question_lower for word in ['tecnología', 'tecnológico', 'tecnologia']):
        return get_news_by_category(db, 'Tecnología', context)
    
    if any(word in question_lower for word in ['diario', 'diarios', 'periódico', 'periódicos']):
        return get_available_newspapers(db)
    
    if context:
        # Si hay contexto específico, buscar noticias de ese diario
        return get_news_by_newspaper(db, context)
    
    # Búsqueda por palabras clave en título y contenido
    keywords = extract_keywords(question)
    if keywords:
        return search_news_by_keywords(db, keywords, context)
    
    return None

def get_most_relevant_news(db: Session, context: Optional[str] = None) -> str:
    """Obtiene las noticias más relevantes de la última semana"""
    try:
        fecha_limite = datetime.now() - timedelta(days=7)
        
        query = db.query(Noticia).join(Diario).filter(
            Noticia.fecha_publicacion >= fecha_limite
        )
        
        if context == 'premium':
            # Si el contexto es premium, buscar solo noticias premium
            if hasattr(Noticia, 'es_premium'):
                query = query.filter(Noticia.es_premium == True)
        elif context:
            # Mapear nombres comunes a nombres de diarios
            newspaper_map = {
                'cnn': 'CNN',
                'correo': 'Correo',
                'popular': 'Popular',
                'comercio': 'Comercio'
            }
            search_name = newspaper_map.get(context.lower(), context)
            query = query.filter(Diario.nombre.ilike(f"%{search_name}%"))
        
        noticias = query.order_by(
            desc(Noticia.fecha_publicacion)
        ).limit(5).all()
        
        if not noticias:
            return "No encontré noticias relevantes de la última semana."
        
        respuesta = "📰 **Noticias más relevantes de la última semana:**\n\n"
        for i, noticia in enumerate(noticias, 1):
            fecha = noticia.fecha_publicacion.strftime("%d/%m/%Y") if noticia.fecha_publicacion else "Fecha no disponible"
            # Limitar el título a 80 caracteres para mejor legibilidad
            titulo = noticia.titulo[:80] + "..." if len(noticia.titulo) > 80 else noticia.titulo
            enlace = noticia.enlace if noticia.enlace else f"/noticia/{noticia.id}"
            respuesta += f"{i}. **{titulo}**\n"
            respuesta += f"   📅 {fecha} | 📰 {noticia.diario.nombre} | 📂 {noticia.categoria}\n"
            respuesta += f"   🔗 [Ver noticia completa]({enlace})\n\n"
        
        return respuesta
    except Exception as e:
        logger.error(f"Error obteniendo noticias relevantes: {e}")
        return None

def get_recent_news(db: Session, context: Optional[str] = None) -> str:
    """Obtiene las noticias más recientes"""
    try:
        query = db.query(Noticia).join(Diario).filter(
            Noticia.fecha_publicacion.isnot(None)
        )
        
        if context == 'premium':
            # Si el contexto es premium, buscar solo noticias premium
            if hasattr(Noticia, 'es_premium'):
                query = query.filter(Noticia.es_premium == True)
        elif context:
            # Mapear nombres comunes a nombres de diarios
            newspaper_map = {
                'cnn': 'CNN',
                'correo': 'Correo',
                'popular': 'Popular',
                'comercio': 'Comercio'
            }
            search_name = newspaper_map.get(context.lower(), context)
            query = query.filter(Diario.nombre.ilike(f"%{search_name}%"))
        
        noticias = query.order_by(
            desc(Noticia.fecha_publicacion)
        ).limit(5).all()
        
        if not noticias:
            return "No encontré noticias recientes."
        
        respuesta = "🆕 **Noticias más recientes:**\n\n"
        for i, noticia in enumerate(noticias, 1):
            fecha = noticia.fecha_publicacion.strftime("%d/%m/%Y %H:%M") if noticia.fecha_publicacion else "Fecha no disponible"
            # Limitar el título a 80 caracteres para mejor legibilidad
            titulo = noticia.titulo[:80] + "..." if len(noticia.titulo) > 80 else noticia.titulo
            enlace = noticia.enlace if noticia.enlace else f"/noticia/{noticia.id}"
            respuesta += f"{i}. **{titulo}**\n"
            respuesta += f"   📅 {fecha} | 📰 {noticia.diario.nombre}\n"
            respuesta += f"   🔗 [Ver noticia completa]({enlace})\n\n"
        
        return respuesta
    except Exception as e:
        logger.error(f"Error obteniendo noticias recientes: {e}")
        return None

def get_news_by_category(db: Session, categoria: str, context: Optional[str] = None) -> str:
    """Obtiene noticias por categoría"""
    try:
        query = db.query(Noticia).join(Diario).filter(
            Noticia.categoria.ilike(f"%{categoria}%")
        )
        
        if context == 'premium':
            # Si el contexto es premium, buscar solo noticias premium
            if hasattr(Noticia, 'es_premium'):
                query = query.filter(Noticia.es_premium == True)
        elif context:
            # Mapear nombres comunes a nombres de diarios
            newspaper_map = {
                'cnn': 'CNN',
                'correo': 'Correo',
                'popular': 'Popular',
                'comercio': 'Comercio'
            }
            search_name = newspaper_map.get(context.lower(), context)
            query = query.filter(Diario.nombre.ilike(f"%{search_name}%"))
        
        noticias = query.order_by(
            desc(Noticia.fecha_publicacion)
        ).limit(5).all()
        
        if not noticias:
            return f"No encontré noticias de la categoría {categoria}."
        
        respuesta = f"📂 **Noticias de {categoria}:**\n\n"
        for i, noticia in enumerate(noticias, 1):
            fecha = noticia.fecha_publicacion.strftime("%d/%m/%Y") if noticia.fecha_publicacion else "Fecha no disponible"
            # Limitar el título a 80 caracteres para mejor legibilidad
            titulo = noticia.titulo[:80] + "..." if len(noticia.titulo) > 80 else noticia.titulo
            enlace = noticia.enlace if noticia.enlace else f"/noticia/{noticia.id}"
            respuesta += f"{i}. **{titulo}**\n"
            respuesta += f"   📅 {fecha} | 📰 {noticia.diario.nombre}\n"
            respuesta += f"   🔗 [Ver noticia completa]({enlace})\n\n"
        
        return respuesta
    except Exception as e:
        logger.error(f"Error obteniendo noticias por categoría: {e}")
        return None

def get_news_by_newspaper(db: Session, newspaper_name: str) -> str:
    """Obtiene noticias de un diario específico"""
    try:
        # Mapear nombres comunes a nombres de diarios
        newspaper_map = {
            'cnn': 'CNN',
            'correo': 'Correo',
            'popular': 'Popular',
            'comercio': 'Comercio'
        }
        
        search_name = newspaper_map.get(newspaper_name.lower(), newspaper_name)
        
        noticias = db.query(Noticia).join(Diario).filter(
            Diario.nombre.ilike(f"%{search_name}%")
        ).order_by(
            desc(Noticia.fecha_publicacion)
        ).limit(5).all()
        
        if not noticias:
            return f"No encontré noticias del diario {search_name}."
        
        respuesta = f"📰 **Noticias de {noticias[0].diario.nombre}:**\n\n"
        for i, noticia in enumerate(noticias, 1):
            fecha = noticia.fecha_publicacion.strftime("%d/%m/%Y") if noticia.fecha_publicacion else "Fecha no disponible"
            # Limitar el título a 80 caracteres para mejor legibilidad
            titulo = noticia.titulo[:80] + "..." if len(noticia.titulo) > 80 else noticia.titulo
            enlace = noticia.enlace if noticia.enlace else f"/noticia/{noticia.id}"
            respuesta += f"{i}. **{titulo}**\n"
            respuesta += f"   📅 {fecha} | 📂 {noticia.categoria}\n"
            respuesta += f"   🔗 [Ver noticia completa]({enlace})\n\n"
        
        return respuesta
    except Exception as e:
        logger.error(f"Error obteniendo noticias por diario: {e}")
        return None

def get_available_newspapers(db: Session) -> str:
    """Obtiene la lista de diarios disponibles"""
    try:
        diarios = db.query(Diario.nombre).distinct().all()
        diarios_list = [d[0] for d in diarios]
        
        if not diarios_list:
            return "No hay diarios disponibles."
        
        respuesta = "📰 **Diarios disponibles:**\n\n"
        for diario in diarios_list:
            count = db.query(func.count(Noticia.id)).join(Diario).filter(
                Diario.nombre == diario
            ).scalar()
            respuesta += f"• **{diario}** ({count} noticias)\n"
        
        return respuesta
    except Exception as e:
        logger.error(f"Error obteniendo diarios: {e}")
        return None

def extract_keywords(question: str) -> List[str]:
    """Extrae palabras clave de la pregunta"""
    # Palabras comunes a ignorar
    stop_words = ['el', 'la', 'los', 'las', 'de', 'del', 'en', 'un', 'una', 'unos', 'unas',
                  'que', 'qué', 'cual', 'cuál', 'como', 'cómo', 'cuando', 'cuándo',
                  'donde', 'dónde', 'por', 'para', 'con', 'sin', 'sobre', 'entre',
                  'soy', 'eres', 'es', 'somos', 'son', 'fue', 'fueron', 'será',
                  'tengo', 'tiene', 'tenemos', 'tienen', 'había', 'hay', 'habrá',
                  'puedo', 'puede', 'podemos', 'pueden', 'debo', 'debe', 'debemos',
                  'me', 'te', 'se', 'nos', 'os', 'le', 'les', 'lo', 'la', 'los', 'las']
    
    words = question.lower().split()
    keywords = [w for w in words if w not in stop_words and len(w) > 2]
    return keywords[:5]  # Limitar a 5 palabras clave

def search_news_by_keywords(db: Session, keywords: List[str], context: Optional[str] = None) -> str:
    """Busca noticias por palabras clave"""
    try:
        conditions = []
        for keyword in keywords:
            conditions.append(Noticia.titulo.ilike(f"%{keyword}%"))
            conditions.append(Noticia.contenido.ilike(f"%{keyword}%"))
        
        query = db.query(Noticia).join(Diario).filter(
            or_(*conditions)
        )
        
        if context:
            query = query.filter(Diario.nombre.ilike(f"%{context}%"))
        
        noticias = query.order_by(
            desc(Noticia.fecha_publicacion)
        ).limit(5).all()
        
        if not noticias:
            return None
        
        respuesta = f"🔍 **Noticias relacionadas con '{' '.join(keywords)}':**\n\n"
        for i, noticia in enumerate(noticias, 1):
            fecha = noticia.fecha_publicacion.strftime("%d/%m/%Y") if noticia.fecha_publicacion else "Fecha no disponible"
            # Limitar el título a 80 caracteres para mejor legibilidad
            titulo = noticia.titulo[:80] + "..." if len(noticia.titulo) > 80 else noticia.titulo
            enlace = noticia.enlace if noticia.enlace else f"/noticia/{noticia.id}"
            respuesta += f"{i}. **{titulo}**\n"
            respuesta += f"   📅 {fecha} | 📰 {noticia.diario.nombre} | 📂 {noticia.categoria}\n"
            respuesta += f"   🔗 [Ver noticia completa]({enlace})\n\n"
        
        return respuesta
    except Exception as e:
        logger.error(f"Error buscando noticias por palabras clave: {e}")
        return None

# ===== FUNCIONES LLM =====

def call_openrouter(question: str, context: Optional[str] = None) -> Optional[str]:
    """Llama a OpenRouter API"""
    if not OPENROUTER_API_KEY:
        return None
    
    try:
        # Construir contexto para el LLM
        system_prompt = """Eres un asistente de noticias peruanas. Responde de manera concisa y útil.
        Si la pregunta es sobre noticias específicas, proporciona información basada en el contexto disponible.
        Si no tienes información específica, sé honesto y sugiere buscar en las categorías disponibles."""
        
        if context:
            system_prompt += f"\n\nEl usuario está navegando en la sección de {context}."
        
        payload = {
            "model": "openai/gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            "temperature": 0.7,
            "max_tokens": 300
        }
        
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(OPENROUTER_API_URL, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        else:
            logger.error(f"Error en OpenRouter: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error llamando a OpenRouter: {e}")
        return None

def call_ollama(question: str, context: Optional[str] = None) -> Optional[str]:
    """Llama a Ollama API"""
    try:
        prompt = f"""Eres un asistente de noticias peruanas. Responde de manera concisa y útil.
        
Pregunta del usuario: {question}
"""
        
        if context:
            prompt += f"\nContexto: El usuario está navegando en la sección de {context}."
        
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        }
        
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return data.get("response", "").strip()
        else:
            logger.error(f"Error en Ollama: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error llamando a Ollama: {e}")
        return None

def get_fallback_response(question: str) -> str:
    """Respuesta de fallback cuando no hay LLM disponible"""
    question_lower = question.lower()
    
    if any(word in question_lower for word in ['hola', 'hi', 'buenos días', 'buenas tardes']):
        return "¡Hola! 👋 Soy tu asistente de noticias. Puedo ayudarte a encontrar información sobre las noticias más relevantes, categorías, diarios y más. ¿En qué puedo ayudarte?"
    
    if any(word in question_lower for word in ['gracias', 'thank', 'thanks']):
        return "¡De nada! 😊 Si tienes más preguntas sobre las noticias, estaré aquí para ayudarte."
    
    return "Lo siento, no puedo responder esa pregunta en este momento. Te sugiero que explores las categorías y diarios disponibles en el menú principal para encontrar la información que buscas."

def get_suggested_questions(question: str, context: Optional[str] = None, source: str = "database") -> List[str]:
    """Genera preguntas sugeridas basadas en la pregunta del usuario y el contexto"""
    question_lower = question.lower()
    suggestions = []
    
    # Si la pregunta es sobre noticias relevantes
    if any(word in question_lower for word in ['relevante', 'importante', 'destacada', 'última semana']):
        suggestions = [
            "¿Qué noticias hay sobre política?",
            "¿Cuáles son las noticias más recientes?",
            "¿Qué noticias hay sobre deportes?",
            "¿Qué noticias hay sobre economía?"
        ]
    
    # Si la pregunta es sobre noticias recientes
    elif any(word in question_lower for word in ['reciente', 'última', 'nueva', 'actual']):
        suggestions = [
            "¿Cuál fue la noticia más relevante de la última semana?",
            "¿Qué noticias hay sobre tecnología?",
            "¿Qué diarios están disponibles?",
            "¿Qué noticias hay sobre política?"
        ]
    
    # Si la pregunta es sobre una categoría específica
    elif any(word in question_lower for word in ['política', 'político', 'gobierno']):
        suggestions = [
            "¿Qué noticias hay sobre deportes?",
            "¿Qué noticias hay sobre economía?",
            "¿Cuál fue la noticia más relevante de la última semana?",
            "¿Qué noticias hay sobre tecnología?"
        ]
    
    elif any(word in question_lower for word in ['deporte', 'deportivo', 'futbol']):
        suggestions = [
            "¿Qué noticias hay sobre política?",
            "¿Qué noticias hay sobre economía?",
            "¿Cuáles son las noticias más recientes?",
            "¿Qué noticias hay sobre tecnología?"
        ]
    
    elif any(word in question_lower for word in ['economía', 'económico', 'finanzas']):
        suggestions = [
            "¿Qué noticias hay sobre política?",
            "¿Qué noticias hay sobre deportes?",
            "¿Cuál fue la noticia más relevante de la última semana?",
            "¿Qué noticias hay sobre tecnología?"
        ]
    
    elif any(word in question_lower for word in ['tecnología', 'tecnológico', 'tecnologia']):
        suggestions = [
            "¿Qué noticias hay sobre política?",
            "¿Qué noticias hay sobre deportes?",
            "¿Qué noticias hay sobre economía?",
            "¿Cuáles son las noticias más recientes?"
        ]
    
    # Si hay contexto de diario específico
    elif context:
        if context == 'premium':
            suggestions = [
                "¿Cuál es la noticia premium más reciente?",
                "¿Qué noticias premium hay disponibles?",
                "¿Cuál fue la noticia más relevante de la última semana?",
                "¿Qué noticias hay sobre política?"
            ]
        elif context in ['cnn', 'correo', 'popular', 'comercio']:
            suggestions = [
                f"¿Cuál es la última noticia de {context.upper()}?",
                "¿Qué noticias hay sobre política?",
                "¿Cuáles son las noticias más recientes?",
                "¿Qué diarios están disponibles?"
            ]
    
    # Si la pregunta es sobre diarios
    elif any(word in question_lower for word in ['diario', 'diarios', 'periódico', 'periódicos']):
        suggestions = [
            "¿Cuál fue la noticia más relevante de la última semana?",
            "¿Qué noticias hay sobre política?",
            "¿Cuáles son las noticias más recientes?",
            "¿Qué noticias hay sobre deportes?"
        ]
    
    # Preguntas genéricas por defecto
    else:
        suggestions = [
            "¿Cuál fue la noticia más relevante de la última semana?",
            "¿Qué noticias hay sobre política?",
            "¿Cuáles son las noticias más recientes?",
            "¿Qué diarios están disponibles?"
        ]
    
    # Limitar a 4 sugerencias y evitar duplicados
    return list(dict.fromkeys(suggestions))[:4]

# ===== ENDPOINTS =====

@router.post("/ask", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Endpoint principal del chatbot
    Intenta responder usando:
    1. Búsqueda en base de datos
    2. LLM (OpenRouter u Ollama)
    3. Respuestas predefinidas (fallback)
    """
    question = request.question.strip()
    context = request.context
    
    if not question:
        raise HTTPException(status_code=400, detail="La pregunta no puede estar vacía")
    
    # Generar preguntas sugeridas
    suggested_questions = get_suggested_questions(question, context, "database")
    
    # Paso 1: Intentar buscar en la base de datos
    db_response = search_news_in_database(db, question, context)
    if db_response:
        return ChatResponse(
            answer=db_response,
            source="database",
            confidence=0.9,
            suggested_questions=suggested_questions
        )
    
    # Paso 2: Intentar usar LLM
    llm_response = None
    
    if PREFERRED_LLM == "openrouter":
        llm_response = call_openrouter(question, context)
        if not llm_response and PREFERRED_LLM == "openrouter":
            # Fallback a Ollama si OpenRouter falla
            llm_response = call_ollama(question, context)
    else:
        llm_response = call_ollama(question, context)
        if not llm_response:
            # Fallback a OpenRouter si Ollama falla
            llm_response = call_openrouter(question, context)
    
    if llm_response:
        suggested_questions = get_suggested_questions(question, context, "llm")
        return ChatResponse(
            answer=llm_response,
            source="llm",
            confidence=0.7,
            suggested_questions=suggested_questions
        )
    
    # Paso 3: Usar respuesta de fallback
    fallback_response = get_fallback_response(question)
    suggested_questions = get_suggested_questions(question, context, "fallback")
    return ChatResponse(
        answer=fallback_response,
        source="fallback",
        confidence=0.5,
        suggested_questions=suggested_questions
    )

@router.get("/health")
async def chatbot_health():
    """Verifica el estado del chatbot y los servicios LLM"""
    health_status = {
        "status": "ok",
        "llm_available": False,
        "llm_provider": None,
        "database_available": True
    }
    
    # Verificar OpenRouter
    if OPENROUTER_API_KEY:
        try:
            response = requests.get("https://openrouter.ai/api/v1/models", timeout=5)
            if response.status_code == 200:
                health_status["llm_available"] = True
                health_status["llm_provider"] = "openrouter"
        except:
            pass
    
    # Verificar Ollama si OpenRouter no está disponible
    if not health_status["llm_available"]:
        try:
            response = requests.get(OLLAMA_API_URL.replace("/api/generate", "/api/tags"), timeout=5)
            if response.status_code == 200:
                health_status["llm_available"] = True
                health_status["llm_provider"] = "ollama"
        except:
            pass
    
    return health_status

