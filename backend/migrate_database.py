#!/usr/bin/env python3
"""
Script de migración para agregar nuevos campos a la base de datos existente
"""

import sys
import os
from sqlalchemy import text
from database import engine, get_db
from models import Base
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_migration():
    """Ejecutar migración de base de datos"""
    
    logger.info("🚀 Iniciando migración de base de datos...")
    
    try:
        with engine.connect() as conn:
            # Crear backup de seguridad (opcional)
            logger.info("📋 Verificando estructura actual...")
            
            # Verificar si las columnas ya existen
            existing_columns = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'noticias' AND table_schema = 'public'
            """)).fetchall()
            
            existing_column_names = [col[0] for col in existing_columns]
            logger.info(f"Columnas existentes en 'noticias': {existing_column_names}")
            
            # Lista de nuevas columnas a agregar
            new_columns = [
                ("autor", "VARCHAR(200)"),
                ("tags", "JSON"),
                ("sentimiento", "VARCHAR(20)"),
                ("tiempo_lectura_min", "INTEGER"),
                ("popularidad_score", "FLOAT DEFAULT 0.0"),
                ("es_trending", "BOOLEAN DEFAULT FALSE"),
                ("palabras_clave", "JSON"),
                ("resumen_auto", "TEXT"),
                ("idioma", "VARCHAR(5) DEFAULT 'es'"),
                ("region", "VARCHAR(100)"),
                ("titulo_hash", "VARCHAR(64)"),
                ("contenido_hash", "VARCHAR(64)"),
                ("similarity_hash", "VARCHAR(64)"),
                ("es_alerta", "BOOLEAN DEFAULT FALSE"),
                ("nivel_urgencia", "VARCHAR(20)"),
                ("keywords_alerta", "JSON")
            ]
            
            # Agregar columnas que no existan
            for column_name, column_type in new_columns:
                if column_name not in existing_column_names:
                    try:
                        alter_sql = f"ALTER TABLE noticias ADD COLUMN {column_name} {column_type}"
                        conn.execute(text(alter_sql))
                        logger.info(f"✅ Agregada columna: {column_name}")
                    except Exception as e:
                        logger.error(f"❌ Error agregando columna {column_name}: {e}")
                else:
                    logger.info(f"⏭️  Columna {column_name} ya existe")
            
            # Crear índices para optimizar búsquedas
            indices = [
                "CREATE INDEX IF NOT EXISTS idx_noticias_titulo_hash ON noticias(titulo_hash)",
                "CREATE INDEX IF NOT EXISTS idx_noticias_contenido_hash ON noticias(contenido_hash)",
                "CREATE INDEX IF NOT EXISTS idx_noticias_similarity_hash ON noticias(similarity_hash)",
                "CREATE INDEX IF NOT EXISTS idx_noticias_sentimiento ON noticias(sentimiento)",
                "CREATE INDEX IF NOT EXISTS idx_noticias_es_alerta ON noticias(es_alerta)",
                "CREATE INDEX IF NOT EXISTS idx_noticias_nivel_urgencia ON noticias(nivel_urgencia)"
            ]
            
            for index_sql in indices:
                try:
                    conn.execute(text(index_sql))
                    logger.info(f"✅ Índice creado: {index_sql.split()[-1]}")
                except Exception as e:
                    logger.error(f"❌ Error creando índice: {e}")
            
            conn.commit()
            logger.info("📝 Cambios en tabla 'noticias' completados")
            
        # Crear nuevas tablas usando SQLAlchemy
        logger.info("🆕 Creando nuevas tablas...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Nuevas tablas creadas exitosamente")
        
        # Generar hashes para noticias existentes
        logger.info("🔄 Generando hashes para noticias existentes...")
        update_existing_news_hashes()
        
        logger.info("🎉 ¡Migración completada exitosamente!")
        
    except Exception as e:
        logger.error(f"💥 Error durante la migración: {e}")
        raise

def update_existing_news_hashes():
    """Actualizar hashes para noticias existentes que no los tengan"""
    try:
        from duplicate_detector import DuplicateDetector
        from models import Noticia
        
        detector = DuplicateDetector()
        db = next(get_db())
        
        # Obtener noticias sin hash
        noticias_sin_hash = db.query(Noticia).filter(
            Noticia.titulo_hash.is_(None)
        ).limit(1000).all()  # Procesar en lotes
        
        logger.info(f"📊 Actualizando hashes para {len(noticias_sin_hash)} noticias...")
        
        updated_count = 0
        for noticia in noticias_sin_hash:
            try:
                # Generar hashes
                noticia_data = {
                    'titulo': noticia.titulo,
                    'contenido': noticia.contenido or ''
                }
                
                enhanced_data = detector.prepare_news_for_save(noticia_data)
                
                # Actualizar noticia
                noticia.titulo_hash = enhanced_data.get('titulo_hash')
                noticia.contenido_hash = enhanced_data.get('contenido_hash')
                noticia.similarity_hash = enhanced_data.get('similarity_hash')
                noticia.palabras_clave = enhanced_data.get('palabras_clave')
                noticia.tiempo_lectura_min = enhanced_data.get('tiempo_lectura_min', 1)
                
                # Valores por defecto
                if not noticia.idioma:
                    noticia.idioma = 'es'
                if not noticia.region:
                    noticia.region = 'Peru'
                
                updated_count += 1
                
                # Commit cada 100 registros
                if updated_count % 100 == 0:
                    db.commit()
                    logger.info(f"📈 Procesadas {updated_count} noticias...")
                    
            except Exception as e:
                logger.error(f"❌ Error actualizando noticia {noticia.id}: {e}")
                continue
        
        db.commit()
        logger.info(f"✅ Hashes actualizados para {updated_count} noticias")
        
    except Exception as e:
        logger.error(f"❌ Error actualizando hashes: {e}")
    finally:
        db.close()

def create_sample_alerts():
    """Crear algunas alertas de ejemplo"""
    try:
        from alert_system import AlertSystem
        
        alert_system = AlertSystem()
        db = next(get_db())
        
        sample_alerts = [
            {
                'nombre': 'Noticias Urgentes',
                'descripcion': 'Alertas para noticias de emergencia o crisis',
                'keywords': ['emergencia', 'crisis', 'urgente', 'breaking', 'alerta roja'],
                'nivel_urgencia': 'critica',
                'activa': True
            },
            {
                'nombre': 'Política Nacional',
                'descripcion': 'Noticias importantes sobre política peruana',
                'keywords': ['presidente', 'congreso', 'elecciones', 'gobierno', 'ministro'],
                'categorias': ['Política'],
                'nivel_urgencia': 'alta',
                'activa': True
            },
            {
                'nombre': 'Economía y Mercados',
                'descripcion': 'Alertas sobre economía y mercados financieros',
                'keywords': ['economia', 'mercado', 'inflacion', 'dolar', 'inversion'],
                'categorias': ['Economía'],
                'nivel_urgencia': 'media',
                'activa': True
            }
        ]
        
        for alert_data in sample_alerts:
            try:
                alert_system.create_alert_configuration(db, alert_data)
                logger.info(f"✅ Alerta creada: {alert_data['nombre']}")
            except Exception as e:
                logger.error(f"❌ Error creando alerta {alert_data['nombre']}: {e}")
        
        logger.info("🎯 Alertas de ejemplo creadas")
        
    except Exception as e:
        logger.error(f"❌ Error creando alertas de ejemplo: {e}")

def main():
    """Función principal"""
    print("🔧 MIGRACIÓN DE BASE DE DATOS - SISTEMA DE NOTICIAS")
    print("=" * 60)
    
    try:
        # Ejecutar migración
        run_migration()
        
        # Crear alertas de ejemplo
        create_sample_alerts()
        
        print("\n🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!")
        print("\n📋 NUEVAS FUNCIONALIDADES DISPONIBLES:")
        print("   • ✅ Detección avanzada de duplicados")
        print("   • ✅ Sistema de alertas y notificaciones")
        print("   • ✅ Análisis de sentimientos")
        print("   • ✅ Palabras clave trending")
        print("   • ✅ Nuevos endpoints de API")
        print("\n🚀 ENDPOINTS NUEVOS:")
        print("   • POST /alertas/crear - Crear alertas")
        print("   • GET /alertas - Listar alertas")
        print("   • GET /noticias/buscar - Búsqueda avanzada")
        print("   • GET /noticias/trending - Noticias trending")
        print("   • GET /analytics/sentimientos - Análisis de sentimientos")
        print("   • GET /analytics/palabras-clave - Palabras clave trending")
        print("   • GET /analytics/duplicados - Stats de duplicados")
        print("   • POST /scraping/ejecutar - Scraping manual")
        
    except Exception as e:
        print(f"\n💥 ERROR EN LA MIGRACIÓN: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
