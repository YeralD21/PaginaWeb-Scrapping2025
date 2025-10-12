#!/usr/bin/env python3
"""
Script mejorado para exportar todas las noticias de la base de datos a archivos CSV
Con manejo correcto de fechas y codificación
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

def export_noticias_to_csv_fixed():
    """Exportar todas las noticias a CSV con manejo correcto de fechas"""
    
    logger.info("🚀 Iniciando exportación de noticias a CSV (versión mejorada)...")
    
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
        filename = f"{export_dir}/noticias_export_fixed_{timestamp}.csv"
        
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
        
        with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
            writer.writeheader()
            
            for i, noticia in enumerate(noticias, 1):
                if i % 100 == 0:
                    logger.info(f"📝 Procesando noticia {i}/{len(noticias)}")
                
                # Preparar datos para CSV con manejo correcto de fechas
                row_data = {
                    'id': noticia.id,
                    'titulo': noticia.titulo or '',
                    'contenido': noticia.contenido or '',
                    'enlace': noticia.enlace or '',
                    'imagen_url': noticia.imagen_url or '',
                    'categoria': noticia.categoria or '',
                    'fecha_publicacion': noticia.fecha_publicacion.strftime('%Y-%m-%d %H:%M:%S') if noticia.fecha_publicacion else '',
                    'fecha_extraccion': noticia.fecha_extraccion.strftime('%Y-%m-%d %H:%M:%S') if noticia.fecha_extraccion else '',
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

def export_noticias_sample():
    """Exportar una muestra de noticias para verificar el formato"""
    
    logger.info("🔍 Exportando muestra de noticias para verificación...")
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Obtener solo 10 noticias para prueba
        noticias = db.query(Noticia).join(Diario).limit(10).all()
        
        if not noticias:
            logger.warning("⚠️ No se encontraron noticias en la base de datos")
            return
        
        logger.info(f"📊 Exportando muestra de {len(noticias)} noticias")
        
        # Crear directorio de exportación si no existe
        export_dir = "exports"
        os.makedirs(export_dir, exist_ok=True)
        
        # Nombre del archivo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{export_dir}/noticias_sample_{timestamp}.csv"
        
        # Campos a exportar
        fieldnames = [
            'id', 'titulo', 'categoria', 'fecha_publicacion', 'fecha_extraccion', 
            'diario_nombre', 'autor', 'enlace'
        ]
        
        with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
            writer.writeheader()
            
            for noticia in noticias:
                row_data = {
                    'id': noticia.id,
                    'titulo': noticia.titulo or '',
                    'categoria': noticia.categoria or '',
                    'fecha_publicacion': noticia.fecha_publicacion.strftime('%Y-%m-%d %H:%M:%S') if noticia.fecha_publicacion else '',
                    'fecha_extraccion': noticia.fecha_extraccion.strftime('%Y-%m-%d %H:%M:%S') if noticia.fecha_extraccion else '',
                    'diario_nombre': noticia.diario.nombre if noticia.diario else '',
                    'autor': noticia.autor or '',
                    'enlace': noticia.enlace or ''
                }
                
                writer.writerow(row_data)
        
        logger.info(f"✅ Muestra exportada exitosamente a: {filename}")
        return filename
        
    except Exception as e:
        logger.error(f"❌ Error exportando muestra: {e}")
        return None
    finally:
        db.close()

def main():
    """Función principal"""
    
    print("=" * 60)
    print("📊 EXPORTADOR DE DATOS DE NOTICIAS A CSV (VERSIÓN MEJORADA)")
    print("=" * 60)
    
    try:
        # Verificar conexión a la base de datos
        from database import test_connection
        if not test_connection():
            logger.error("❌ No se pudo conectar a la base de datos")
            return
        
        # Primero exportar una muestra para verificar
        print("\n🔍 Exportando muestra para verificación...")
        sample_file = export_noticias_sample()
        
        if sample_file:
            print(f"✅ Muestra exportada: {sample_file}")
            
            # Preguntar si continuar con la exportación completa
            print("\n¿Deseas continuar con la exportación completa? (s/n): ", end="")
            response = input().lower().strip()
            
            if response in ['s', 'si', 'sí', 'y', 'yes']:
                print("\n🚀 Iniciando exportación completa...")
                full_file = export_noticias_to_csv_fixed()
                
                if full_file:
                    print(f"\n🎉 ¡Exportación completa finalizada!")
                    print(f"📁 Archivo generado: {full_file}")
                else:
                    print("\n❌ Error en la exportación completa")
            else:
                print("\n⏹️ Exportación cancelada por el usuario")
        else:
            print("\n❌ Error exportando la muestra")
            
    except Exception as e:
        logger.error(f"❌ Error durante la exportación: {e}")
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()

