"""
Servicio de notificaciones para usuarios
"""

from sqlalchemy.orm import Session
from models_ugc_enhanced import Notification, User, Post
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    """Servicio para crear y gestionar notificaciones"""
    
    @staticmethod
    def crear_notificacion(
        db: Session,
        user_id: int,
        titulo: str,
        mensaje: str,
        tipo: str,
        post_id: int = None
    ) -> Notification:
        """Crear una nueva notificación"""
        try:
            notificacion = Notification(
                user_id=user_id,
                titulo=titulo,
                mensaje=mensaje,
                tipo=tipo,
                post_id=post_id
            )
            db.add(notificacion)
            db.commit()
            db.refresh(notificacion)
            logger.info(f"✅ Notificación creada para usuario {user_id}: {titulo}")
            return notificacion
        except Exception as e:
            logger.error(f"❌ Error creando notificación: {e}")
            db.rollback()
            return None
    
    @staticmethod
    def notificar_envio_revision(db: Session, user_id: int, post_id: int):
        """Notificar que la publicación fue enviada a revisión"""
        return NotificationService.crear_notificacion(
            db=db,
            user_id=user_id,
            titulo="Publicación enviada a revisión",
            mensaje="Tu publicación ha sido enviada y será revisada por los administradores antes de publicarse.",
            tipo="pending_review",
            post_id=post_id
        )
    
    @staticmethod
    def notificar_aprobacion(db: Session, user_id: int, post_id: int):
        """Notificar que la publicación fue aprobada"""
        return NotificationService.crear_notificacion(
            db=db,
            user_id=user_id,
            titulo="¡Publicación aprobada!",
            mensaje="Tu publicación ha sido aprobada y ahora es visible públicamente.",
            tipo="approved",
            post_id=post_id
        )
    
    @staticmethod
    def notificar_rechazo(db: Session, user_id: int, post_id: int, motivo: str):
        """Notificar que la publicación fue rechazada"""
        return NotificationService.crear_notificacion(
            db=db,
            user_id=user_id,
            titulo="Publicación rechazada",
            mensaje=f"Tu publicación ha sido rechazada. Motivo: {motivo}",
            tipo="rejected",
            post_id=post_id
        )
    
    @staticmethod
    def notificar_flagged(db: Session, user_id: int, post_id: int, total_reportes: int):
        """Notificar que la publicación fue marcada por reportes"""
        return NotificationService.crear_notificacion(
            db=db,
            user_id=user_id,
            titulo="Publicación marcada como sospechosa",
            mensaje=f"Tu publicación ha superado el límite de reportes ({total_reportes}) y ha sido marcada como posible noticia falsa. Será revisada por un administrador.",
            tipo="flagged",
            post_id=post_id
        )
    
    @staticmethod
    def notificar_fake(db: Session, user_id: int, post_id: int):
        """Notificar que la publicación fue confirmada como falsa"""
        return NotificationService.crear_notificacion(
            db=db,
            user_id=user_id,
            titulo="Publicación confirmada como falsa",
            mensaje="Tu publicación ha sido confirmada como información falsa por los administradores. Tu cuenta ha sido suspendida.",
            tipo="fake_news",
            post_id=post_id
        )
    
    @staticmethod
    def notificar_suspension(db: Session, user_id: int, motivo: str):
        """Notificar suspensión de cuenta"""
        return NotificationService.crear_notificacion(
            db=db,
            user_id=user_id,
            titulo="Cuenta suspendida",
            mensaje=f"Tu cuenta ha sido suspendida. Motivo: {motivo}",
            tipo="suspension"
        )
    
    @staticmethod
    def obtener_notificaciones(db: Session, user_id: int, solo_no_leidas: bool = False):
        """Obtener notificaciones de un usuario"""
        query = db.query(Notification).filter(Notification.user_id == user_id)
        
        if solo_no_leidas:
            query = query.filter(Notification.leida == False)
        
        return query.order_by(Notification.created_at.desc()).all()
    
    @staticmethod
    def marcar_como_leida(db: Session, notification_id: int):
        """Marcar notificación como leída"""
        notificacion = db.query(Notification).filter(Notification.id == notification_id).first()
        if notificacion:
            notificacion.leida = True
            db.commit()
            return True
        return False
    
    @staticmethod
    def marcar_todas_leidas(db: Session, user_id: int):
        """Marcar todas las notificaciones como leídas"""
        db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.leida == False
        ).update({"leida": True})
        db.commit()
