"""
Modelos mejorados para sistema UGC con revisión, reportes y detección de fake news
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Float, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import bcrypt
import enum

# ===== ENUMS =====

class RoleEnum(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

class TipoContenido(str, enum.Enum):
    TEXTO = "texto"
    IMAGEN = "imagen"
    VIDEO = "video"
    COMENTARIO = "comentario"
    RESENA = "resena"
    POST = "post"
    NOTICIA = "noticia"  # Nuevo: para noticias UGC
    
    def __str__(self):
        return self.value

class EstadoPublicacion(str, enum.Enum):
    """Estados del ciclo de vida de una publicación"""
    DRAFT = "draft"                    # Borrador, no enviado
    PENDING_REVIEW = "pending_review"  # Enviado, esperando aprobación
    PUBLISHED = "published"            # Aprobado y visible públicamente
    REJECTED = "rejected"              # Rechazado por admin
    FLAGGED = "flagged"                # Marcado por muchos reportes
    FAKE = "fake"                      # Confirmado como falso por admin
    
    def __str__(self):
        return self.value

class EstadoReporte(str, enum.Enum):
    """Estados de un reporte"""
    PENDING = "pending"      # Pendiente de revisión
    REVIEWED = "reviewed"    # Revisado por admin
    DISMISSED = "dismissed"  # Descartado como infundado

class TipoReaccion(str, enum.Enum):
    """Tipos de reacciones disponibles"""
    LIKE = "like"              # 👍 Me gusta
    LOVE = "love"              # ❤️ Me encanta
    HAHA = "haha"              # 😂 Me divierte
    SAD = "sad"                # 😢 Me entristece
    ANGRY = "angry"            # 😠 Me enoja
    
    def __str__(self):
        return self.value

class MotivoReporte(str, enum.Enum):
    """Motivos predefinidos para reportar"""
    INFORMACION_FALSA = "informacion_falsa"
    CONTENIDO_OFENSIVO = "contenido_ofensivo"
    SPAM = "spam"
    VIOLENCIA = "violencia"
    ACOSO = "acoso"
    DERECHOS_AUTOR = "derechos_autor"
    OTRO = "otro"

# ===== MODELOS =====

class User(Base):
    """Modelo de usuario con roles y suspensiones"""
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(RoleEnum), default=RoleEnum.USER, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    activo = Column(Boolean, default=True)
    
    # Nuevos campos para suspensión
    suspendido = Column(Boolean, default=False)
    motivo_suspension = Column(Text, nullable=True)
    fecha_suspension = Column(DateTime, nullable=True)
    suspendido_por = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin que suspendió
    
    # Relaciones
    posts = relationship("Post", back_populates="user", foreign_keys="Post.user_id", cascade="all, delete-orphan")
    ingresos = relationship("Ingreso", back_populates="user", cascade="all, delete-orphan")
    reportes_enviados = relationship("Report", back_populates="reporter", foreign_keys="Report.reporter_id")
    notificaciones = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    
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
    
    def suspender(self, motivo: str, admin_id: int):
        """Suspender usuario"""
        self.suspendido = True
        self.motivo_suspension = motivo
        self.fecha_suspension = datetime.utcnow()
        self.suspendido_por = admin_id
        self.activo = False
    
    def reactivar(self):
        """Reactivar usuario suspendido"""
        self.suspendido = False
        self.motivo_suspension = None
        self.fecha_suspension = None
        self.activo = True

class Post(Base):
    """Modelo de publicación con estados y revisión"""
    __tablename__ = "posts"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tipo = Column(String(50), nullable=False)  # Cambiado de Enum a String para compatibilidad
    contenido = Column(Text, nullable=False)
    titulo = Column(String(255), nullable=True)  # Opcional para noticias
    descripcion = Column(Text, nullable=True)  # Descripción breve para noticias
    imagen_url = Column(String(500), nullable=True)  # URL de imagen para noticias
    fuente = Column(String(255), nullable=True)  # Fuente de la noticia
    
    # Métricas
    views = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    interacciones = Column(Integer, default=0)
    
    # Estado de la publicación
    estado = Column(String(50), default='pending_review', nullable=False)  # Cambiado de Enum a String
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Revisión por admin
    revisado_por = Column(Integer, ForeignKey("users.id"), nullable=True)
    fecha_revision = Column(DateTime, nullable=True)
    motivo_rechazo = Column(Text, nullable=True)
    
    # Reportes y fake news
    total_reportes = Column(Integer, default=0)
    fecha_flagged = Column(DateTime, nullable=True)
    verificado_como_fake = Column(Boolean, default=False)
    fecha_verificacion_fake = Column(DateTime, nullable=True)
    
    # Relaciones
    user = relationship("User", back_populates="posts", foreign_keys=[user_id])
    revisor = relationship("User", foreign_keys=[revisado_por])
    ingresos = relationship("Ingreso", back_populates="post", cascade="all, delete-orphan")
    reportes = relationship("Report", back_populates="post", cascade="all, delete-orphan")
    
    def aprobar(self, admin_id: int):
        """Aprobar publicación"""
        self.estado = EstadoPublicacion.PUBLISHED
        self.revisado_por = admin_id
        self.fecha_revision = datetime.utcnow()
    
    def rechazar(self, admin_id: int, motivo: str):
        """Rechazar publicación"""
        self.estado = EstadoPublicacion.REJECTED
        self.revisado_por = admin_id
        self.fecha_revision = datetime.utcnow()
        self.motivo_rechazo = motivo
    
    def marcar_como_flagged(self):
        """Marcar como sospechosa por reportes"""
        self.estado = EstadoPublicacion.FLAGGED
        self.fecha_flagged = datetime.utcnow()
    
    def confirmar_fake(self, admin_id: int):
        """Confirmar como noticia falsa"""
        self.estado = EstadoPublicacion.FAKE
        self.verificado_como_fake = True
        self.fecha_verificacion_fake = datetime.utcnow()
        self.revisado_por = admin_id
    
    def descartar_reportes(self, admin_id: int):
        """Descartar reportes y volver a publicado"""
        self.estado = EstadoPublicacion.PUBLISHED
        self.revisado_por = admin_id
        self.fecha_revision = datetime.utcnow()

class Report(Base):
    """Modelo de reporte de publicación"""
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Detalles del reporte
    motivo = Column(SQLEnum(MotivoReporte), nullable=False)
    comentario = Column(Text, nullable=False)  # Obligatorio
    estado = Column(SQLEnum(EstadoReporte), default=EstadoReporte.PENDING, nullable=False)
    
    # Auditoría
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    revisado_por = Column(Integer, ForeignKey("users.id"), nullable=True)
    fecha_revision = Column(DateTime, nullable=True)
    notas_admin = Column(Text, nullable=True)
    
    # Relaciones
    post = relationship("Post", back_populates="reportes")
    reporter = relationship("User", back_populates="reportes_enviados", foreign_keys=[reporter_id])
    revisor = relationship("User", foreign_keys=[revisado_por])
    
    # Constraint: un usuario solo puede reportar una vez cada publicación
    __table_args__ = (
        UniqueConstraint('post_id', 'reporter_id', name='unique_report_per_user_post'),
    )

class Notification(Base):
    """Modelo de notificaciones para usuarios"""
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Contenido de la notificación
    titulo = Column(String(255), nullable=False)
    mensaje = Column(Text, nullable=False)
    tipo = Column(String(50), nullable=False)  # 'review_result', 'report_threshold', 'suspension', etc.
    
    # Referencia opcional a entidad relacionada
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    
    # Estado
    leida = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    user = relationship("User", back_populates="notificaciones")
    post = relationship("Post")

class SystemSettings(Base):
    """Configuración del sistema"""
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    clave = Column(String(100), unique=True, nullable=False)
    valor = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relaciones
    actualizador = relationship("User")

class Reaction(Base):
    """Modelo de reacciones a publicaciones"""
    __tablename__ = "reactions"
    __table_args__ = (
        UniqueConstraint('post_id', 'user_id', name='unique_user_post_reaction'),
        {'extend_existing': True}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null para usuarios anónimos
    session_id = Column(String(255), nullable=True)  # Para usuarios anónimos
    tipo = Column(String(50), nullable=False)  # like, love, haha, sad, angry
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    post = relationship("Post", backref="reactions")
    user = relationship("User", backref="reactions")

class Ingreso(Base):
    """Modelo de ingresos (sin cambios)"""
    __tablename__ = "ingresos"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    monto = Column(Float, nullable=False)
    tipo = Column(String(20), nullable=False)  # 'admin' o 'creator'
    concepto = Column(String(100))
    fecha = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    user = relationship("User", back_populates="ingresos")
    post = relationship("Post", back_populates="ingresos")
