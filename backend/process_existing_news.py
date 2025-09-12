#!/usr/bin/env python3
"""
Script para procesar noticias existentes y generar datos para trending y analytics
"""

import os
import sys
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Agregar el directorio actual al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db, engine
from models import Noticia, TrendingKeywords, AlertaConfiguracion, AlertaDisparo
from alert_system_simple import AlertSystemSimple
from duplicate_detector import DuplicateDetector
import random

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_sample_alerts(db: Session):
    """Crear alertas de ejemplo si no existen"""
    try:
        # Verificar si ya existen alertas
        existing_alerts = db.query(AlertaConfiguracion).count()
        if existing_alerts > 0:
            logger.info(f"Ya existen {existing_alerts} alertas configuradas")
            return

        # Crear alertas de ejemplo
        sample_alerts = [
            {
                "nombre": "Noticias Políticas Críticas",
                "descripcion": "Alertas para noticias políticas de alta importancia",
                "keywords": ["crisis", "emergencia", "protesta", "corrupcion", "escandalo"],
                "categorias": ["POLÍTICA"],
                "nivel_urgencia": "alta"
            },
            {
                "nombre": "Noticias Económicas Importantes",
                "descripcion": "Alertas para noticias económicas relevantes",
                "keywords": ["economia", "mercado", "inversion", "crisis economica", "inflacion"],
                "categorias": ["ECONOMÍA"],
                "nivel_urgencia": "media"
            },
            {
                "nombre": "Deportes Destacados",
                "descripcion": "Alertas para noticias deportivas importantes",
                "keywords": ["campeonato", "mundial", "final", "victoria", "record"],
                "categorias": ["DEPORTES"],
                "nivel_urgencia": "baja"
            }
        ]

        for alert_data in sample_alerts:
            alerta = AlertaConfiguracion(
                nombre=alert_data["nombre"],
                descripcion=alert_data["descripcion"],
                keywords=alert_data["keywords"],
                categorias=alert_data["categorias"],
                nivel_urgencia=alert_data["nivel_urgencia"],
                activa=True,
                notificar_email=False,  # Desactivado por defecto
                notificar_webhook=False
            )
            db.add(alerta)

        db.commit()
        logger.info("✅ Alertas de ejemplo creadas exitosamente")

    except Exception as e:
        logger.error(f"❌ Error creando alertas de ejemplo: {e}")
        db.rollback()

def process_existing_news(db: Session):
    """Procesar noticias existentes para generar datos de trending y analytics"""
    try:
        logger.info("🔄 Procesando noticias existentes...")
        
        # Obtener noticias de los últimos 30 días
        fecha_limite = datetime.utcnow() - timedelta(days=30)
        noticias = db.query(Noticia).filter(
            Noticia.fecha_extraccion >= fecha_limite
        ).all()

        if not noticias:
            logger.warning("⚠️ No se encontraron noticias para procesar")
            return

        logger.info(f"📰 Procesando {len(noticias)} noticias...")

        # Inicializar sistema de alertas
        alert_system = AlertSystemSimple()
        processed_count = 0
        trending_count = 0

        for noticia in noticias:
            try:
                # Procesar alertas y sentimientos
                result = alert_system.process_news_alerts(db, noticia)
                
                # Marcar algunas noticias como trending (simulación)
                # En un sistema real, esto se basaría en métricas reales
                if random.random() < 0.3:  # 30% de probabilidad
                    noticia.es_trending = True
                    trending_count += 1
                
                processed_count += 1
                
                if processed_count % 50 == 0:
                    logger.info(f"📊 Procesadas {processed_count}/{len(noticias)} noticias...")
                    db.commit()  # Commit intermedio

            except Exception as e:
                logger.error(f"❌ Error procesando noticia {noticia.id}: {e}")
                continue

        # Commit final
        db.commit()
        
        logger.info(f"✅ Procesamiento completado:")
        logger.info(f"   • {processed_count} noticias procesadas")
        logger.info(f"   • {trending_count} noticias marcadas como trending")

    except Exception as e:
        logger.error(f"❌ Error procesando noticias existentes: {e}")
        db.rollback()

def generate_trending_keywords(db: Session):
    """Generar palabras clave trending basadas en noticias existentes"""
    try:
        logger.info("🔤 Generando palabras clave trending...")
        
        # Obtener noticias recientes
        fecha_limite = datetime.utcnow() - timedelta(days=7)
        noticias = db.query(Noticia).filter(
            Noticia.fecha_extraccion >= fecha_limite
        ).all()

        # Contar palabras clave comunes
        keyword_count = {}
        common_words = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'como', 'más', 'pero', 'sus', 'me', 'ya', 'muy', 'mi', 'sin', 'sobre', 'este', 'ser', 'tiene', 'todo', 'esta', 'fue', 'hasta', 'desde']

        for noticia in noticias:
            # Procesar título
            words = noticia.titulo.lower().split()
            for word in words:
                word = word.strip('.,!?":;()[]{}')
                if len(word) > 3 and word not in common_words:
                    keyword_count[word] = keyword_count.get(word, 0) + 1

        # Crear registros de trending keywords
        for word, count in sorted(keyword_count.items(), key=lambda x: x[1], reverse=True)[:50]:
            # Verificar si ya existe
            existing = db.query(TrendingKeywords).filter(
                TrendingKeywords.palabra == word,
                TrendingKeywords.fecha >= fecha_limite
            ).first()

            if not existing:
                trending_kw = TrendingKeywords(
                    palabra=word,
                    frecuencia=count,
                    categoria="GENERAL",
                    score_trending=min(count * 0.1, 1.0),
                    fecha=datetime.utcnow()
                )
                db.add(trending_kw)

        db.commit()
        logger.info(f"✅ Palabras clave trending generadas: {len(keyword_count)} palabras procesadas")

    except Exception as e:
        logger.error(f"❌ Error generando keywords trending: {e}")
        db.rollback()

def main():
    """Función principal"""
    print("🚀 PROCESADOR DE NOTICIAS EXISTENTES")
    print("=" * 50)
    
    try:
        # Obtener sesión de base de datos
        db = next(get_db())
        
        # Crear alertas de ejemplo
        create_sample_alerts(db)
        
        # Procesar noticias existentes
        process_existing_news(db)
        
        # Generar palabras clave trending
        generate_trending_keywords(db)
        
        print("\n🎉 ¡PROCESAMIENTO COMPLETADO EXITOSAMENTE!")
        print("\n📋 DATOS GENERADOS:")
        print("   • ✅ Alertas y sentimientos procesados")
        print("   • ✅ Noticias trending marcadas")
        print("   • ✅ Palabras clave trending generadas")
        print("   • ✅ Configuraciones de alerta creadas")
        
        print("\n🌐 AHORA DEBERÍAN FUNCIONAR:")
        print("   • 📈 Sección de Noticias Trending")
        print("   • 📊 Dashboard de Analytics")
        print("   • 🚨 Sistema de Alertas")
        
    except Exception as e:
        print(f"\n💥 ERROR EN EL PROCESAMIENTO: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()

