"""
Servicio para manejo de reportes y detección de fake news
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from models_ugc_enhanced import (
    Report, Post, User, SystemSettings,
    EstadoReporte, EstadoPublicacion, MotivoReporte
)
from notification_service import NotificationService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ReportService:
    """Servicio para manejo de reportes"""
    
    @staticmethod
    def get_report_threshold(db: Session) -> int:
        """Obtener umbral de reportes desde configuración"""
        setting = db.query(SystemSettings).filter(
            SystemSettings.clave == "report_threshold"
        ).first()
        
        if setting:
            return int(setting.valor)
        return 10  # Valor por defecto
    
    @staticmethod
    def set_report_threshold(db: Session, new_threshold: int, admin_id: int) -> bool:
        """Actualizar umbral de reportes"""
        try:
            setting = db.query(SystemSettings).filter(
                SystemSettings.clave == "report_threshold"
            ).first()
            
            if setting:
                setting.valor = str(new_threshold)
                setting.updated_by = admin_id
                setting.updated_at = datetime.utcnow()
            else:
                setting = SystemSettings(
                    clave="report_threshold",
                    valor=str(new_threshold),
                    descripcion="Número de reportes necesarios para marcar como flagged",
                    updated_by=admin_id
                )
                db.add(setting)
            
            db.commit()
            logger.info(f"✅ Umbral de reportes actualizado a {new_threshold}")
            return True
        except Exception as e:
            logger.error(f"❌ Error actualizando umbral: {e}")
            db.rollback()
            return False
    
    @staticmethod
    def crear_reporte(
        db: Session,
        post_id: int,
        reporter_id: int,
        motivo: MotivoReporte,
        comentario: str
    ) -> dict:
        """Crear un nuevo reporte"""
        try:
            # Verificar que el post existe
            post = db.query(Post).filter(Post.id == post_id).first()
            if not post:
                return {"success": False, "error": "Publicación no encontrada"}
            
            # Verificar que el post está published
            if post.estado != 'published':
                return {"success": False, "error": "Solo se pueden reportar publicaciones publicadas"}
            
            # Verificar que el usuario no se reporte a sí mismo
            if post.user_id == reporter_id:
                return {"success": False, "error": "No puedes reportar tu propia publicación"}
            
            # Verificar si ya existe un reporte de este usuario para este post
            existing_report = db.query(Report).filter(
                Report.post_id == post_id,
                Report.reporter_id == reporter_id
            ).first()
            
            if existing_report:
                return {"success": False, "error": "Ya has reportado esta publicación"}
            
            # Crear el reporte
            report = Report(
                post_id=post_id,
                reporter_id=reporter_id,
                motivo=motivo,
                comentario=comentario
            )
            db.add(report)
            
            # Incrementar contador de reportes del post
            post.total_reportes += 1
            
            # Verificar si se alcanzó el umbral
            threshold = ReportService.get_report_threshold(db)
            
            if post.total_reportes >= threshold and post.estado != 'flagged':
                # Marcar como flagged
                post.estado = 'flagged'
                post.fecha_flagged = datetime.now()
                
                # Notificar al autor
                NotificationService.notificar_flagged(
                    db=db,
                    user_id=post.user_id,
                    post_id=post.id,
                    total_reportes=post.total_reportes
                )
                
                logger.warning(f"🚩 Post {post_id} marcado como FLAGGED ({post.total_reportes} reportes)")
            
            db.commit()
            
            logger.info(f"✅ Reporte creado: Post {post_id} por usuario {reporter_id}")
            
            return {
                "success": True,
                "report_id": report.id,
                "total_reportes": post.total_reportes,
                "flagged": post.estado == 'flagged'
            }
            
        except Exception as e:
            logger.error(f"❌ Error creando reporte: {e}")
            db.rollback()
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def obtener_reportes_por_post(db: Session, post_id: int):
        """Obtener todos los reportes de una publicación"""
        return db.query(Report).filter(Report.post_id == post_id).all()
    
    @staticmethod
    def obtener_posts_reportados(db: Session, solo_flagged: bool = False):
        """Obtener posts con reportes"""
        query = db.query(Post).filter(Post.total_reportes > 0)
        
        if solo_flagged:
            query = query.filter(Post.estado == 'flagged')
        
        return query.order_by(Post.total_reportes.desc()).all()
    
    @staticmethod
    def confirmar_fake(db: Session, post_id: int, admin_id: int) -> dict:
        """Confirmar publicación como fake news y suspender autor"""
        try:
            post = db.query(Post).filter(Post.id == post_id).first()
            if not post:
                return {"success": False, "error": "Publicación no encontrada"}
            
            # Marcar post como fake
            post.estado = 'fake'
            post.verificado_como_fake = True
            post.fecha_verificacion_fake = datetime.now()
            post.revisado_por = admin_id
            
            # Suspender al autor
            author = db.query(User).filter(User.id == post.user_id).first()
            if author:
                author.suspendido = True
                author.motivo_suspension = "Publicación de información falsa confirmada por administración"
                author.fecha_suspension = datetime.now()
                author.suspendido_por = admin_id
                
                # Notificar al autor
                NotificationService.notificar_fake(
                    db=db,
                    user_id=author.id,
                    post_id=post.id
                )
                
                NotificationService.notificar_suspension(
                    db=db,
                    user_id=author.id,
                    motivo="Publicación de información falsa"
                )
            
            # Marcar reportes como revisados
            db.query(Report).filter(Report.post_id == post_id).update({
                "estado": EstadoReporte.REVIEWED,
                "revisado_por": admin_id,
                "fecha_revision": datetime.utcnow()
            })
            
            db.commit()
            
            logger.warning(f"🚫 Post {post_id} confirmado como FAKE. Usuario {post.user_id} suspendido.")
            
            return {
                "success": True,
                "message": "Publicación marcada como fake y usuario suspendido"
            }
            
        except Exception as e:
            logger.error(f"❌ Error confirmando fake: {e}")
            db.rollback()
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def descartar_reportes(db: Session, post_id: int, admin_id: int) -> dict:
        """Descartar reportes y restaurar publicación"""
        try:
            post = db.query(Post).filter(Post.id == post_id).first()
            if not post:
                return {"success": False, "error": "Publicación no encontrada"}
            
            # Restaurar estado published
            post.estado = 'published'
            post.total_reportes = 0
            post.fecha_flagged = None
            post.revisado_por = admin_id
            post.fecha_revision = datetime.now()
            
            # Marcar reportes como descartados (resolved)
            db.query(Report).filter(Report.post_id == post_id).update({
                "estado": 'resolved'
            }, synchronize_session=False)
            
            db.commit()
            
            logger.info(f"✅ Reportes descartados para post {post_id}")
            
            return {
                "success": True,
                "message": "Reportes descartados y publicación restaurada"
            }
            
        except Exception as e:
            logger.error(f"❌ Error descartando reportes: {e}")
            db.rollback()
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def obtener_estadisticas_reportes(db: Session):
        """Obtener estadísticas de reportes"""
        total_reportes = db.query(func.count(Report.id)).scalar()
        reportes_pendientes = db.query(func.count(Report.id)).filter(
            Report.estado == 'pending'
        ).scalar()
        posts_flagged = db.query(func.count(Post.id)).filter(
            Post.estado == 'flagged'
        ).scalar()
        posts_fake = db.query(func.count(Post.id)).filter(
            Post.estado == 'fake'
        ).scalar()
        
        return {
            "total_reportes": total_reportes,
            "reportes_pendientes": reportes_pendientes,
            "posts_flagged": posts_flagged,
            "posts_fake": posts_fake,
            "threshold_actual": ReportService.get_report_threshold(db)
        }
