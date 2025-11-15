import sys
import os
from datetime import datetime, timedelta
from typing import List, Dict
import logging

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraping.main_scraper import MainScraper
from database import get_db
from models import Diario, Noticia, EstadisticaScraping
# Importar modelos de UGC para que SQLAlchemy pueda resolver las relaciones
# (UserSubscription necesita User)
try:
    from models_ugc_enhanced import User
except ImportError:
    try:
        from models_ugc import User
    except ImportError:
        pass  # Si no existe, no pasa nada, solo evitamos el error de relación
from duplicate_detector import DuplicateDetector
from content_generator import generate_content_for_news
from geographic_classifier import get_geographic_classification
try:
    from alert_system import AlertSystem
except ImportError:
    # Usar versión simplificada si hay problemas con email
    from alert_system_simple import AlertSystemSimple as AlertSystem
from sqlalchemy.orm import Session
from premium_service import update_premium_scores

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
            self.refresh_premium_scores()
            
        except Exception as e:
            result['error'] = str(e)
            result['duration_seconds'] = int((datetime.now() - start_time).total_seconds())
            logger.error(f"Error en scraping: {e}")
        
        return result
    
    def execute_social_scraping(self) -> Dict:
        """Ejecutar scraping solo de redes sociales"""
        start_time = datetime.now()
        result = {
            'success': False,
            'total_extracted': 0,
            'total_saved': 0,
            'duplicates_detected': 0,
            'alerts_triggered': 0,
            'duration_seconds': 0,
            'error': None,
            'errors': []
        }
        
        try:
            # Ejecutar scraping de redes sociales
            logger.info("🌐 Iniciando scraping de redes sociales con Playwright...")
            all_news = self.main_scraper.scrape_social_media()
            logger.info(f"📊 Total extraído de scrapers: {len(all_news)}")
            
            # Log detallado de lo que se extrajo
            if all_news:
                for news in all_news[:3]:  # Mostrar las primeras 3
                    logger.info(f"  - {news.get('diario', 'Unknown')}: {news.get('titulo', 'Sin título')[:60]}...")
            else:
                logger.warning("⚠️ No se extrajeron noticias de ninguna red social")
            
            result['total_extracted'] = len(all_news)
            
            # Guardar en base de datos con nueva lógica
            save_result = self.save_news_to_database_enhanced(all_news)
            result.update(save_result)
            
            # Calcular duración
            duration = int((datetime.now() - start_time).total_seconds())
            result['duration_seconds'] = duration
            result['success'] = True
            
            logger.info(f"✅ Scraping de redes sociales completado: {result['total_saved']} noticias guardadas, "
                       f"{result['duplicates_detected']} duplicados detectados, "
                       f"{result['alerts_triggered']} alertas activadas en {duration}s")
            self.refresh_premium_scores()
            
        except Exception as e:
            result['error'] = str(e)
            result['duration_seconds'] = int((datetime.now() - start_time).total_seconds())
            logger.error(f"❌ Error en scraping de redes sociales: {e}", exc_info=True)
        
        return result

    def execute_youtube_scraping(self) -> Dict:
        """Ejecutar scraping exclusivamente de YouTube"""
        start_time = datetime.now()
        result = {
            'success': False,
            'total_extracted': 0,
            'total_saved': 0,
            'duplicates_detected': 0,
            'alerts_triggered': 0,
            'duration_seconds': 0,
            'error': None,
            'errors': []
        }

        try:
            youtube_scraper = self.main_scraper.social_scrapers.get('youtube')
            if not youtube_scraper:
                raise RuntimeError("Scraper de YouTube no configurado")

            logger.info("▶️ Iniciando scraping específico de YouTube...")

            if hasattr(youtube_scraper, 'get_all_news') and getattr(self.main_scraper, 'use_real_scraping', False):
                youtube_news = youtube_scraper.get_all_news(use_real=self.main_scraper.use_real_scraping)
            else:
                youtube_news = youtube_scraper.get_all_news()

            result['total_extracted'] = len(youtube_news)
            logger.info(f"📺 Videos obtenidos de YouTube: {len(youtube_news)}")

            save_result = self.save_news_to_database_enhanced(youtube_news)
            result.update(save_result)

            duration = int((datetime.now() - start_time).total_seconds())
            result['duration_seconds'] = duration
            result['success'] = True

            logger.info(
                f"✅ Scraping de YouTube completado: {result['total_saved']} videos guardados, "
                f"{result['duplicates_detected']} duplicados, {result['alerts_triggered']} alertas en {duration}s"
            )

        except Exception as e:
            result['error'] = str(e)
            result['duration_seconds'] = int((datetime.now() - start_time).total_seconds())
            logger.error("❌ Error en scraping de YouTube: %s", e, exc_info=True)

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
                    
                    # CLASIFICACIÓN GEOGRÁFICA AUTOMÁTICA
                    geographic_info = get_geographic_classification(
                        title=news_item['titulo'],
                        content=news_item.get('contenido', ''),
                        category=news_item.get('categoria', '')
                    )
                    
                    # Preparar datos de noticia con nuevos campos
                    enhanced_news = self.duplicate_detector.prepare_news_for_save(news_item.copy())
                    
                    # Agregar información geográfica
                    enhanced_news['geographic_type'] = geographic_info['geographic_type']
                    enhanced_news['geographic_confidence'] = geographic_info['confidence']
                    enhanced_news['geographic_keywords'] = geographic_info['keywords_found']
                    
                    logger.info(f"[GEO] Clasificacion geografica: {geographic_info['geographic_type']} (confianza: {geographic_info['confidence']})")
                    
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
                        region='Peru',  # Asumir que todas las noticias son de Perú
                        
                        # Campos geográficos
                        geographic_type=enhanced_news.get('geographic_type', 'nacional'),
                        geographic_confidence=enhanced_news.get('geographic_confidence', 0.5),
                        geographic_keywords=enhanced_news.get('geographic_keywords', {})
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

    def refresh_premium_scores(self) -> None:
        """Recalcular puntajes premium tras nuevas inserciones."""
        try:
            db = next(get_db())
            update_premium_scores(db, hours_window=168, auto_mark=False)
        except Exception as e:
            logger.warning(f"No se pudieron actualizar puntajes premium: {e}")
    
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
    
    def compare_social_vs_diarios(self, days: int = 2, limit: int = 50) -> Dict:
        """Comparar noticias de redes sociales vs noticias de diarios web."""
        db_generator = get_db()
        db = next(db_generator)
        social_platforms = ['Facebook', 'Twitter', 'Instagram', 'YouTube']
        cutoff = datetime.now() - timedelta(days=days)
        try:
            # Noticias de diarios tradicionales en la ventana de tiempo
            daily_news = db.query(Noticia).join(Diario).filter(
                ~Diario.nombre.in_(social_platforms),
                Noticia.fecha_extraccion >= cutoff
            ).all()
            daily_title_hashes = {n.titulo_hash for n in daily_news if n.titulo_hash}
            daily_similarity_hashes = {n.similarity_hash for n in daily_news if n.similarity_hash}
            # Noticias de redes sociales en la ventana
            social_rows = db.query(Noticia, Diario).join(Diario).filter(
                Diario.nombre.in_(social_platforms),
                Noticia.fecha_extraccion >= cutoff
            ).order_by(Noticia.fecha_extraccion.desc()).all()
            comparison_items = []
            for noticia, diario in social_rows:
                if len(comparison_items) >= limit:
                    break
                # Comprobar si ya existe cobertura similar en diarios
                matched = False
                if noticia.similarity_hash and noticia.similarity_hash in daily_similarity_hashes:
                    matched = True
                if not matched and noticia.titulo_hash and noticia.titulo_hash in daily_title_hashes:
                    matched = True
                if matched:
                    continue
                # Buscar coincidencias parciales para referencia
                candidate_matches = []
                for daily in daily_news:
                    similarity_score = self.duplicate_detector.calculate_similarity(noticia.titulo, daily.titulo)
                    if similarity_score >= 0.6:
                        candidate_matches.append({
                            'id': daily.id,
                            'titulo': daily.titulo,
                            'diario': daily.diario.nombre if daily.diario else None,
                            'categoria': daily.categoria,
                            'fecha_publicacion': daily.fecha_publicacion.isoformat() if daily.fecha_publicacion else None,
                            'similaridad': round(similarity_score, 2)
                        })
                candidate_matches.sort(key=lambda c: c['similaridad'], reverse=True)
                candidate_matches = candidate_matches[:3]
                comparison_items.append({
                    'id': noticia.id,
                    'titulo': noticia.titulo,
                    'categoria': noticia.categoria,
                    'plataforma': diario.nombre,
                    'autor': noticia.autor,
                    'fecha_publicacion': noticia.fecha_publicacion.isoformat() if noticia.fecha_publicacion else None,
                    'fecha_extraccion': noticia.fecha_extraccion.isoformat() if noticia.fecha_extraccion else None,
                    'enlace': noticia.enlace,
                    'imagen_url': noticia.imagen_url,
                    'palabras_clave': noticia.palabras_clave,
                    'coincidencias_diarios': candidate_matches
                })
            return {
                'generated_at': datetime.now().isoformat(),
                'days_window': days,
                'cutoff': cutoff.isoformat(),
                'total_social_checked': len(social_rows),
                'total_daily_reference': len(daily_news),
                'total_social_only': len(comparison_items),
                'items': comparison_items
            }
        except Exception as exc:
            logger.error(f"Error comparando noticias de redes vs diarios: {exc}", exc_info=True)
            return {
                'generated_at': datetime.now().isoformat(),
                'days_window': days,
                'cutoff': cutoff.isoformat(),
                'error': str(exc),
                'items': []
            }
        finally:
            try:
                db.close()
            except Exception:
                pass
            try:
                db_generator.close()
            except Exception:
                pass
    
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
