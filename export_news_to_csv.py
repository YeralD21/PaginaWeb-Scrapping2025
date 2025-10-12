#!/usr/bin/env python3
"""
Script para exportar todas las noticias de la base de datos a archivos CSV
Incluye todas las tablas: noticias, diarios, estadísticas, alertas, etc.
"""

import os
import sys
import csv
import json
from datetime import datetime
from sqlalchemy.orm import sessionmaker

# Agregar el directorio backend al path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from database import engine, get_db
from models import Noticia, Diario, EstadisticaScraping, AlertaConfiguracion, AlertaDisparo, TrendingKeywords, SiteMonitoring
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def export_noticias_to_csv():
    """Exportar todas las noticias a CSV con todos los campos"""
    
    logger.info("🚀 Iniciando exportación de noticias a CSV...")
    
    # Crear sesión de base de datos
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Obtener todas las noticias con información del diario
        noticias = db.query(Noticia).join(Diario).all()
        
        if not noticias:
            logger.warning("⚠️ No se encontraron noticias en la base de datos")
            return
        
        logger.info(f"📊 Encontradas {len(noticias)} noticias para exportar")
        
        # Crear directorio de exportación si no existe
        export_dir = "exports"
        os.makedirs(export_dir, exist_ok=True)
        
        # Nombre del archivo con timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{export_dir}/noticias_export_{timestamp}.csv"
        
        # Campos a exportar
        fieldnames = [
            'id', 'titulo', 'contenido', 'enlace', 'imagen_url', 'categoria',
            'fecha_publicacion', 'fecha_extraccion', 'diario_id', 'diario_nombre',
            'autor', 'tags', 'sentimiento', 'tiempo_lectura_min', 'popularidad_score',
            'es_trending', 'palabras_clave', 'resumen_auto', 'idioma', 'region',
            'titulo_hash', 'contenido_hash', 'similarity_hash', 'es_alerta',
            'nivel_urgencia', 'keywords_alerta', 'geographic_type', 'geographic_confidence',
            'geographic_keywords'
        ]
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for noticia in noticias:
                # Preparar datos para CSV
                row_data = {
                    'id': noticia.id,
                    'titulo': noticia.titulo,
                    'contenido': noticia.contenido or '',
                    'enlace': noticia.enlace or '',
                    'imagen_url': noticia.imagen_url or '',
                    'categoria': noticia.categoria,
                    'fecha_publicacion': noticia.fecha_publicacion.isoformat() if noticia.fecha_publicacion else '',
                    'fecha_extraccion': noticia.fecha_extraccion.isoformat() if noticia.fecha_extraccion else '',
                    'diario_id': noticia.diario_id,
                    'diario_nombre': noticia.diario.nombre if noticia.diario else '',
                    'autor': noticia.autor or '',
                    'tags': json.dumps(noticia.tags, ensure_ascii=False) if noticia.tags else '',
                    'sentimiento': noticia.sentimiento or '',
                    'tiempo_lectura_min': noticia.tiempo_lectura_min or '',
                    'popularidad_score': noticia.popularidad_score or '',
                    'es_trending': noticia.es_trending or False,
                    'palabras_clave': json.dumps(noticia.palabras_clave, ensure_ascii=False) if noticia.palabras_clave else '',
                    'resumen_auto': noticia.resumen_auto or '',
                    'idioma': noticia.idioma or '',
                    'region': noticia.region or '',
                    'titulo_hash': noticia.titulo_hash or '',
                    'contenido_hash': noticia.contenido_hash or '',
                    'similarity_hash': noticia.similarity_hash or '',
                    'es_alerta': noticia.es_alerta or False,
                    'nivel_urgencia': noticia.nivel_urgencia or '',
                    'keywords_alerta': json.dumps(noticia.keywords_alerta, ensure_ascii=False) if noticia.keywords_alerta else '',
                    'geographic_type': noticia.geographic_type or '',
                    'geographic_confidence': noticia.geographic_confidence or '',
                    'geographic_keywords': json.dumps(noticia.geographic_keywords, ensure_ascii=False) if noticia.geographic_keywords else ''
                }
                
                writer.writerow(row_data)
        
        logger.info(f"✅ Noticias exportadas exitosamente a: {filename}")
        return filename
        
    except Exception as e:
        logger.error(f"❌ Error exportando noticias: {e}")
        return None
    finally:
        db.close()

def export_diarios_to_csv():
    """Exportar información de diarios a CSV"""
    
    logger.info("📰 Exportando información de diarios...")
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        diarios = db.query(Diario).all()
        
        if not diarios:
            logger.warning("⚠️ No se encontraron diarios en la base de datos")
            return
        
        export_dir = "exports"
        os.makedirs(export_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{export_dir}/diarios_export_{timestamp}.csv"
        
        fieldnames = ['id', 'nombre', 'url', 'activo', 'fecha_creacion', 'total_noticias']
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for diario in diarios:
                # Contar noticias por diario
                total_noticias = db.query(Noticia).filter(Noticia.diario_id == diario.id).count()
                
                row_data = {
                    'id': diario.id,
                    'nombre': diario.nombre,
                    'url': diario.url,
                    'activo': diario.activo,
                    'fecha_creacion': diario.fecha_creacion.isoformat() if diario.fecha_creacion else '',
                    'total_noticias': total_noticias
                }
                
                writer.writerow(row_data)
        
        logger.info(f"✅ Diarios exportados exitosamente a: {filename}")
        return filename
        
    except Exception as e:
        logger.error(f"❌ Error exportando diarios: {e}")
        return None
    finally:
        db.close()

def export_estadisticas_to_csv():
    """Exportar estadísticas de scraping a CSV"""
    
    logger.info("📈 Exportando estadísticas de scraping...")
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        estadisticas = db.query(EstadisticaScraping).join(Diario).all()
        
        if not estadisticas:
            logger.warning("⚠️ No se encontraron estadísticas en la base de datos")
            return
        
        export_dir = "exports"
        os.makedirs(export_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{export_dir}/estadisticas_export_{timestamp}.csv"
        
        fieldnames = ['id', 'diario_id', 'diario_nombre', 'categoria', 'cantidad_noticias', 
                     'fecha_scraping', 'duracion_segundos', 'estado']
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for estadistica in estadisticas:
                row_data = {
                    'id': estadistica.id,
                    'diario_id': estadistica.diario_id,
                    'diario_nombre': estadistica.diario.nombre if estadistica.diario else '',
                    'categoria': estadistica.categoria,
                    'cantidad_noticias': estadistica.cantidad_noticias,
                    'fecha_scraping': estadistica.fecha_scraping.isoformat() if estadistica.fecha_scraping else '',
                    'duracion_segundos': estadistica.duracion_segundos or '',
                    'estado': estadistica.estado
                }
                
                writer.writerow(row_data)
        
        logger.info(f"✅ Estadísticas exportadas exitosamente a: {filename}")
        return filename
        
    except Exception as e:
        logger.error(f"❌ Error exportando estadísticas: {e}")
        return None
    finally:
        db.close()

def export_alertas_to_csv():
    """Exportar configuración y disparos de alertas a CSV"""
    
    logger.info("🚨 Exportando alertas...")
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Exportar configuraciones de alertas
        alertas_config = db.query(AlertaConfiguracion).all()
        
        if alertas_config:
            export_dir = "exports"
            os.makedirs(export_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{export_dir}/alertas_config_export_{timestamp}.csv"
            
            fieldnames = ['id', 'nombre', 'descripcion', 'keywords', 'categorias', 'diarios',
                         'nivel_urgencia', 'activa', 'fecha_creacion', 'notificar_email',
                         'email_destino', 'notificar_webhook', 'webhook_url']
            
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                
                for alerta in alertas_config:
                    row_data = {
                        'id': alerta.id,
                        'nombre': alerta.nombre,
                        'descripcion': alerta.descripcion or '',
                        'keywords': json.dumps(alerta.keywords, ensure_ascii=False) if alerta.keywords else '',
                        'categorias': json.dumps(alerta.categorias, ensure_ascii=False) if alerta.categorias else '',
                        'diarios': json.dumps(alerta.diarios, ensure_ascii=False) if alerta.diarios else '',
                        'nivel_urgencia': alerta.nivel_urgencia,
                        'activa': alerta.activa,
                        'fecha_creacion': alerta.fecha_creacion.isoformat() if alerta.fecha_creacion else '',
                        'notificar_email': alerta.notificar_email or False,
                        'email_destino': alerta.email_destino or '',
                        'notificar_webhook': alerta.notificar_webhook or False,
                        'webhook_url': alerta.webhook_url or ''
                    }
                    
                    writer.writerow(row_data)
            
            logger.info(f"✅ Configuraciones de alertas exportadas a: {filename}")
        
        # Exportar disparos de alertas
        alertas_disparos = db.query(AlertaDisparo).join(AlertaConfiguracion).join(Noticia).all()
        
        if alertas_disparos:
            export_dir = "exports"
            os.makedirs(export_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{export_dir}/alertas_disparos_export_{timestamp}.csv"
            
            fieldnames = ['id', 'configuracion_id', 'configuracion_nombre', 'noticia_id', 
                         'noticia_titulo', 'keyword_match', 'nivel_urgencia', 'fecha_disparo', 
                         'notificacion_enviada']
            
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                
                for disparo in alertas_disparos:
                    row_data = {
                        'id': disparo.id,
                        'configuracion_id': disparo.configuracion_id,
                        'configuracion_nombre': disparo.configuracion.nombre if disparo.configuracion else '',
                        'noticia_id': disparo.noticia_id,
                        'noticia_titulo': disparo.noticia.titulo if disparo.noticia else '',
                        'keyword_match': disparo.keyword_match or '',
                        'nivel_urgencia': disparo.nivel_urgencia or '',
                        'fecha_disparo': disparo.fecha_disparo.isoformat() if disparo.fecha_disparo else '',
                        'notificacion_enviada': disparo.notificacion_enviada or False
                    }
                    
                    writer.writerow(row_data)
            
            logger.info(f"✅ Disparos de alertas exportados a: {filename}")
        
    except Exception as e:
        logger.error(f"❌ Error exportando alertas: {e}")
    finally:
        db.close()

def export_trending_keywords_to_csv():
    """Exportar palabras clave trending a CSV"""
    
    logger.info("🔥 Exportando palabras clave trending...")
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        trending = db.query(TrendingKeywords).all()
        
        if not trending:
            logger.warning("⚠️ No se encontraron palabras trending en la base de datos")
            return
        
        export_dir = "exports"
        os.makedirs(export_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{export_dir}/trending_keywords_export_{timestamp}.csv"
        
        fieldnames = ['id', 'palabra', 'frecuencia', 'categoria', 'fecha', 'periodo', 'score_trending']
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for keyword in trending:
                row_data = {
                    'id': keyword.id,
                    'palabra': keyword.palabra,
                    'frecuencia': keyword.frecuencia,
                    'categoria': keyword.categoria or '',
                    'fecha': keyword.fecha.isoformat() if keyword.fecha else '',
                    'periodo': keyword.periodo,
                    'score_trending': keyword.score_trending
                }
                
                writer.writerow(row_data)
        
        logger.info(f"✅ Palabras trending exportadas a: {filename}")
        return filename
        
    except Exception as e:
        logger.error(f"❌ Error exportando palabras trending: {e}")
        return None
    finally:
        db.close()

def export_all_data():
    """Exportar todos los datos de la base de datos a CSV"""
    
    logger.info("🚀 Iniciando exportación completa de datos...")
    
    exported_files = []
    
    # Exportar noticias (principal)
    noticias_file = export_noticias_to_csv()
    if noticias_file:
        exported_files.append(noticias_file)
    
    # Exportar diarios
    diarios_file = export_diarios_to_csv()
    if diarios_file:
        exported_files.append(diarios_file)
    
    # Exportar estadísticas
    estadisticas_file = export_estadisticas_to_csv()
    if estadisticas_file:
        exported_files.append(estadisticas_file)
    
    # Exportar alertas
    export_alertas_to_csv()
    
    # Exportar trending keywords
    trending_file = export_trending_keywords_to_csv()
    if trending_file:
        exported_files.append(trending_file)
    
    logger.info("✅ Exportación completa finalizada!")
    logger.info(f"📁 Archivos exportados: {len(exported_files)}")
    
    for file in exported_files:
        logger.info(f"   - {file}")
    
    return exported_files

def main():
    """Función principal"""
    
    print("=" * 60)
    print("📊 EXPORTADOR DE DATOS DE NOTICIAS A CSV")
    print("=" * 60)
    
    try:
        # Verificar conexión a la base de datos
        from database import test_connection
        if not test_connection():
            logger.error("❌ No se pudo conectar a la base de datos")
            return
        
        # Exportar todos los datos
        exported_files = export_all_data()
        
        if exported_files:
            print("\n🎉 ¡Exportación completada exitosamente!")
            print(f"📁 Se generaron {len(exported_files)} archivos CSV")
            print("\nArchivos generados:")
            for file in exported_files:
                print(f"   ✅ {file}")
        else:
            print("\n⚠️ No se encontraron datos para exportar")
            
    except Exception as e:
        logger.error(f"❌ Error durante la exportación: {e}")
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
