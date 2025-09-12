from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict
from datetime import datetime, timedelta, timezone
import logging
import requests
from contextlib import asynccontextmanager

from database import get_db, create_tables, test_connection
from models import Diario, Noticia, EstadisticaScraping, AlertaConfiguracion, AlertaDisparo, TrendingKeywords
from duplicate_detector import DuplicateDetector
from content_generator import generate_content_for_news
try:
    from alert_system import AlertSystem
except ImportError:
    # Usar versión simplificada si hay problemas con email
    from alert_system_simple import AlertSystemSimple as AlertSystem
from scraping_service import ScrapingService
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NoticiaResponse(BaseModel):
    id: int
    titulo: str
    contenido: Optional[str]
    enlace: Optional[str]
    imagen_url: Optional[str]
    categoria: str
    fecha_publicacion: Optional[datetime]
    fecha_extraccion: datetime
    diario_id: int
    diario_nombre: str
    
    # Nuevos campos opcionales
    autor: Optional[str] = None
    tags: Optional[List[str]] = None
    sentimiento: Optional[str] = None
    tiempo_lectura_min: Optional[int] = None
    popularidad_score: Optional[float] = None
    es_trending: Optional[bool] = None
    palabras_clave: Optional[List[str]] = None
    resumen_auto: Optional[str] = None
    idioma: Optional[str] = None
    region: Optional[str] = None
    es_alerta: Optional[bool] = None
    nivel_urgencia: Optional[str] = None
    keywords_alerta: Optional[List[str]] = None
    
    # Campos geográficos
    geographic_type: Optional[str] = None
    geographic_confidence: Optional[float] = None
    geographic_keywords: Optional[Dict] = None
    
    class Config:
        from_attributes = True

class AlertaConfigRequest(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    keywords: List[str]
    categorias: Optional[List[str]] = None
    diarios: Optional[List[str]] = None
    nivel_urgencia: Optional[str] = 'media'
    notificar_email: Optional[bool] = False
    email_destino: Optional[str] = None
    notificar_webhook: Optional[bool] = False
    webhook_url: Optional[str] = None
    activa: Optional[bool] = True

class AlertaResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    keywords: List[str]
    categorias: Optional[List[str]]
    diarios: Optional[List[str]]
    nivel_urgencia: str
    activa: bool
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True

class TrendingKeywordResponse(BaseModel):
    palabra: str
    frecuencia: int
    categoria: Optional[str]
    score_trending: float
    
    class Config:
        from_attributes = True

def init_diarios():
    db = next(get_db())
    try:
        diarios_data = [
            {"nombre": "Diario Correo", "url": "https://diariocorreo.pe"},
            {"nombre": "El Comercio", "url": "https://elcomercio.pe"},
            {"nombre": "El Popular", "url": "https://elpopular.pe"}
        ]
        
        for diario_data in diarios_data:
            existing = db.query(Diario).filter(Diario.nombre == diario_data["nombre"]).first()
            if not existing:
                diario = Diario(**diario_data)
                db.add(diario)
        db.commit()
        logger.info("Diarios inicializados correctamente")
    except Exception as e:
        logger.error(f"Error inicializando diarios: {e}")
        db.rollback()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando aplicación...")
    
    if not test_connection():
        logger.error("No se pudo conectar a la base de datos")
        raise Exception("Error de conexión a la base de datos")
    
    create_tables()
    init_diarios()
    logger.info("Aplicación iniciada correctamente")
    
    yield
    
    logger.info("Cerrando aplicación...")

app = FastAPI(
    title="API de Scraping de Diarios Peruanos",
    description="API para gestionar noticias extraídas de diarios peruanos",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "API de Scraping de Diarios Peruanos", "version": "1.0.0"}

@app.get("/noticias", response_model=List[NoticiaResponse])
async def get_noticias(
    categoria: Optional[str] = Query(None),
    diario: Optional[str] = Query(None),
    geographic_type: Optional[str] = Query(None, description="Filtrar por tipo geográfico: internacional, nacional, regional, local"),
    limit: int = Query(100),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    query = db.query(Noticia).join(Diario)
    
    if categoria:
        query = query.filter(Noticia.categoria == categoria)
    if diario:
        query = query.filter(Diario.nombre == diario)
    if geographic_type:
        query = query.filter(Noticia.geographic_type == geographic_type)
    
    noticias = query.order_by(Noticia.fecha_extraccion.desc()).offset(offset).limit(limit).all()
    
    result = []
    for noticia in noticias:
        result.append(NoticiaResponse(
            id=noticia.id,
            titulo=noticia.titulo,
            contenido=noticia.contenido,
            enlace=noticia.enlace,
            imagen_url=noticia.imagen_url,
            categoria=noticia.categoria,
            fecha_publicacion=noticia.fecha_publicacion,
            fecha_extraccion=noticia.fecha_extraccion,
            diario_id=noticia.diario_id,
            diario_nombre=noticia.diario.nombre
        ))
    
    return result


@app.get("/comparativa")
async def get_comparativa(db: Session = Depends(get_db)):
    # Obtener todas las noticias (sin filtro de tiempo para mostrar totales)
    query = db.query(
        Diario.nombre,
        Noticia.categoria,
        func.count(Noticia.id).label('cantidad')
    ).join(Noticia).group_by(
        Diario.nombre, Noticia.categoria
    ).order_by(
        Diario.nombre, Noticia.categoria
    )
    
    resultados = query.all()
    
    # Obtener información adicional
    total_noticias = db.query(func.count(Noticia.id)).scalar()
    fecha_ultima_extraccion = db.query(func.max(Noticia.fecha_extraccion)).scalar()
    
    # Obtener todos los diarios para mostrar los que no tienen noticias
    todos_diarios = db.query(Diario.nombre).all()
    diarios_con_noticias = set([r.nombre for r in resultados])
    
    # Agregar diarios sin noticias
    for diario in todos_diarios:
        if diario.nombre not in diarios_con_noticias:
            resultados.append(type('obj', (object,), {
                'nombre': diario.nombre,
                'categoria': 'Sin noticias',
                'cantidad': 0
            })())
    
    return {
        "estadisticas": [
            {
                "diario": result.nombre,
                "categoria": result.categoria,
                "cantidad": result.cantidad,
                "descripcion": f"{result.cantidad} noticias de {result.categoria}" if result.cantidad > 0 else "Sin noticias extraídas"
            }
            for result in resultados
        ],
        "resumen": {
            "total_noticias": total_noticias,
            "fecha_ultima_extraccion": fecha_ultima_extraccion.isoformat() if fecha_ultima_extraccion else None,
            "periodo_analisis": "Todas las noticias extraídas hasta la fecha"
        }
    }

@app.get("/categorias-disponibles")
async def get_categorias_disponibles(db: Session = Depends(get_db)):
    """Obtener todas las categorías disponibles en la base de datos"""
    # Obtener todas las categorías únicas
    categorias = db.query(Noticia.categoria).distinct().all()
    categorias_list = [categoria[0] for categoria in categorias]
    
    # Ordenar alfabéticamente
    categorias_list.sort()
    
    return {
        "categorias": categorias_list,
        "total": len(categorias_list)
    }

@app.get("/noticias/por-diario/{nombre_diario}", response_model=List[NoticiaResponse])
async def get_noticias_por_diario(
    nombre_diario: str,
    fecha: Optional[str] = Query(None, description="Filtrar por fecha específica (YYYY-MM-DD)"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoría"),
    limit: int = Query(100, description="Límite de noticias a retornar"),
    db: Session = Depends(get_db)
):
    """Obtener noticias de un diario específico con filtros opcionales"""
    try:
        # Primero verificar que el diario existe
        diario = db.query(Diario).filter(Diario.nombre == nombre_diario).first()
        if not diario:
            return []
        
        query = db.query(Noticia).filter(Noticia.diario_id == diario.id)
        
        if fecha:
            query = query.filter(func.date(Noticia.fecha_publicacion) == fecha)
        
        if categoria:
            query = query.filter(Noticia.categoria == categoria)
        
        noticias = query.order_by(Noticia.fecha_publicacion.desc()).limit(limit).all()
        
        result = []
        for noticia in noticias:
            result.append(NoticiaResponse(
                id=noticia.id,
                titulo=noticia.titulo,
                contenido=noticia.contenido,
                enlace=noticia.enlace,
                imagen_url=noticia.imagen_url,
                categoria=noticia.categoria,
                fecha_publicacion=noticia.fecha_publicacion,
                fecha_extraccion=noticia.fecha_extraccion,
                diario_id=noticia.diario_id,
                diario_nombre=diario.nombre
            ))
        
        return result
    except Exception as e:
        print(f"Error en get_noticias_por_diario: {e}")
        return []

@app.get("/noticias/fechas-disponibles/{nombre_diario}")
async def get_fechas_disponibles_por_diario(
    nombre_diario: str,
    db: Session = Depends(get_db)
):
    """Obtener fechas disponibles para un diario específico"""
    # Obtener fechas únicas para el diario específico
    fechas = db.query(func.date(Noticia.fecha_publicacion).label('fecha')).join(Diario).filter(
        Diario.nombre == nombre_diario,
        Noticia.fecha_publicacion.isnot(None)
    ).distinct().order_by(func.date(Noticia.fecha_publicacion).desc()).all()
    
    # Formatear fechas
    fechas_formateadas = []
    for fecha in fechas:
        fecha_obj = fecha.fecha
        if fecha_obj is not None:
            fechas_formateadas.append({
                "fecha": fecha_obj.strftime("%Y-%m-%d"),
                "fecha_formateada": fecha_obj.strftime("%d/%m/%Y"),
                "dia_semana": fecha_obj.strftime("%A"),
                "total_noticias": db.query(func.count(Noticia.id)).join(Diario).filter(
                    Diario.nombre == nombre_diario,
                    func.date(Noticia.fecha_publicacion) == fecha_obj
                ).scalar()
            })
    
    return {
        "diario": nombre_diario,
        "fechas": fechas_formateadas,
        "total_fechas": len(fechas_formateadas)
    }

@app.get("/noticias/recientes", response_model=List[NoticiaResponse])
async def get_noticias_recientes(
    horas: int = Query(1, description="Noticias de las últimas X horas"),
    limit: int = Query(50, description="Límite de noticias a retornar"),
    db: Session = Depends(get_db)
):
    """Obtener noticias agregadas en las últimas X horas"""
    from datetime import datetime, timedelta
    
    # Calcular fecha límite
    fecha_limite = datetime.now() - timedelta(hours=horas)
    
    # Obtener noticias recientes
    query = db.query(Noticia).join(Diario).filter(
        Noticia.fecha_extraccion >= fecha_limite
    ).order_by(Noticia.fecha_extraccion.desc()).limit(limit)
    
    noticias = query.all()
    
    result = []
    for noticia in noticias:
        result.append(NoticiaResponse(
            id=noticia.id,
            titulo=noticia.titulo,
            contenido=noticia.contenido,
            enlace=noticia.enlace,
            imagen_url=noticia.imagen_url,
            categoria=noticia.categoria,
            fecha_publicacion=noticia.fecha_publicacion,
            fecha_extraccion=noticia.fecha_extraccion,
            diario_id=noticia.diario_id,
            diario_nombre=noticia.diario.nombre
        ))
    
    return result

@app.get("/noticias/relevantes-anteriores", response_model=List[NoticiaResponse])
async def get_noticias_relevantes_anteriores(
    dias: int = Query(7, description="Buscar en los últimos X días"),
    limit: int = Query(15, description="Límite de noticias a retornar"),
    excluir_fecha: Optional[str] = Query(None, description="Fecha a excluir en formato YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    """Obtener noticias relevantes de días anteriores, ordenadas por relevancia"""
    from datetime import datetime, timedelta
    from sqlalchemy import func, case, desc
    
    # Calcular fecha límite
    fecha_limite = datetime.now() - timedelta(days=dias)
    
    # Construir query base
    query = db.query(Noticia).join(Diario).filter(
        Noticia.fecha_publicacion >= fecha_limite
    )
    
    # Excluir fecha específica si se proporciona
    if excluir_fecha:
        try:
            fecha_excluir = datetime.strptime(excluir_fecha, "%Y-%m-%d").date()
            fecha_inicio_excluir = datetime.combine(fecha_excluir, datetime.min.time())
            fecha_fin_excluir = datetime.combine(fecha_excluir, datetime.max.time())
            query = query.filter(
                ~((Noticia.fecha_publicacion >= fecha_inicio_excluir) & 
                  (Noticia.fecha_publicacion <= fecha_fin_excluir))
            )
        except ValueError:
            pass  # Si la fecha no es válida, no excluir nada
    
    # Ordenar por relevancia: priorizar categorías importantes y noticias más recientes
    # Dar más peso a ciertas categorías
    categoria_peso = case(
        (Noticia.categoria.in_(['POLÍTICA', 'ECONOMÍA', 'DEPORTES']), 3),
        (Noticia.categoria.in_(['NACIONAL', 'INTERNACIONAL']), 2),
        else_=1
    )
    
    # Ordenar por peso de categoría y fecha de publicación
    noticias = query.order_by(
        desc(categoria_peso),
        desc(Noticia.fecha_publicacion)
    ).limit(limit).all()
    
    result = []
    for noticia in noticias:
        result.append(NoticiaResponse(
            id=noticia.id,
            titulo=noticia.titulo,
            contenido=noticia.contenido,
            enlace=noticia.enlace,
            imagen_url=noticia.imagen_url,
            categoria=noticia.categoria,
            fecha_publicacion=noticia.fecha_publicacion,
            fecha_extraccion=noticia.fecha_extraccion,
            diario_id=noticia.diario_id,
            diario_nombre=noticia.diario.nombre
        ))
    
    return result

@app.get("/noticias/ultima-actualizacion")
async def get_ultima_actualizacion(db: Session = Depends(get_db)):
    """Obtener información de la última actualización"""
    from datetime import datetime
    
    # Obtener la fecha de la última noticia
    ultima_noticia = db.query(Noticia).order_by(Noticia.fecha_extraccion.desc()).first()
    
    if not ultima_noticia:
        return {
            "ultima_actualizacion": None,
            "total_noticias": 0,
            "estado": "Sin noticias"
        }
    
    # Calcular tiempo transcurrido
    ahora = datetime.now()
    tiempo_transcurrido = ahora - ultima_noticia.fecha_extraccion
    
    return {
        "ultima_actualizacion": ultima_noticia.fecha_extraccion.isoformat(),
        "tiempo_transcurrido_minutos": int(tiempo_transcurrido.total_seconds() / 60),
        "total_noticias": db.query(func.count(Noticia.id)).scalar(),
        "estado": "Actualizado" if tiempo_transcurrido.total_seconds() < 3600 else "Pendiente de actualización"
    }

@app.get("/noticias/por-fecha", response_model=List[NoticiaResponse])
async def get_noticias_por_fecha(
    fecha: str = Query(..., description="Fecha en formato YYYY-MM-DD (ej: 2025-09-07)"),
    db: Session = Depends(get_db)
):
    """Obtener noticias de una fecha específica"""
    from datetime import datetime, timedelta
    
    try:
        logger.info(f"Buscando noticias para la fecha: {fecha}")
        
        # Parsear la fecha
        fecha_obj = datetime.strptime(fecha, "%Y-%m-%d").date()
        fecha_inicio = datetime.combine(fecha_obj, datetime.min.time())
        fecha_fin = datetime.combine(fecha_obj, datetime.max.time())
        
        logger.info(f"Fecha inicio: {fecha_inicio}, Fecha fin: {fecha_fin}")
        
        # Obtener noticias de esa fecha (filtrar por fecha de publicación)
        query = db.query(Noticia).join(Diario).filter(
            Noticia.fecha_publicacion >= fecha_inicio,
            Noticia.fecha_publicacion <= fecha_fin
        ).order_by(Noticia.fecha_publicacion.desc())
        
        noticias = query.all()
        logger.info(f"Encontradas {len(noticias)} noticias")
        
        result = []
        for noticia in noticias:
            result.append(NoticiaResponse(
                id=noticia.id,
                titulo=noticia.titulo,
                contenido=noticia.contenido,
                enlace=noticia.enlace,
                imagen_url=noticia.imagen_url,
                categoria=noticia.categoria,
                fecha_publicacion=noticia.fecha_publicacion,
                fecha_extraccion=noticia.fecha_extraccion,
                diario_id=noticia.diario_id,
                diario_nombre=noticia.diario.nombre,
                geographic_type=noticia.geographic_type,
                geographic_confidence=noticia.geographic_confidence,
                geographic_keywords=noticia.geographic_keywords
            ))
        
        logger.info(f"Retornando {len(result)} noticias")
        return result
        
    except ValueError as e:
        logger.error(f"Error de formato de fecha: {e}")
        return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}
    except Exception as e:
        logger.error(f"Error inesperado: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/noticias/fechas-disponibles")
async def get_fechas_disponibles(db: Session = Depends(get_db)):
    """Obtener todas las fechas que tienen noticias"""
    from datetime import datetime
    
    # Obtener fechas únicas de noticias (por fecha de publicación)
    fechas = db.query(
        func.date(Noticia.fecha_publicacion).label('fecha')
    ).distinct().order_by(
        func.date(Noticia.fecha_publicacion).desc()
    ).all()
    
    # Formatear fechas (filtrar las que son None)
    fechas_formateadas = []
    for fecha in fechas:
        fecha_obj = fecha.fecha
        # Solo procesar fechas que no sean None
        if fecha_obj is not None:
            fechas_formateadas.append({
                "fecha": fecha_obj.strftime("%Y-%m-%d"),
                "fecha_formateada": fecha_obj.strftime("%d/%m/%Y"),
                "dia_semana": fecha_obj.strftime("%A"),
                "total_noticias": db.query(func.count(Noticia.id)).filter(
                    func.date(Noticia.fecha_publicacion) == fecha_obj
                ).scalar()
            })
    
    return {
        "fechas": fechas_formateadas,
        "total_fechas": len(fechas_formateadas)
    }

@app.get("/debug/fechas")
async def debug_fechas(db: Session = Depends(get_db)):
    """Endpoint temporal para debuggear fechas"""
    from datetime import datetime
    
    # Obtener algunas noticias para ver sus fechas
    noticias = db.query(Noticia).limit(5).all()
    
    debug_info = []
    for noticia in noticias:
        debug_info.append({
            "id": noticia.id,
            "titulo": noticia.titulo[:50] + "...",
            "fecha_publicacion": noticia.fecha_publicacion.isoformat() if noticia.fecha_publicacion else None,
            "fecha_extraccion": noticia.fecha_extraccion.isoformat() if noticia.fecha_extraccion else None,
            "diario": noticia.diario.nombre
        })
    
    return {
        "noticias_debug": debug_info,
        "total_noticias": db.query(func.count(Noticia.id)).scalar()
    }

@app.get("/analisis/por-fechas")
async def get_analisis_por_fechas(
    fecha_inicio: str = Query(..., description="Fecha inicio en formato YYYY-MM-DD"),
    fecha_fin: str = Query(..., description="Fecha fin en formato YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    """Obtener análisis de publicaciones por diario y categoría en un rango de fechas"""
    from datetime import datetime
    
    try:
        # Parsear fechas
        fecha_inicio_obj = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
        fecha_fin_obj = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
        
        fecha_inicio_datetime = datetime.combine(fecha_inicio_obj, datetime.min.time())
        fecha_fin_datetime = datetime.combine(fecha_fin_obj, datetime.max.time())
        
        # Obtener estadísticas por diario y categoría
        query = db.query(
            Diario.nombre,
            Noticia.categoria,
            func.count(Noticia.id).label('cantidad')
        ).join(Noticia).filter(
            Noticia.fecha_extraccion >= fecha_inicio_datetime,
            Noticia.fecha_extraccion <= fecha_fin_datetime
        ).group_by(
            Diario.nombre, Noticia.categoria
        ).order_by(
            Diario.nombre, Noticia.categoria
        )
        
        resultados = query.all()
        
        # Organizar datos por diario
        analisis_por_diario = {}
        total_por_diario = {}
        
        for resultado in resultados:
            diario = resultado.nombre
            categoria = resultado.categoria
            cantidad = resultado.cantidad
            
            if diario not in analisis_por_diario:
                analisis_por_diario[diario] = {}
                total_por_diario[diario] = 0
            
            analisis_por_diario[diario][categoria] = cantidad
            total_por_diario[diario] += cantidad
        
        # Calcular totales generales
        total_general = sum(total_por_diario.values())
        
        # Obtener todas las categorías únicas
        categorias_unicas = set()
        for diario_data in analisis_por_diario.values():
            categorias_unicas.update(diario_data.keys())
        categorias_unicas = sorted(list(categorias_unicas))
        
        return {
            "periodo": {
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin,
                "dias_analizados": (fecha_fin_obj - fecha_inicio_obj).days + 1
            },
            "analisis_por_diario": analisis_por_diario,
            "total_por_diario": total_por_diario,
            "total_general": total_general,
            "categorias": categorias_unicas,
            "resumen": {
                "diario_mas_activo": max(total_por_diario.items(), key=lambda x: x[1]) if total_por_diario else None,
                "promedio_por_diario": total_general / len(total_por_diario) if total_por_diario else 0
            }
        }
        
    except ValueError:
        return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}

@app.get("/proxy-image")
async def proxy_image(url: str = Query(..., description="URL de la imagen a servir")):
    """Endpoint para servir imágenes como proxy, evitando problemas de CORS"""
    try:
        # Validar que la URL sea de un diario permitido
        allowed_domains = ['elcomercio.pe', 'diariocorreo.pe', 'elpopular.pe']
        if not any(domain in url for domain in allowed_domains):
            raise HTTPException(status_code=403, detail="Dominio no permitido")
        
        # Hacer la petición a la imagen original
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
        
        # Determinar el tipo de contenido
        content_type = response.headers.get('content-type', 'image/jpeg')
        
        # Retornar la imagen como streaming response
        return StreamingResponse(
            response.iter_content(chunk_size=8192),
            media_type=content_type,
            headers={
                "Cache-Control": "public, max-age=3600",  # Cache por 1 hora
                "Access-Control-Allow-Origin": "*"
            }
        )
        
    except requests.RequestException as e:
        logger.error(f"Error al obtener imagen {url}: {e}")
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    except Exception as e:
        logger.error(f"Error inesperado al servir imagen {url}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/noticias/{noticia_id}", response_model=NoticiaResponse)
async def get_noticia_by_id(
    noticia_id: int,
    db: Session = Depends(get_db)
):
    """Obtener una noticia específica por su ID"""
    noticia = db.query(Noticia).join(Diario).filter(Noticia.id == noticia_id).first()
    
    if not noticia:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    
    return NoticiaResponse(
        id=noticia.id,
        titulo=noticia.titulo,
        contenido=noticia.contenido,
        enlace=noticia.enlace,
        imagen_url=noticia.imagen_url,
        categoria=noticia.categoria,
        fecha_publicacion=noticia.fecha_publicacion,
        fecha_extraccion=noticia.fecha_extraccion,
        diario_id=noticia.diario_id,
        diario_nombre=noticia.diario.nombre,
        # Nuevos campos
        autor=noticia.autor,
        tags=noticia.tags,
        sentimiento=noticia.sentimiento,
        tiempo_lectura_min=noticia.tiempo_lectura_min,
        popularidad_score=noticia.popularidad_score,
        es_trending=noticia.es_trending,
        palabras_clave=noticia.palabras_clave,
        resumen_auto=noticia.resumen_auto,
        idioma=noticia.idioma,
        region=noticia.region,
        es_alerta=noticia.es_alerta,
        nivel_urgencia=noticia.nivel_urgencia,
        keywords_alerta=noticia.keywords_alerta
    )

# ================== NUEVOS ENDPOINTS ==================

@app.post("/alertas/crear", response_model=AlertaResponse)
async def crear_alerta(alerta_data: AlertaConfigRequest, db: Session = Depends(get_db)):
    """Crear una nueva configuración de alerta"""
    try:
        alert_system = AlertSystem()
        
        # Convertir a diccionario
        alert_dict = alerta_data.dict()
        
        # Crear la alerta
        alerta_config = alert_system.create_alert_configuration(db, alert_dict)
        
        return AlertaResponse(
            id=alerta_config.id,
            nombre=alerta_config.nombre,
            descripcion=alerta_config.descripcion,
            keywords=alerta_config.keywords,
            categorias=alerta_config.categorias,
            diarios=alerta_config.diarios,
            nivel_urgencia=alerta_config.nivel_urgencia,
            activa=alerta_config.activa,
            fecha_creacion=alerta_config.fecha_creacion
        )
        
    except Exception as e:
        logger.error(f"Error creando alerta: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/alertas", response_model=List[AlertaResponse])
async def listar_alertas(activa: Optional[bool] = None, db: Session = Depends(get_db)):
    """Listar todas las configuraciones de alerta"""
    query = db.query(AlertaConfiguracion)
    
    if activa is not None:
        query = query.filter(AlertaConfiguracion.activa == activa)
    
    alertas = query.order_by(AlertaConfiguracion.fecha_creacion.desc()).all()
    
    return [AlertaResponse(
        id=alerta.id,
        nombre=alerta.nombre,
        descripcion=alerta.descripcion,
        keywords=alerta.keywords,
        categorias=alerta.categorias,
        diarios=alerta.diarios,
        nivel_urgencia=alerta.nivel_urgencia,
        activa=alerta.activa,
        fecha_creacion=alerta.fecha_creacion
    ) for alerta in alertas]

@app.get("/alertas/{alerta_id}/disparos")
async def obtener_disparos_alerta(
    alerta_id: int,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    """Obtener disparos de una alerta específica"""
    disparos = db.query(AlertaDisparo).filter(
        AlertaDisparo.configuracion_id == alerta_id
    ).order_by(AlertaDisparo.fecha_disparo.desc()).limit(limit).all()
    
    result = []
    for disparo in disparos:
        result.append({
            'id': disparo.id,
            'keyword_match': disparo.keyword_match,
            'nivel_urgencia': disparo.nivel_urgencia,
            'fecha_disparo': disparo.fecha_disparo,
            'notificacion_enviada': disparo.notificacion_enviada,
            'noticia': {
                'id': disparo.noticia.id,
                'titulo': disparo.noticia.titulo,
                'categoria': disparo.noticia.categoria,
                'diario': disparo.noticia.diario.nombre,
                'enlace': disparo.noticia.enlace
            }
        })
    
    return result

@app.put("/alertas/{alerta_id}")
async def actualizar_alerta(
    alerta_id: int,
    alerta_data: AlertaConfigRequest,
    db: Session = Depends(get_db)
):
    """Actualizar configuración de alerta"""
    alerta = db.query(AlertaConfiguracion).filter(AlertaConfiguracion.id == alerta_id).first()
    
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    # Actualizar campos
    update_data = alerta_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(alerta, field, value)
    
    db.commit()
    
    return {"message": "Alerta actualizada exitosamente"}

@app.delete("/alertas/{alerta_id}")
async def eliminar_alerta(alerta_id: int, db: Session = Depends(get_db)):
    """Eliminar una configuración de alerta"""
    alerta = db.query(AlertaConfiguracion).filter(AlertaConfiguracion.id == alerta_id).first()
    
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    # En lugar de eliminar, desactivar
    alerta.activa = False
    db.commit()
    
    return {"message": "Alerta desactivada exitosamente"}

@app.get("/noticias/buscar", response_model=List[NoticiaResponse])
async def buscar_noticias(
    q: str = Query(..., min_length=3, description="Término de búsqueda"),
    categoria: Optional[str] = Query(None),
    diario: Optional[str] = Query(None),
    sentimiento: Optional[str] = Query(None),
    fecha_desde: Optional[str] = Query(None),
    fecha_hasta: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    """Búsqueda avanzada de noticias"""
    query = db.query(Noticia).join(Diario)
    
    # Búsqueda por texto en título y contenido
    search_filter = Noticia.titulo.ilike(f"%{q}%")
    if True:  # Buscar también en contenido
        search_filter = search_filter | Noticia.contenido.ilike(f"%{q}%")
    
    query = query.filter(search_filter)
    
    # Filtros adicionales
    if categoria:
        query = query.filter(Noticia.categoria == categoria)
    
    if diario:
        query = query.filter(Diario.nombre == diario)
    
    if sentimiento:
        query = query.filter(Noticia.sentimiento == sentimiento)
    
    if fecha_desde:
        try:
            fecha_desde_dt = datetime.strptime(fecha_desde, "%Y-%m-%d")
            query = query.filter(Noticia.fecha_publicacion >= fecha_desde_dt)
        except ValueError:
            pass
    
    if fecha_hasta:
        try:
            fecha_hasta_dt = datetime.strptime(fecha_hasta, "%Y-%m-%d")
            query = query.filter(Noticia.fecha_publicacion <= fecha_hasta_dt)
        except ValueError:
            pass
    
    noticias = query.order_by(Noticia.fecha_extraccion.desc()).limit(limit).all()
    
    # Convertir a response model
    result = []
    for noticia in noticias:
        result.append(NoticiaResponse(
            id=noticia.id,
            titulo=noticia.titulo,
            contenido=noticia.contenido,
            enlace=noticia.enlace,
            imagen_url=noticia.imagen_url,
            categoria=noticia.categoria,
            fecha_publicacion=noticia.fecha_publicacion,
            fecha_extraccion=noticia.fecha_extraccion,
            diario_id=noticia.diario_id,
            diario_nombre=noticia.diario.nombre,
            autor=noticia.autor,
            tags=noticia.tags,
            sentimiento=noticia.sentimiento,
            tiempo_lectura_min=noticia.tiempo_lectura_min,
            popularidad_score=noticia.popularidad_score,
            es_trending=noticia.es_trending,
            palabras_clave=noticia.palabras_clave,
            resumen_auto=noticia.resumen_auto,
            idioma=noticia.idioma,
            region=noticia.region,
            es_alerta=noticia.es_alerta,
            nivel_urgencia=noticia.nivel_urgencia,
            keywords_alerta=noticia.keywords_alerta
        ))
    
    return result

@app.get("/trending/noticias", response_model=List[NoticiaResponse])
async def obtener_noticias_trending(
    limit: int = Query(20, le=50),
    categoria: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Obtener noticias trending o de alta urgencia"""
    query = db.query(Noticia).join(Diario)
    
    # Filtrar por noticias de alerta o trending
    trending_filter = (Noticia.es_alerta == True) | (Noticia.es_trending == True)
    query = query.filter(trending_filter)
    
    if categoria:
        query = query.filter(Noticia.categoria == categoria)
    
    # Ordenar por urgencia y fecha
    noticias = query.order_by(
        Noticia.nivel_urgencia.desc(),
        Noticia.fecha_extraccion.desc()
    ).limit(limit).all()
    
    result = []
    for noticia in noticias:
        result.append(NoticiaResponse(
            id=noticia.id,
            titulo=noticia.titulo,
            contenido=noticia.contenido,
            enlace=noticia.enlace,
            imagen_url=noticia.imagen_url,
            categoria=noticia.categoria,
            fecha_publicacion=noticia.fecha_publicacion,
            fecha_extraccion=noticia.fecha_extraccion,
            diario_id=noticia.diario_id,
            diario_nombre=noticia.diario.nombre,
            autor=noticia.autor,
            sentimiento=noticia.sentimiento,
            tiempo_lectura_min=noticia.tiempo_lectura_min,
            es_alerta=noticia.es_alerta,
            nivel_urgencia=noticia.nivel_urgencia,
            keywords_alerta=noticia.keywords_alerta
        ))
    
    return result

@app.get("/analytics/sentimientos")
async def analisis_sentimientos(
    dias: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Análisis de sentimientos por diario y categoría"""
    fecha_limite = datetime.utcnow() - timedelta(days=dias)
    
    # Análisis general por sentimiento
    sentimientos = db.query(
        Noticia.sentimiento,
        func.count(Noticia.id).label('cantidad')
    ).filter(
        Noticia.fecha_extraccion >= fecha_limite,
        Noticia.sentimiento.isnot(None)
    ).group_by(Noticia.sentimiento).all()
    
    # Análisis por diario
    por_diario = db.query(
        Diario.nombre,
        Noticia.sentimiento,
        func.count(Noticia.id).label('cantidad')
    ).join(Noticia).filter(
        Noticia.fecha_extraccion >= fecha_limite,
        Noticia.sentimiento.isnot(None)
    ).group_by(Diario.nombre, Noticia.sentimiento).all()
    
    # Análisis por categoría
    por_categoria = db.query(
        Noticia.categoria,
        Noticia.sentimiento,
        func.count(Noticia.id).label('cantidad')
    ).filter(
        Noticia.fecha_extraccion >= fecha_limite,
        Noticia.sentimiento.isnot(None)
    ).group_by(Noticia.categoria, Noticia.sentimiento).all()
    
    return {
        'periodo_dias': dias,
        'sentimientos_general': [
            {'sentimiento': sent, 'cantidad': cant}
            for sent, cant in sentimientos
        ],
        'por_diario': [
            {'diario': diario, 'sentimiento': sent, 'cantidad': cant}
            for diario, sent, cant in por_diario
        ],
        'por_categoria': [
            {'categoria': cat, 'sentimiento': sent, 'cantidad': cant}
            for cat, sent, cant in por_categoria
        ]
    }

@app.get("/analytics/palabras-clave", response_model=List[TrendingKeywordResponse])
async def palabras_clave_trending(
    dias: int = Query(7, ge=1, le=30),
    categoria: Optional[str] = Query(None),
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db)
):
    """Obtener palabras clave más frecuentes"""
    fecha_limite = datetime.utcnow() - timedelta(days=dias)
    
    query = db.query(TrendingKeywords).filter(
        TrendingKeywords.fecha >= fecha_limite
    )
    
    if categoria:
        query = query.filter(TrendingKeywords.categoria == categoria)
    
    keywords = query.order_by(
        TrendingKeywords.frecuencia.desc(),
        TrendingKeywords.score_trending.desc()
    ).limit(limit).all()
    
    return [TrendingKeywordResponse(
        palabra=kw.palabra,
        frecuencia=kw.frecuencia,
        categoria=kw.categoria,
        score_trending=kw.score_trending
    ) for kw in keywords]

@app.get("/analytics/duplicados")
async def estadisticas_duplicados(
    dias: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Estadísticas de detección de duplicados"""
    try:
        duplicate_detector = DuplicateDetector()
        stats = duplicate_detector.get_duplicate_stats(db, dias)
        return stats
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas de duplicados: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/geografico")
async def estadisticas_geograficas(
    dias: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Estadísticas de clasificación geográfica de noticias"""
    try:
        fecha_limite = datetime.utcnow() - timedelta(days=dias)
        
        # Estadísticas por tipo geográfico
        stats_geograficas = db.query(
            Noticia.geographic_type,
            func.count(Noticia.id).label('cantidad'),
            func.avg(Noticia.geographic_confidence).label('confianza_promedio')
        ).filter(
            Noticia.fecha_extraccion >= fecha_limite
        ).group_by(Noticia.geographic_type).all()
        
        # Estadísticas por diario y tipo geográfico
        stats_por_diario = db.query(
            Diario.nombre,
            Noticia.geographic_type,
            func.count(Noticia.id).label('cantidad')
        ).join(Noticia).filter(
            Noticia.fecha_extraccion >= fecha_limite
        ).group_by(Diario.nombre, Noticia.geographic_type).all()
        
        # Total de noticias en el período
        total_noticias = db.query(func.count(Noticia.id)).filter(
            Noticia.fecha_extraccion >= fecha_limite
        ).scalar()
        
        # Formatear resultados
        resultado = {
            'periodo_dias': dias,
            'total_noticias': total_noticias,
            'por_tipo_geografico': [],
            'por_diario': {}
        }
        
        # Procesar estadísticas por tipo
        for stat in stats_geograficas:
            tipo = stat.geographic_type or 'nacional'  # Default si es None
            cantidad = stat.cantidad
            confianza = round(float(stat.confianza_promedio or 0.5), 2)
            porcentaje = round((cantidad / total_noticias) * 100, 1) if total_noticias > 0 else 0
            
            resultado['por_tipo_geografico'].append({
                'tipo': tipo,
                'cantidad': cantidad,
                'porcentaje': porcentaje,
                'confianza_promedio': confianza
            })
        
        # Procesar estadísticas por diario
        for stat in stats_por_diario:
            diario = stat.nombre
            tipo = stat.geographic_type or 'nacional'
            cantidad = stat.cantidad
            
            if diario not in resultado['por_diario']:
                resultado['por_diario'][diario] = {}
            
            resultado['por_diario'][diario][tipo] = cantidad
        
        return resultado
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas geográficas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/alertas")
async def estadisticas_alertas(
    dias: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Estadísticas del sistema de alertas"""
    try:
        alert_system = AlertSystem()
        stats = alert_system.get_alert_statistics(db, dias)
        return stats
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas de alertas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scraping/ejecutar")
async def ejecutar_scraping_manual():
    """Ejecutar scraping manual (útil para testing)"""
    try:
        scraping_service = ScrapingService()
        result = scraping_service.execute_scraping()
        return result
    except Exception as e:
        logger.error(f"Error en scraping manual: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/noticias/generar-contenido")
async def generar_contenido_noticias(db: Session = Depends(get_db)):
    """Generar contenido automático para noticias que no tienen contenido"""
    try:
        # Buscar noticias sin contenido o con contenido muy corto
        noticias_sin_contenido = db.query(Noticia).filter(
            or_(
                Noticia.contenido == None,
                Noticia.contenido == '',
                func.length(Noticia.contenido) < 100
            )
        ).limit(50).all()  # Limitar a 50 para evitar sobrecarga
        
        updated_count = 0
        
        for noticia in noticias_sin_contenido:
            try:
                # Generar contenido basado en el título y categoría
                nuevo_contenido = generate_content_for_news(
                    title=noticia.titulo,
                    existing_content=noticia.contenido or "",
                    category=noticia.categoria or "mundo"
                )
                
                # Actualizar la noticia
                noticia.contenido = nuevo_contenido
                updated_count += 1
                
            except Exception as e:
                logger.error(f"Error generando contenido para noticia {noticia.id}: {e}")
                continue
        
        # Confirmar cambios
        db.commit()
        
        return {
            "success": True,
            "message": f"Contenido generado para {updated_count} noticias",
            "noticias_procesadas": updated_count,
            "noticias_encontradas": len(noticias_sin_contenido)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error generando contenido: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
