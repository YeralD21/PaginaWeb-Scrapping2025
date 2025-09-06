import sys
import os
from datetime import datetime
from typing import List, Dict
import logging

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraping.main_scraper import MainScraper
from database import get_db
from models import Diario, Noticia, EstadisticaScraping
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class ScrapingService:
    def __init__(self):
        self.main_scraper = MainScraper()
    
    def execute_scraping(self) -> Dict:
        """Ejecutar scraping y guardar en base de datos"""
        start_time = datetime.now()
        result = {
            'success': False,
            'total_extracted': 0,
            'total_saved': 0,
            'duration_seconds': 0,
            'error': None
        }
        
        try:
            # Ejecutar scraping
            logger.info("Iniciando scraping...")
            all_news = self.main_scraper.scrape_all()
            result['total_extracted'] = len(all_news)
            
            # Guardar en base de datos
            saved_count = self.save_news_to_database(all_news)
            result['total_saved'] = saved_count
            
            # Calcular duración
            duration = int((datetime.now() - start_time).total_seconds())
            result['duration_seconds'] = duration
            result['success'] = True
            
            logger.info(f"Scraping completado: {saved_count} noticias guardadas en {duration}s")
            
        except Exception as e:
            result['error'] = str(e)
            result['duration_seconds'] = int((datetime.now() - start_time).total_seconds())
            logger.error(f"Error en scraping: {e}")
        
        return result
    
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
                
                # Verificar si la noticia ya existe
                existing = db.query(Noticia).filter(
                    Noticia.titulo == news_item['titulo'],
                    Noticia.diario_id == diario.id,
                    Noticia.categoria == news_item['categoria']
                ).first()
                
                if existing:
                    continue  # No duplicar
                
                # Crear nueva noticia
                noticia = Noticia(
                    titulo=news_item['titulo'],
                    contenido=news_item.get('contenido', ''),
                    enlace=news_item.get('enlace', ''),
                    imagen_url=news_item.get('imagen_url', ''),
                    categoria=news_item['categoria'],
                    fecha_extraccion=datetime.fromisoformat(news_item['fecha_extraccion']),
                    diario_id=diario.id
                )
                
                db.add(noticia)
                saved_count += 1
            
            db.commit()
            logger.info(f"Guardadas {saved_count} noticias nuevas")
            
        except Exception as e:
            logger.error(f"Error guardando noticias: {e}")
            db.rollback()
        finally:
            db.close()
        
        return saved_count
    
    def get_scraping_stats(self) -> Dict:
        """Obtener estadísticas de scraping"""
        db = next(get_db())
        
        try:
            # Estadísticas generales
            total_noticias = db.query(Noticia).count()
            total_diarios = db.query(Diario).filter(Diario.activo == True).count()
            
            # Último scraping
            last_scraping = db.query(EstadisticaScraping).order_by(
                EstadisticaScraping.fecha_scraping.desc()
            ).first()
            
            # Noticias por categoría
            noticias_por_categoria = db.query(
                Noticia.categoria,
                db.func.count(Noticia.id).label('cantidad')
            ).group_by(Noticia.categoria).all()
            
            # Noticias por diario
            noticias_por_diario = db.query(
                Diario.nombre,
                db.func.count(Noticia.id).label('cantidad')
            ).join(Noticia).group_by(Diario.nombre).all()
            
            return {
                'total_noticias': total_noticias,
                'total_diarios': total_diarios,
                'ultimo_scraping': last_scraping.fecha_scraping if last_scraping else None,
                'noticias_por_categoria': [
                    {'categoria': cat, 'cantidad': cant} 
                    for cat, cant in noticias_por_categoria
                ],
                'noticias_por_diario': [
                    {'diario': diario, 'cantidad': cant} 
                    for diario, cant in noticias_por_diario
                ]
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas: {e}")
            return {}
        finally:
            db.close()
