"""
Modelos para sistema UGC (User Generated Content) con roles y ganancias
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import bcrypt
import enum

# Enum para tipos de roles
class RoleEnum(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

# Enum para tipos de contenido
class TipoContenido(str, enum.Enum):
    TEXTO = "texto"
    IMAGEN = "imagen"
    VIDEO = "video"
    COMENTARIO = "comentario"
    RESENA = "resena"
    POST = "post"

class User(Base):
    """Modelo de usuario con roles simples"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(RoleEnum), default=RoleEnum.USER, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    activo = Column(Boolean, default=True)
    
    # Relaciones
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    ingresos = relationship("Ingreso", back_populates="user", cascade="all, delete-orphan")
    
    def set_password(self, password: str):
        """Encriptar y establecer contraseña"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        """Verificar contraseña"""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
        except Exception:
            return False
    
    def is_admin(self) -> bool:
        """Verificar si es admin"""
        return self.role == RoleEnum.ADMIN
    
    def get_total_ingresos(self) -> float:
        """Calcular ingresos totales del usuario"""
        return sum(ingreso.monto for ingreso in self.ingresos)

class Post(Base):
    """Modelo de publicación de usuario"""
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tipo = Column(SQLEnum(TipoContenido), nullable=False)
    contenido = Column(Text, nullable=False)  # Puede ser texto o URL
    views = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    interacciones = Column(Integer, default=0)
    aprobado = Column(Boolean, default=True)  # Por defecto aprobado
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    user = relationship("User", back_populates="posts")
    ingresos = relationship("Ingreso", back_populates="post", cascade="all, delete-orphan")
    
    def get_total_interacciones(self) -> int:
        """Total de interacciones (views + clicks)"""
        return self.views + self.clicks + self.interacciones
    
    def registrar_interaccion(self, tipo: str = "view"):
        """Registrar una interacción y generar ingreso"""
        if tipo == "view":
            self.views += 1
        elif tipo == "click":
            self.clicks += 1
        else:
            self.interacciones += 1

class Ingreso(Base):
    """Modelo de ingresos generados por interacciones"""
    __tablename__ = "ingresos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)  # NULL para ingresos del admin
    monto = Column(Float, nullable=False)  # Monto en USD
    tipo = Column(String(20), nullable=False)  # 'admin' o 'creator'
    concepto = Column(String(100))  # Descripción del ingreso
    fecha = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    user = relationship("User", back_populates="ingresos")
    post = relationship("Post", back_populates="ingresos")

