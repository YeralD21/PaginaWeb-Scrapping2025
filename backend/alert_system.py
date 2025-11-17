"""
Sistema de alertas y notificaciones para noticias
"""

import re
import json
import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import Noticia, AlertaConfiguracion, AlertaDisparo, TrendingKeywords
from sentiment_analyzer import get_sentiment_analyzer
import smtplib
try:
    from email.mime.text import MimeText
    from email.mime.multipart import MimeMultipart
except ImportError:
    # Fallback para versiones de Python más nuevas
    from email.message import EmailMessage
    MimeText = None
    MimeMultipart = None
import requests
import os

logger = logging.getLogger(__name__)

class AlertSystem:
    """Sistema de alertas y notificaciones"""
    
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
        
        # Configuración de email (desde variables de entorno)
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.email_user = os.getenv('EMAIL_USER', '')
        self.email_password = os.getenv('EMAIL_PASSWORD', '')
    
    def analyze_news_urgency(self, titulo: str, contenido: str = None) -> Tuple[str, List[str]]:
        """
        Analizar el nivel de urgencia de una noticia
        
        Returns:
            Tuple[nivel_urgencia, keywords_encontradas]
        """
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
        """Análisis de sentimientos usando el módulo avanzado"""
        if not text:
            return 'neutro'
        
        try:
            analyzer = get_sentiment_analyzer()
            # El analizador espera título y contenido separados, pero podemos pasar todo como título
            result = analyzer.analyze_sentiment(text, "")
            return result.get('sentimiento', 'neutro')
        except Exception as e:
            logger.warning(f"Error en análisis de sentimientos, usando método básico: {e}")
            # Fallback al método básico si hay error
            return self._analyze_sentiment_basic(text)
    
    def _analyze_sentiment_basic(self, text: str) -> str:
        """Método básico de análisis de sentimientos (fallback)"""
        if not text:
            return 'neutro'
        
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
        """Procesar alertas para una noticia nueva"""
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
            
            # Analizar sentimiento usando el nuevo analizador avanzado
            try:
                analyzer = get_sentiment_analyzer()
                sentiment_result = analyzer.analyze_sentiment(noticia.titulo or "", noticia.contenido or "")
                noticia.sentimiento = sentiment_result.get('sentimiento', 'neutro')
            except Exception as e:
                logger.warning(f"Error en análisis de sentimientos avanzado, usando método básico: {e}")
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
                    fecha_disparo=datetime.utcnow()
                )
                
                db.add(alert_disparo)
                result['alerts_triggered'] += 1
                
                # Enviar notificaciones
                try:
                    if alert_info['config'].notificar_email and alert_info['config'].email_destino:
                        self.send_email_notification(alert_info)
                        alert_disparo.notificacion_enviada = True
                        result['notifications_sent'] += 1
                    
                    if alert_info['config'].notificar_webhook and alert_info['config'].webhook_url:
                        self.send_webhook_notification(alert_info)
                        result['notifications_sent'] += 1
                        
                except Exception as e:
                    error_msg = f"Error enviando notificación: {str(e)}"
                    result['errors'].append(error_msg)
                    logger.error(error_msg)
            
            # Actualizar trending keywords
            self.update_trending_keywords(db, noticia)
            
            db.commit()
            
        except Exception as e:
            error_msg = f"Error procesando alertas: {str(e)}"
            result['errors'].append(error_msg)
            logger.error(error_msg)
            db.rollback()
        
        return result
    
    def send_email_notification(self, alert_info: Dict):
        """Enviar notificación por email"""
        if not self.email_user or not self.email_password:
            logger.warning("Configuración de email no disponible")
            return
        
        try:
            noticia = alert_info['noticia']
            subject = f"🚨 Alerta: {alert_info['config'].nombre}"
            
            # Crear cuerpo del email
            body = f"""
            <html>
            <body>
                <h2>🚨 Alerta Activada: {alert_info['config'].nombre}</h2>
                
                <h3>📰 Noticia:</h3>
                <p><strong>Título:</strong> {noticia.titulo}</p>
                <p><strong>Diario:</strong> {noticia.diario.nombre}</p>
                <p><strong>Categoría:</strong> {noticia.categoria}</p>
                <p><strong>Fecha:</strong> {noticia.fecha_extraccion.strftime('%d/%m/%Y %H:%M')}</p>
                
                <h3>⚠️ Información de la Alerta:</h3>
                <p><strong>Palabra clave activada:</strong> {alert_info['matched_keyword']}</p>
                <p><strong>Nivel de urgencia:</strong> {alert_info['config'].nivel_urgencia.upper()}</p>
                
                {f'<p><strong>Enlace:</strong> <a href="{noticia.enlace}">{noticia.enlace}</a></p>' if noticia.enlace else ''}
                
                <hr>
                <p><small>Sistema de Alertas - Diarios Peruanos</small></p>
            </body>
            </html>
            """
            
            # Usar EmailMessage si MimeText no está disponible
            if MimeText is not None and MimeMultipart is not None:
                # Método tradicional
                msg = MimeMultipart()
                msg['From'] = self.email_user
                msg['To'] = alert_info['config'].email_destino
                msg['Subject'] = subject
                msg.attach(MimeText(body, 'html'))
                message_text = msg.as_string()
            else:
                # Método nuevo para Python 3.13+
                msg = EmailMessage()
                msg['From'] = self.email_user
                msg['To'] = alert_info['config'].email_destino
                msg['Subject'] = subject
                msg.set_content(body, subtype='html')
                message_text = str(msg)
            
            # Enviar email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_user, self.email_password)
            server.sendmail(self.email_user, alert_info['config'].email_destino, message_text)
            server.quit()
            
            logger.info(f"Email enviado a {alert_info['config'].email_destino}")
            
        except Exception as e:
            logger.error(f"Error enviando email: {e}")
            raise
    
    def send_webhook_notification(self, alert_info: Dict):
        """Enviar notificación por webhook"""
        try:
            noticia = alert_info['noticia']
            
            payload = {
                'alert_name': alert_info['config'].nombre,
                'urgency_level': alert_info['config'].nivel_urgencia,
                'matched_keyword': alert_info['matched_keyword'],
                'news': {
                    'id': noticia.id,
                    'title': noticia.titulo,
                    'content': noticia.contenido[:500] if noticia.contenido else None,
                    'category': noticia.categoria,
                    'newspaper': noticia.diario.nombre,
                    'url': noticia.enlace,
                    'image_url': noticia.imagen_url,
                    'published_date': noticia.fecha_publicacion.isoformat() if noticia.fecha_publicacion else None,
                    'extracted_date': noticia.fecha_extraccion.isoformat()
                },
                'timestamp': datetime.utcnow().isoformat()
            }
            
            response = requests.post(
                alert_info['config'].webhook_url,
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            
            logger.info(f"Webhook enviado a {alert_info['config'].webhook_url}")
            
        except Exception as e:
            logger.error(f"Error enviando webhook: {e}")
            raise
    
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
                notificar_email=alert_data.get('notificar_email', False),
                email_destino=alert_data.get('email_destino'),
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
        
        notifications_sent = db.query(AlertaDisparo).filter(
            AlertaDisparo.fecha_disparo >= time_limit,
            AlertaDisparo.notificacion_enviada == True
        ).count()
        
        return {
            'total_alerts': total_alerts,
            'alerts_by_level': {level: count for level, count in alerts_by_level},
            'notifications_sent': notifications_sent,
            'notification_rate': notifications_sent / total_alerts if total_alerts > 0 else 0,
            'period_days': days
        }
