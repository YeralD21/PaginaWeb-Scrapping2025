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
    limit: int = Query(50),
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
    fecha_limite = datetime.now(timezone.utc) - timedelta(hours=24)
    
    query = db.query(
        Diario.nombre,
        Noticia.categoria,
        func.count(Noticia.id).label('cantidad')
    ).join(Noticia).filter(
        Noticia.fecha_extraccion >= fecha_limite
    ).group_by(
        Diario.nombre, Noticia.categoria
    ).order_by(
        Diario.nombre, Noticia.categoria
    )
    
    resultados = query.all()
    
    return [
        {
            "diario": result.nombre,
            "categoria": result.categoria,
            "cantidad": result.cantidad
        }
        for result in resultados
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
