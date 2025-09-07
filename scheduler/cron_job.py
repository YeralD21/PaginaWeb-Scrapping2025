import sys
import os
import schedule
import time
import logging
from datetime import datetime
from typing import List, Dict

# Agregar el directorio raíz al path para importar módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraping.main_scraper import MainScraper
from backend.database import get_db, create_tables
from backend.models import Diario, Noticia, EstadisticaScraping
from sqlalchemy.orm import Session

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ScrapingScheduler:
    def __init__(self):
        self.main_scraper = MainScraper()
        # Cambiar a intervalos más frecuentes para actualizaciones automáticas
        self.interval_minutes = int(os.getenv('SCHEDULE_INTERVAL_MINUTES', 15))  # Cada 15 minutos por defecto
        
    def save_news_to_database(self, news: List[Dict]) -> int:
        """Guardar noticias en la base de datos"""
        db = next(get_db())
        saved_count = 0
        
        try:
            for news_item in news:
                # Buscar el diario
                diario = db.query(Diario).filter(
                    Diario.nombre == news_item['diario']
                ).first()
                
                if not diario:
                    logger.warning(f"Diario no encontrado: {news_item['diario']}")
                    continue
                
                # Verificar si la noticia ya existe (por título, enlace y categoría)
                existing = db.query(Noticia).filter(
                    Noticia.titulo == news_item['titulo'],
                    Noticia.diario_id == diario.id,
                    Noticia.enlace == news_item.get('enlace', ''),
                    Noticia.categoria == news_item['categoria']
                ).first()
                
                if existing:
                    logger.debug(f"Noticia ya existe: {news_item['titulo']}")
                    continue  # No duplicar noticias
                
                # Verificar duplicados por título y diario (más estricto)
                existing_by_title = db.query(Noticia).filter(
                    Noticia.titulo == news_item['titulo'],
                    Noticia.diario_id == diario.id
                ).first()
                
                if existing_by_title:
                    logger.debug(f"Noticia duplicada por título: {news_item['titulo']}")
                    continue  # No duplicar noticias
                
                # Crear nueva noticia
                noticia = Noticia(
                    titulo=news_item['titulo'],
                    contenido=news_item.get('contenido', ''),
                    enlace=news_item.get('enlace', ''),
                    imagen_url=news_item.get('imagen_url'),
                    categoria=news_item['categoria'],
                    fecha_extraccion=datetime.fromisoformat(news_item['fecha_extraccion']),
                    diario_id=diario.id
                )
                
                db.add(noticia)
                saved_count += 1
            
            db.commit()
            logger.info(f"Guardadas {saved_count} noticias nuevas en la base de datos")
            
        except Exception as e:
            logger.error(f"Error guardando noticias: {e}")
            db.rollback()
        finally:
            db.close()
        
        return saved_count
    
    def save_scraping_stats(self, stats: Dict, duration: int):
        """Guardar estadísticas del scraping"""
        db = next(get_db())
        
        try:
            for diario_name, categorias in stats.items():
                # Buscar el diario
                diario = db.query(Diario).filter(Diario.nombre == diario_name).first()
                if not diario:
                    continue
                
                for categoria, cantidad in categorias.items():
                    if categoria == 'error':
                        continue
                    
                    # Crear estadística
                    estadistica = EstadisticaScraping(
                        diario_id=diario.id,
                        categoria=categoria,
                        cantidad_noticias=cantidad,
                        duracion_segundos=duration,
                        estado='exitoso'
                    )
                    
                    db.add(estadistica)
            
            db.commit()
            logger.info("Estadísticas de scraping guardadas")
            
        except Exception as e:
            logger.error(f"Error guardando estadísticas: {e}")
            db.rollback()
        finally:
            db.close()
    
    def run_scraping_job(self):
        """Ejecutar el trabajo de scraping programado"""
        start_time = datetime.now()
        logger.info("=== INICIANDO SCRAPING PROGRAMADO ===")
        
        try:
            # Ejecutar scraping
            all_news = self.main_scraper.scrape_all()
            stats = self.main_scraper.get_comparative_stats()
            
            # Guardar en base de datos
            saved_count = self.save_news_to_database(all_news)
            
            # Calcular duración
            duration = int((datetime.now() - start_time).total_seconds())
            
            # Guardar estadísticas
            self.save_scraping_stats(stats, duration)
            
            logger.info(f"=== SCRAPING COMPLETADO ===")
            logger.info(f"Noticias extraídas: {len(all_news)}")
            logger.info(f"Noticias guardadas: {saved_count}")
            logger.info(f"Duración: {duration} segundos")
            
        except Exception as e:
            logger.error(f"Error en scraping programado: {e}")
            duration = int((datetime.now() - start_time).total_seconds())
            
            # Guardar estadística de error
            db = next(get_db())
            try:
                error_stats = EstadisticaScraping(
                    diario_id=1,  # ID por defecto
                    categoria='error',
                    cantidad_noticias=0,
                    duracion_segundos=duration,
                    estado='error'
                )
                db.add(error_stats)
                db.commit()
            except:
                pass
            finally:
                db.close()
    
    def start_scheduler(self):
        """Iniciar el scheduler"""
        logger.info(f"Iniciando scheduler con intervalo de {self.interval_minutes} minutos")
        
        # Programar el trabajo
        schedule.every(self.interval_minutes).minutes.do(self.run_scraping_job)
        
        # Ejecutar una vez al inicio
        logger.info("Ejecutando scraping inicial...")
        self.run_scraping_job()
        
        # Mantener el scheduler corriendo
        while True:
            schedule.run_pending()
            time.sleep(60)  # Verificar cada minuto

def main():
    """Función principal"""
    logger.info("Iniciando Scheduler de Scraping de Diarios")
    
    # Crear tablas si no existen
    try:
        create_tables()
        logger.info("Tablas de base de datos verificadas")
    except Exception as e:
        logger.error(f"Error creando tablas: {e}")
        return
    
    # Iniciar scheduler
    scheduler = ScrapingScheduler()
    scheduler.start_scheduler()

if __name__ == "__main__":
    main()
