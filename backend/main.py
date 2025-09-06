from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import logging
from contextlib import asynccontextmanager

from database import get_db, create_tables, test_connection
from models import Diario, Noticia, EstadisticaScraping
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
    limit: int = Query(100),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    query = db.query(Noticia).join(Diario)
    
    if categoria:
        query = query.filter(Noticia.categoria == categoria)
    if diario:
        query = query.filter(Diario.nombre == diario)
    
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
            fecha_extraccion=noticia.fecha_extraccion.isoformat(),
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
        # Parsear la fecha
        fecha_obj = datetime.strptime(fecha, "%Y-%m-%d").date()
        fecha_inicio = datetime.combine(fecha_obj, datetime.min.time())
        fecha_fin = datetime.combine(fecha_obj, datetime.max.time())
        
        # Obtener noticias de esa fecha
        query = db.query(Noticia).join(Diario).filter(
            Noticia.fecha_extraccion >= fecha_inicio,
            Noticia.fecha_extraccion <= fecha_fin
        ).order_by(Noticia.fecha_extraccion.desc())
        
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
                fecha_extraccion=noticia.fecha_extraccion.isoformat(),
                diario_nombre=noticia.diario.nombre
            ))
        
        return result
        
    except ValueError:
        return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}

@app.get("/noticias/fechas-disponibles")
async def get_fechas_disponibles(db: Session = Depends(get_db)):
    """Obtener todas las fechas que tienen noticias"""
    from datetime import datetime
    
    # Obtener fechas únicas de noticias
    fechas = db.query(
        func.date(Noticia.fecha_extraccion).label('fecha')
    ).distinct().order_by(
        func.date(Noticia.fecha_extraccion).desc()
    ).all()
    
    # Formatear fechas
    fechas_formateadas = []
    for fecha in fechas:
        fecha_obj = fecha.fecha
        fechas_formateadas.append({
            "fecha": fecha_obj.strftime("%Y-%m-%d"),
            "fecha_formateada": fecha_obj.strftime("%d/%m/%Y"),
            "dia_semana": fecha_obj.strftime("%A"),
            "total_noticias": db.query(func.count(Noticia.id)).filter(
                func.date(Noticia.fecha_extraccion) == fecha_obj
            ).scalar()
        })
    
    return {
        "fechas": fechas_formateadas,
        "total_fechas": len(fechas_formateadas)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
