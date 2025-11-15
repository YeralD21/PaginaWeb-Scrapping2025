from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import hashlib
import json

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
    imagen_url = Column(String(1000))
    categoria = Column(String(100), nullable=False, index=True)
    fecha_publicacion = Column(DateTime)
    fecha_extraccion = Column(DateTime, default=datetime.utcnow, index=True)
    diario_id = Column(Integer, ForeignKey("diarios.id"), nullable=False)
    
    # NUEVOS CAMPOS EXTENDIDOS
    autor = Column(String(200))
    tags = Column(JSON)  # Lista de tags como JSON
    sentimiento = Column(String(20))  # positivo, negativo, neutral
    tiempo_lectura_min = Column(Integer)
    popularidad_score = Column(Float, default=0.0)
    es_trending = Column(Boolean, default=False)
    es_premium = Column(Boolean, default=False)  # Contenido exclusivo para suscriptores
    premium_score = Column(Float, default=0.0)
    palabras_clave = Column(JSON)  # Lista de palabras clave como JSON
    resumen_auto = Column(Text)  # Resumen automático
    idioma = Column(String(5), default='es')
    region = Column(String(100))  # Lima, Arequipa, etc.
    
    # CAMPOS PARA DETECCIÓN DE DUPLICADOS
    titulo_hash = Column(String(64), index=True)  # Hash MD5 del título normalizado
    contenido_hash = Column(String(64), index=True)  # Hash MD5 del contenido normalizado
    similarity_hash = Column(String(64), index=True)  # Hash para detección de similitud
    
    # CAMPOS PARA ALERTAS
    es_alerta = Column(Boolean, default=False)
    nivel_urgencia = Column(String(20))  # baja, media, alta, critica
    keywords_alerta = Column(JSON)  # Palabras clave que activaron alertas
    
    # CAMPOS PARA CLASIFICACIÓN GEOGRÁFICA
    geographic_type = Column(String(20), default='nacional')  # internacional, nacional, regional, local
    geographic_confidence = Column(Float, default=0.5)  # Confianza de la clasificación (0-1)
    geographic_keywords = Column(JSON)  # Palabras clave geográficas encontradas
    
    # Relación con diario
    diario = relationship("Diario", back_populates="noticias")
    
    def generate_hashes(self):
        """Generar hashes para detección de duplicados"""
        # Normalizar título (minúsculas, sin espacios extras, sin puntuación)
        titulo_normalizado = self.normalize_text(self.titulo)
        self.titulo_hash = hashlib.md5(titulo_normalizado.encode('utf-8')).hexdigest()
        
        # Hash del contenido si existe
        if self.contenido:
            contenido_normalizado = self.normalize_text(self.contenido)
            self.contenido_hash = hashlib.md5(contenido_normalizado.encode('utf-8')).hexdigest()
        
        # Hash de similitud (combinación de palabras clave del título)
        palabras_clave = self.extract_keywords(titulo_normalizado)
        similarity_text = ' '.join(sorted(palabras_clave))
        self.similarity_hash = hashlib.md5(similarity_text.encode('utf-8')).hexdigest()
    
    @staticmethod
    def normalize_text(text):
        """Normalizar texto para comparación"""
        import re
        if not text:
            return ""
        
        # Convertir a minúsculas
        text = text.lower()
        
        # Remover puntuación y caracteres especiales
        text = re.sub(r'[^\w\s]', '', text)
        
        # Remover espacios múltiples
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    @staticmethod
    def extract_keywords(text, min_length=4):
        """Extraer palabras clave del texto"""
        if not text:
            return []
        
        # Palabras comunes a ignorar
        stop_words = {'para', 'con', 'por', 'una', 'uno', 'del', 'las', 'los', 'que', 'como', 'pero', 'más', 'sin', 'sobre', 'tras', 'hasta', 'desde', 'ante', 'bajo', 'entre', 'hacia', 'según', 'durante'}
        
        palabras = text.split()
        keywords = []
        
        for palabra in palabras:
            if len(palabra) >= min_length and palabra not in stop_words:
                keywords.append(palabra)
        
        return keywords[:10]  # Limitar a 10 palabras clave

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

class AlertaConfiguracion(Base):
    """Configuración de alertas personalizadas"""
    __tablename__ = "alertas_configuracion"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    keywords = Column(JSON, nullable=False)  # Lista de palabras clave
    categorias = Column(JSON)  # Categorías específicas (opcional)
    diarios = Column(JSON)  # Diarios específicos (opcional)
    nivel_urgencia = Column(String(20), default='media')  # baja, media, alta, critica
    activa = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    
    # Configuración de notificación
    notificar_email = Column(Boolean, default=False)
    email_destino = Column(String(200))
    notificar_webhook = Column(Boolean, default=False)
    webhook_url = Column(String(500))

class AlertaDisparo(Base):
    """Registro de alertas disparadas"""
    __tablename__ = "alertas_disparos"
    
    id = Column(Integer, primary_key=True, index=True)
    configuracion_id = Column(Integer, ForeignKey("alertas_configuracion.id"), nullable=False)
    noticia_id = Column(Integer, ForeignKey("noticias.id"), nullable=False)
    keyword_match = Column(String(100))  # Palabra clave que activó la alerta
    nivel_urgencia = Column(String(20))
    fecha_disparo = Column(DateTime, default=datetime.utcnow, index=True)
    notificacion_enviada = Column(Boolean, default=False)
    
    # Relaciones
    configuracion = relationship("AlertaConfiguracion")
    noticia = relationship("Noticia")

class TrendingKeywords(Base):
    """Palabras clave trending por periodo"""
    __tablename__ = "trending_keywords"
    
    id = Column(Integer, primary_key=True, index=True)
    palabra = Column(String(100), nullable=False, index=True)
    frecuencia = Column(Integer, default=1)
    categoria = Column(String(50))
    fecha = Column(DateTime, default=datetime.utcnow, index=True)
    periodo = Column(String(20), default='diario')  # diario, semanal, mensual
    score_trending = Column(Float, default=0.0)


class SubscriptionPlan(Base):
    """Planes de suscripción disponibles"""
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    descripcion = Column(Text)
    precio = Column(Float, nullable=False)
    periodo = Column(String(20), nullable=False)  # semanal, mensual, anual, trimestral, personalizado
    # Campos para período personalizado
    periodo_tipo = Column(String(20), nullable=True)  # minutos, horas, dias, semanas, meses, años
    periodo_cantidad = Column(Integer, nullable=True)  # Cantidad del período personalizado
    beneficios = Column(JSON)  # Lista de perks visibles para el usuario
    es_activo = Column(Boolean, default=True)
    creado_en = Column(DateTime, default=datetime.utcnow)

    # Relación con suscripciones
    suscripciones = relationship("UserSubscription", back_populates="plan")


class UserSubscription(Base):
    """Suscripciones contratadas por los usuarios"""
    __tablename__ = "user_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=False)
    estado = Column(String(20), default="pending")  # pending, active, cancelled, expired, rejected
    referencia_pago = Column(String(100))
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    fecha_fin = Column(DateTime, nullable=True)
    renovacion_automatica = Column(Boolean, default=False)
    ultimo_recordatorio = Column(DateTime, nullable=True)
    creado_en = Column(DateTime, default=datetime.utcnow)
    
    # Campos para gestión de pagos
    motivo_rechazo = Column(Text, nullable=True)
    fecha_pago_notificado = Column(DateTime, nullable=True)
    revisado_por = Column(Integer, ForeignKey("users.id"), nullable=True)
    fecha_revision = Column(DateTime, nullable=True)
    
    # Campos para cancelación
    motivo_cancelacion = Column(Text, nullable=True)
    fecha_cancelacion = Column(DateTime, nullable=True)
    cancelado_por = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relaciones
    plan = relationship("SubscriptionPlan", back_populates="suscripciones")
    user = relationship("User", foreign_keys=[user_id], back_populates="subscriptions")
class SiteMonitoring(Base):
    """Monitoreo de salud de sitios web"""
    __tablename__ = "site_monitoring"
    
    id = Column(Integer, primary_key=True, index=True)
    diario_id = Column(Integer, ForeignKey("diarios.id"), nullable=False)
    url = Column(String(500), nullable=False)
    last_check = Column(DateTime, default=datetime.utcnow)
    status_code = Column(Integer)
    response_time_ms = Column(Integer)
    structure_changed = Column(Boolean, default=False)
    error_count = Column(Integer, default=0)
    last_error = Column(Text)
    
    # Relación con diario
    diario = relationship("Diario")
