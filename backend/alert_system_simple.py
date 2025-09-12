"""
Sistema de alertas simplificado (sin email) para evitar problemas de compatibilidad
"""

import re
import json
import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import Noticia, AlertaConfiguracion, AlertaDisparo, TrendingKeywords
import requests
import os

logger = logging.getLogger(__name__)

class AlertSystemSimple:
    """Sistema de alertas simplificado sin funcionalidades de email"""
    
    def __init__(self):
        # Palabras clave predefinidas por nivel de urgencia
        self.urgency_keywords = {
            'critica': [
                'emergencia', 'crisis', 'urgente', 'breaking', 'alerta roja', 'estado de emergencia',
                'terremoto', 'tsunami', 'incendio', 'explosion', 'atentado', 'secuestro',
                'asesinato', 'accidente grave', 'colapso', 'desastre', 'evacuacion'
            ],
            'alta': [
                'importante', 'grave', 'serio', 'critico', 'alerta', 'peligro', 'riesgo alto',
                'manifestacion', 'protesta', 'huelga', 'conflicto', 'tension', 'violencia',
                'corrupcion', 'escandalo', 'denuncia', 'investigacion', 'operativo'
            ],
            'media': [
                'significativo', 'relevante', 'notable', 'destacado', 'anuncio', 'cambio',
                'decision', 'reunion', 'acuerdo', 'negociacion', 'propuesta', 'reforma',
                'elecciones', 'politica', 'economia', 'mercado', 'inversion'
            ],
            'baja': [
                'noticia', 'informacion', 'comunicado', 'declaracion', 'evento', 'actividad',
                'celebracion', 'inauguracion', 'presentacion', 'lanzamiento', 'apertura'
            ]
        }
    
    def analyze_news_urgency(self, titulo: str, contenido: str = None) -> Tuple[str, List[str]]:
        """Analizar el nivel de urgencia de una noticia"""
        text_to_analyze = titulo.lower()
        if contenido:
            text_to_analyze += " " + contenido.lower()
        
        found_keywords = []
        max_urgency_level = 'baja'
        
        # Verificar cada nivel de urgencia (de mayor a menor)
        for level in ['critica', 'alta', 'media', 'baja']:
            for keyword in self.urgency_keywords[level]:
                if keyword.lower() in text_to_analyze:
                    found_keywords.append(keyword)
                    if level == 'critica':
                        max_urgency_level = 'critica'
                    elif level == 'alta' and max_urgency_level not in ['critica']:
                        max_urgency_level = 'alta'
                    elif level == 'media' and max_urgency_level not in ['critica', 'alta']:
                        max_urgency_level = 'media'
        
        return max_urgency_level, list(set(found_keywords))
    
    def analyze_sentiment(self, text: str) -> str:
        """Análisis básico de sentimientos"""
        if not text:
            return 'neutral'
        
        text_lower = text.lower()
        
        # Palabras positivas
        positive_words = [
            'exito', 'logro', 'victoria', 'crecimiento', 'mejora', 'progreso', 'avance',
            'beneficio', 'ganancia', 'aumento', 'desarrollo', 'innovacion', 'solucion',
            'acuerdo', 'paz', 'estabilidad', 'recuperacion', 'expansion'
        ]
        
        # Palabras negativas
        negative_words = [
            'crisis', 'problema', 'conflicto', 'caida', 'perdida', 'reduccion', 'disminucion',
            'recession', 'desempleo', 'inflacion', 'corrupcion', 'escandalo', 'fraude',
            'violencia', 'muerte', 'accidente', 'desastre', 'emergencia', 'peligro'
        ]
        
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        if pos_count > neg_count:
            return 'positivo'
        elif neg_count > pos_count:
            return 'negativo'
        return 'neutral'
    
    def check_alert_triggers(self, db: Session, noticia: Noticia) -> List[Dict]:
        """Verificar si una noticia activa alguna alerta"""
        triggered_alerts = []
        
        # Obtener todas las alertas activas
        active_alerts = db.query(AlertaConfiguracion).filter(
            AlertaConfiguracion.activa == True
        ).all()
        
        for alert_config in active_alerts:
            is_triggered, matched_keyword = self._check_single_alert(noticia, alert_config)
            
            if is_triggered:
                triggered_alerts.append({
                    'config': alert_config,
                    'matched_keyword': matched_keyword,
                    'noticia': noticia
                })
        
        return triggered_alerts
    
    def _check_single_alert(self, noticia: Noticia, alert_config: AlertaConfiguracion) -> Tuple[bool, str]:
        """Verificar si una noticia específica activa una alerta específica"""
        text_to_check = noticia.titulo.lower()
        if noticia.contenido:
            text_to_check += " " + noticia.contenido.lower()
        
        # Verificar palabras clave
        keywords = alert_config.keywords if isinstance(alert_config.keywords, list) else []
        for keyword in keywords:
            if keyword.lower() in text_to_check:
                # Verificar filtros adicionales
                if self._check_alert_filters(noticia, alert_config):
                    return True, keyword
        
        return False, ""
    
    def _check_alert_filters(self, noticia: Noticia, alert_config: AlertaConfiguracion) -> bool:
        """Verificar filtros adicionales de la alerta"""
        # Filtro por categorías
        if alert_config.categorias:
            categorias = alert_config.categorias if isinstance(alert_config.categorias, list) else []
            if categorias and noticia.categoria not in categorias:
                return False
        
        # Filtro por diarios
        if alert_config.diarios:
            diarios = alert_config.diarios if isinstance(alert_config.diarios, list) else []
            if diarios and noticia.diario.nombre not in diarios:
                return False
        
        return True
    
    def process_news_alerts(self, db: Session, noticia: Noticia) -> Dict:
        """Procesar alertas para una noticia nueva (versión simplificada)"""
        result = {
            'alerts_triggered': 0,
            'notifications_sent': 0,
            'errors': []
        }
        
        try:
            # Analizar urgencia automática
            urgency_level, urgency_keywords = self.analyze_news_urgency(
                noticia.titulo, noticia.contenido
            )
            
            # Actualizar noticia con información de urgencia
            if urgency_level in ['alta', 'critica'] or urgency_keywords:
                noticia.es_alerta = True
                noticia.nivel_urgencia = urgency_level
                noticia.keywords_alerta = urgency_keywords
            
            # Analizar sentimiento
            noticia.sentimiento = self.analyze_sentiment(noticia.titulo + " " + (noticia.contenido or ""))
            
            # Verificar alertas configuradas
            triggered_alerts = self.check_alert_triggers(db, noticia)
            
            for alert_info in triggered_alerts:
                # Registrar disparo de alerta
                alert_disparo = AlertaDisparo(
                    configuracion_id=alert_info['config'].id,
                    noticia_id=noticia.id,
                    keyword_match=alert_info['matched_keyword'],
                    nivel_urgencia=alert_info['config'].nivel_urgencia,
                    fecha_disparo=datetime.utcnow(),
                    notificacion_enviada=False  # No enviamos emails en versión simple
                )
                
                db.add(alert_disparo)
                result['alerts_triggered'] += 1
                
                # Log en lugar de email
                logger.info(f"🚨 ALERTA ACTIVADA: {alert_info['config'].nombre} - {alert_info['matched_keyword']} - {noticia.titulo}")
            
            # Actualizar trending keywords
            self.update_trending_keywords(db, noticia)
            
            db.commit()
            
        except Exception as e:
            error_msg = f"Error procesando alertas: {str(e)}"
            result['errors'].append(error_msg)
            logger.error(error_msg)
            db.rollback()
        
        return result
    
    def update_trending_keywords(self, db: Session, noticia: Noticia):
        """Actualizar palabras clave trending"""
        try:
            # Extraer palabras clave del título
            if hasattr(noticia, 'palabras_clave') and noticia.palabras_clave:
                keywords = noticia.palabras_clave
            else:
                keywords = self._extract_simple_keywords(noticia.titulo)
            
            today = datetime.utcnow().date()
            
            for keyword in keywords:
                # Buscar o crear registro de trending keyword
                trending = db.query(TrendingKeywords).filter(
                    TrendingKeywords.palabra == keyword,
                    TrendingKeywords.categoria == noticia.categoria,
                    TrendingKeywords.fecha >= today,
                    TrendingKeywords.periodo == 'diario'
                ).first()
                
                if trending:
                    trending.frecuencia += 1
                else:
                    trending = TrendingKeywords(
                        palabra=keyword,
                        frecuencia=1,
                        categoria=noticia.categoria,
                        fecha=datetime.utcnow(),
                        periodo='diario'
                    )
                    db.add(trending)
                    
        except Exception as e:
            logger.error(f"Error actualizando trending keywords: {e}")
    
    def _extract_simple_keywords(self, text: str) -> List[str]:
        """Extraer palabras clave simples del texto"""
        if not text:
            return []
        
        # Normalizar texto
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        
        # Palabras comunes a ignorar
        stop_words = {'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'una', 'del', 'las', 'los'}
        
        words = text.split()
        keywords = []
        
        for word in words:
            if len(word) >= 4 and word not in stop_words:
                keywords.append(word)
        
        return keywords[:5]  # Limitar a 5 palabras clave
    
    def create_alert_configuration(self, db: Session, alert_data: Dict) -> AlertaConfiguracion:
        """Crear nueva configuración de alerta"""
        try:
            alert_config = AlertaConfiguracion(
                nombre=alert_data['nombre'],
                descripcion=alert_data.get('descripcion', ''),
                keywords=alert_data['keywords'],
                categorias=alert_data.get('categorias'),
                diarios=alert_data.get('diarios'),
                nivel_urgencia=alert_data.get('nivel_urgencia', 'media'),
                notificar_email=False,  # Deshabilitado en versión simple
                email_destino=None,
                notificar_webhook=alert_data.get('notificar_webhook', False),
                webhook_url=alert_data.get('webhook_url'),
                activa=alert_data.get('activa', True)
            )
            
            db.add(alert_config)
            db.commit()
            
            logger.info(f"Alerta creada: {alert_config.nombre}")
            return alert_config
            
        except Exception as e:
            logger.error(f"Error creando alerta: {e}")
            db.rollback()
            raise
    
    def get_alert_statistics(self, db: Session, days: int = 7) -> Dict:
        """Obtener estadísticas de alertas"""
        time_limit = datetime.utcnow() - timedelta(days=days)
        
        total_alerts = db.query(AlertaDisparo).filter(
            AlertaDisparo.fecha_disparo >= time_limit
        ).count()
        
        alerts_by_level = db.query(
            AlertaDisparo.nivel_urgencia,
            db.func.count(AlertaDisparo.id).label('count')
        ).filter(
            AlertaDisparo.fecha_disparo >= time_limit
        ).group_by(AlertaDisparo.nivel_urgencia).all()
        
        return {
            'total_alerts': total_alerts,
            'alerts_by_level': {level: count for level, count in alerts_by_level},
            'notifications_sent': 0,  # Sin emails en versión simple
            'notification_rate': 0,
            'period_days': days
        }
