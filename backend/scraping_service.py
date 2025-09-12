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
from duplicate_detector import DuplicateDetector
from content_generator import generate_content_for_news
try:
    from alert_system import AlertSystem
except ImportError:
    # Usar versión simplificada si hay problemas con email
    from alert_system_simple import AlertSystemSimple as AlertSystem
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class ScrapingService:
    def __init__(self):
        self.main_scraper = MainScraper()
        self.duplicate_detector = DuplicateDetector()
        self.alert_system = AlertSystem()
    
    def execute_scraping(self) -> Dict:
        """Ejecutar scraping y guardar en base de datos con detección de duplicados y alertas"""
        start_time = datetime.now()
        result = {
            'success': False,
            'total_extracted': 0,
            'total_saved': 0,
            'duplicates_detected': 0,
            'alerts_triggered': 0,
            'duration_seconds': 0,
            'error': None
        }
        
        try:
            # Ejecutar scraping
            logger.info("Iniciando scraping...")
            all_news = self.main_scraper.scrape_all()
            result['total_extracted'] = len(all_news)
            
            # Guardar en base de datos con nueva lógica
            save_result = self.save_news_to_database_enhanced(all_news)
            result.update(save_result)
            
            # Calcular duración
            duration = int((datetime.now() - start_time).total_seconds())
            result['duration_seconds'] = duration
            result['success'] = True
            
            logger.info(f"Scraping completado: {result['total_saved']} noticias guardadas, "
                       f"{result['duplicates_detected']} duplicados detectados, "
                       f"{result['alerts_triggered']} alertas activadas en {duration}s")
            
        except Exception as e:
            result['error'] = str(e)
            result['duration_seconds'] = int((datetime.now() - start_time).total_seconds())
            logger.error(f"Error en scraping: {e}")
        
        return result
    
    def save_news_to_database_enhanced(self, news: List[Dict]) -> Dict:
        """Guardar noticias con detección de duplicados avanzada y sistema de alertas"""
        db = next(get_db())
        result = {
            'total_saved': 0,
            'duplicates_detected': 0,
            'alerts_triggered': 0,
            'errors': []
        }
        
        try:
            for news_item in news:
                try:
                    # Buscar el diario
                    diario = db.query(Diario).filter(
                        Diario.nombre == news_item['diario']
                    ).first()
                    
                    if not diario:
                        logger.warning(f"Diario no encontrado: {news_item['diario']}")
                        continue
                    
                    # Procesar fecha de publicación
                    fecha_publicacion = None
                    if news_item.get('fecha_publicacion'):
                        try:
                            if hasattr(news_item['fecha_publicacion'], 'year'):
                                fecha_publicacion = datetime.combine(news_item['fecha_publicacion'], datetime.min.time())
                            else:
                                fecha_publicacion = datetime.fromisoformat(news_item['fecha_publicacion'])
                        except (ValueError, TypeError):
                            fecha_publicacion = None
                    
                    # DETECCIÓN DE DUPLICADOS AVANZADA
                    duplicate_check = self.duplicate_detector.check_duplicate(
                        db=db,
                        titulo=news_item['titulo'],
                        contenido=news_item.get('contenido', ''),
                        enlace=news_item.get('enlace', ''),
                        diario_id=diario.id
                    )
                    
                    if duplicate_check['is_duplicate']:
                        result['duplicates_detected'] += 1
                        logger.info(f"Duplicado detectado ({duplicate_check['duplicate_type']}): {news_item['titulo']}")
                        continue
                    
                    # GENERAR CONTENIDO SI NO EXISTE O ES MUY CORTO
                    original_content = news_item.get('contenido', '').strip()
                    if not original_content or len(original_content) < 100:
                        print(f"🤖 Generando contenido automático para: {news_item['titulo'][:50]}...")
                        generated_content = generate_content_for_news(
                            title=news_item['titulo'],
                            existing_content=original_content,
                            category=news_item.get('categoria', 'mundo')
                        )
                        news_item['contenido'] = generated_content
                        print(f"✅ Contenido generado ({len(generated_content)} chars)")
                    
                    # Preparar datos de noticia con nuevos campos
                    enhanced_news = self.duplicate_detector.prepare_news_for_save(news_item.copy())
                    
                    # Crear nueva noticia con campos extendidos
                    noticia = Noticia(
                        titulo=enhanced_news['titulo'],
                        contenido=enhanced_news.get('contenido', ''),
                        enlace=enhanced_news.get('enlace', ''),
                        imagen_url=enhanced_news.get('imagen_url', ''),
                        categoria=enhanced_news['categoria'],
                        fecha_publicacion=fecha_publicacion,
                        fecha_extraccion=datetime.fromisoformat(enhanced_news['fecha_extraccion']),
                        diario_id=diario.id,
                        
                        # Nuevos campos
                        titulo_hash=enhanced_news.get('titulo_hash'),
                        contenido_hash=enhanced_news.get('contenido_hash'),
                        similarity_hash=enhanced_news.get('similarity_hash'),
                        palabras_clave=enhanced_news.get('palabras_clave'),
                        tiempo_lectura_min=enhanced_news.get('tiempo_lectura_min', 1),
                        idioma='es',
                        region='Peru'  # Asumir que todas las noticias son de Perú
                    )
                    
                    # Extraer autor si es posible (campo opcional)
                    if 'autor' in enhanced_news:
                        noticia.autor = enhanced_news['autor']
                    
                    db.add(noticia)
                    db.flush()  # Para obtener el ID
                    
                    # SISTEMA DE ALERTAS
                    alert_result = self.alert_system.process_news_alerts(db, noticia)
                    result['alerts_triggered'] += alert_result['alerts_triggered']
                    
                    if alert_result['errors']:
                        result['errors'].extend(alert_result['errors'])
                    
                    result['total_saved'] += 1
                    
                except Exception as e:
                    error_msg = f"Error procesando noticia '{news_item.get('titulo', 'Sin título')}': {str(e)}"
                    result['errors'].append(error_msg)
                    logger.error(error_msg)
                    continue
            
            db.commit()
            logger.info(f"Guardadas {result['total_saved']} noticias nuevas, "
                       f"detectados {result['duplicates_detected']} duplicados, "
                       f"activadas {result['alerts_triggered']} alertas")
            
        except Exception as e:
            logger.error(f"Error general guardando noticias: {e}")
            result['errors'].append(f"Error general: {str(e)}")
            db.rollback()
        finally:
            db.close()
        
        return result
    
    def save_news_to_database(self, news: List[Dict]) -> int:
        """Método legacy mantenido para compatibilidad"""
        result = self.save_news_to_database_enhanced(news)
        return result['total_saved']
    
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
    
    def get_duplicate_stats(self, days: int = 7) -> Dict:
        """Obtener estadísticas de duplicados"""
        return self.duplicate_detector.get_duplicate_stats(next(get_db()), days)
    
    def get_alert_stats(self, days: int = 7) -> Dict:
        """Obtener estadísticas de alertas"""
        return self.alert_system.get_alert_statistics(next(get_db()), days)
    
    def create_custom_alert(self, alert_data: Dict) -> Dict:
        """Crear una alerta personalizada"""
        try:
            db = next(get_db())
            alert_config = self.alert_system.create_alert_configuration(db, alert_data)
            return {
                'success': True,
                'alert_id': alert_config.id,
                'message': f'Alerta "{alert_config.nombre}" creada exitosamente'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
