from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Diario(Base):
    __tablename__ = "diarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, index=True, nullable=False)
    url = Column(String(500), nullable=False)
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    
    # Relación con noticias
    noticias = relationship("Noticia", back_populates="diario")

class Noticia(Base):
    __tablename__ = "noticias"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(500), nullable=False, index=True)
    contenido = Column(Text)
    enlace = Column(String(1000))
    categoria = Column(String(100), nullable=False, index=True)
    fecha_publicacion = Column(DateTime)
    fecha_extraccion = Column(DateTime, default=datetime.utcnow, index=True)
    diario_id = Column(Integer, ForeignKey("diarios.id"), nullable=False)
    
    # Relación con diario
    diario = relationship("Diario", back_populates="noticias")

class EstadisticaScraping(Base):
    __tablename__ = "estadisticas_scraping"
    
    id = Column(Integer, primary_key=True, index=True)
    diario_id = Column(Integer, ForeignKey("diarios.id"), nullable=False)
    categoria = Column(String(100), nullable=False)
    cantidad_noticias = Column(Integer, default=0)
    fecha_scraping = Column(DateTime, default=datetime.utcnow, index=True)
    duracion_segundos = Column(Integer)
    estado = Column(String(50), default='exitoso')
    
    # Relación con diario
    diario = relationship("Diario")
