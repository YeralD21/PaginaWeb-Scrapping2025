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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
