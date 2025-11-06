"""
Script para actualizar fechas antiguas de noticias de Twitter a fecha actual (2025)
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import Noticia, Diario
from datetime import datetime, timezone
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_twitter_dates():
    """Actualiza las fechas de publicación de noticias de Twitter a fecha actual (2025) con timezone UTC"""
    db = SessionLocal()
    
    try:
        # Buscar el diario de Twitter
        twitter_diario = db.query(Diario).filter(Diario.nombre == 'Twitter').first()
        
        if not twitter_diario:
            logger.warning("⚠️ Diario 'Twitter' no encontrado en la base de datos.")
            return
        
        # Obtener TODAS las noticias de Twitter para actualizar
        twitter_news = db.query(Noticia).filter(
            Noticia.diario_id == twitter_diario.id
        ).all()
        
        logger.info(f"📊 Encontradas {len(twitter_news)} noticias de Twitter")
        
        # Actualizar todas las fechas a fecha actual con timezone UTC
        fecha_actual = datetime.now(timezone.utc)
        updated_count = 0
        
        for noticia in twitter_news:
            fecha_antigua = noticia.fecha_publicacion
            
            # Si la fecha no tiene timezone o es anterior a 2025, actualizarla
            necesita_actualizar = False
            
            if fecha_antigua:
                # Verificar si tiene timezone
                if fecha_antigua.tzinfo is None:
                    necesita_actualizar = True
                    logger.info(f"⚠️ Fecha sin timezone: '{noticia.titulo[:50]}...' - {fecha_antigua}")
                # Verificar si es anterior a 2025
                elif fecha_antigua.year < 2025:
                    necesita_actualizar = True
                    logger.info(f"⚠️ Fecha anterior a 2025: '{noticia.titulo[:50]}...' - {fecha_antigua}")
            else:
                necesita_actualizar = True
                logger.info(f"⚠️ Fecha nula: '{noticia.titulo[:50]}...'")
            
            if necesita_actualizar:
                noticia.fecha_publicacion = fecha_actual
                updated_count += 1
                logger.info(f"🔄 Actualizada: '{noticia.titulo[:50]}...' - {fecha_antigua} → {fecha_actual.date()}")
        
        db.commit()
        logger.info(f"✅ Total de noticias actualizadas: {updated_count}")
        
    except Exception as e:
        logger.error(f"❌ Error al actualizar fechas de Twitter: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("🚀 Iniciando actualización de fechas de Twitter...")
    update_twitter_dates()
    logger.info("✅ Proceso completado")
