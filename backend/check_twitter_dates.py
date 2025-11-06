"""
Script para verificar las fechas de noticias de Twitter en la base de datos
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import Noticia, Diario
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_twitter_dates():
    """Verifica las fechas de publicación de noticias de Twitter"""
    db = SessionLocal()
    
    try:
        # Buscar el diario de Twitter
        twitter_diario = db.query(Diario).filter(Diario.nombre == 'Twitter').first()
        
        if not twitter_diario:
            logger.warning("⚠️ Diario 'Twitter' no encontrado en la base de datos.")
            return
        
        # Obtener todas las noticias de Twitter
        twitter_news = db.query(Noticia).filter(
            Noticia.diario_id == twitter_diario.id
        ).order_by(Noticia.fecha_publicacion.desc()).limit(20).all()
        
        logger.info(f"📊 Encontradas {len(twitter_news)} noticias de Twitter (mostrando las 20 más recientes)")
        
        # Agrupar por año
        fechas_por_anio = {}
        
        for noticia in twitter_news:
            if noticia.fecha_publicacion:
                year = noticia.fecha_publicacion.year
                if year not in fechas_por_anio:
                    fechas_por_anio[year] = []
                fechas_por_anio[year].append(noticia)
        
        logger.info("\n📅 Noticias agrupadas por año:")
        for year in sorted(fechas_por_anio.keys(), reverse=True):
            count = len(fechas_por_anio[year])
            logger.info(f"  {year}: {count} noticias")
            
            # Mostrar ejemplo
            ejemplo = fechas_por_anio[year][0]
            logger.info(f"    Ejemplo: '{ejemplo.titulo[:60]}...' - Fecha: {ejemplo.fecha_publicacion}")
        
        # Mostrar todas las fechas detalladas
        logger.info("\n📋 Detalle de fechas (primeras 10):")
        for i, noticia in enumerate(twitter_news[:10]):
            fecha_str = noticia.fecha_publicacion.strftime("%Y-%m-%d %H:%M:%S") if noticia.fecha_publicacion else "Sin fecha"
            logger.info(f"  {i+1}. {fecha_str} - '{noticia.titulo[:50]}...'")
        
    except Exception as e:
        logger.error(f"❌ Error al verificar fechas de Twitter: {e}", exc_info=True)
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("🔍 Verificando fechas de noticias de Twitter...")
    check_twitter_dates()
    logger.info("✅ Verificación completada")


