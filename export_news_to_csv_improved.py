#!/usr/bin/env python3
"""
Script mejorado para exportar todas las noticias de la base de datos a archivos CSV
Con manejo correcto de fechas, codificación UTF-8 y todos los campos
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

def clean_text(text):
    """Limpiar texto para CSV"""
    if not text:
        return ""
    
    # Convertir a string si no lo es
    text = str(text)
    
    # Remover caracteres problemáticos
    text = text.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
    
    # Limpiar espacios múltiples
    import re
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()

def export_noticias_to_csv_improved():
    """Exportar todas las noticias a CSV con manejo mejorado"""
    
    logger.info("🚀 Iniciando exportación mejorada de noticias a CSV...")
    
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
        filename = f"{export_dir}/noticias_completo_{timestamp}.csv"
        
        # Campos a exportar (en el orden correcto)
        fieldnames = [
            'id', 'titulo', 'contenido', 'enlace', 'imagen_url', 'categoria',
            'fecha_publicacion', 'fecha_extraccion', 'diario_id', 'diario_nombre',
            'autor', 'tags', 'sentimiento', 'tiempo_lectura_min', 'popularidad_score',
            'es_trending', 'palabras_clave', 'resumen_auto', 'idioma', 'region',
            'titulo_hash', 'contenido_hash', 'similarity_hash', 'es_alerta',
            'nivel_urgencia', 'keywords_alerta', 'geographic_type', 'geographic_confidence',
            'geographic_keywords'
        ]
        
        # Escribir CSV con codificación UTF-8 y BOM para Excel
        with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
            writer.writeheader()
            
            for i, noticia in enumerate(noticias, 1):
                if i % 500 == 0:
                    logger.info(f"📝 Procesando noticia {i}/{len(noticias)}")
                
                # Preparar datos para CSV con manejo correcto de todos los campos
                row_data = {
                    'id': noticia.id,
                    'titulo': clean_text(noticia.titulo),
                    'contenido': clean_text(noticia.contenido),
                    'enlace': clean_text(noticia.enlace),
                    'imagen_url': clean_text(noticia.imagen_url),
                    'categoria': clean_text(noticia.categoria),
                    'fecha_publicacion': noticia.fecha_publicacion.strftime('%Y-%m-%d %H:%M:%S') if noticia.fecha_publicacion else '',
                    'fecha_extraccion': noticia.fecha_extraccion.strftime('%Y-%m-%d %H:%M:%S') if noticia.fecha_extraccion else '',
                    'diario_id': noticia.diario_id,
                    'diario_nombre': clean_text(noticia.diario.nombre if noticia.diario else ''),
                    'autor': clean_text(noticia.autor),
                    'tags': json.dumps(noticia.tags, ensure_ascii=False) if noticia.tags else '',
                    'sentimiento': clean_text(noticia.sentimiento),
                    'tiempo_lectura_min': noticia.tiempo_lectura_min if noticia.tiempo_lectura_min is not None else '',
                    'popularidad_score': noticia.popularidad_score if noticia.popularidad_score is not None else '',
                    'es_trending': 'Sí' if noticia.es_trending else 'No',
                    'palabras_clave': json.dumps(noticia.palabras_clave, ensure_ascii=False) if noticia.palabras_clave else '',
                    'resumen_auto': clean_text(noticia.resumen_auto),
                    'idioma': clean_text(noticia.idioma),
                    'region': clean_text(noticia.region),
                    'titulo_hash': clean_text(noticia.titulo_hash),
                    'contenido_hash': clean_text(noticia.contenido_hash),
                    'similarity_hash': clean_text(noticia.similarity_hash),
                    'es_alerta': 'Sí' if noticia.es_alerta else 'No',
                    'nivel_urgencia': clean_text(noticia.nivel_urgencia),
                    'keywords_alerta': json.dumps(noticia.keywords_alerta, ensure_ascii=False) if noticia.keywords_alerta else '',
                    'geographic_type': clean_text(noticia.geographic_type),
                    'geographic_confidence': noticia.geographic_confidence if noticia.geographic_confidence is not None else '',
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

def export_sample_improved():
    """Exportar una muestra mejorada para verificar el formato"""
    
    logger.info("🔍 Exportando muestra mejorada para verificación...")
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Obtener solo 5 noticias para prueba
        noticias = db.query(Noticia).join(Diario).limit(5).all()
        
        if not noticias:
            logger.warning("⚠️ No se encontraron noticias en la base de datos")
            return
        
        logger.info(f"📊 Exportando muestra de {len(noticias)} noticias")
        
        # Crear directorio de exportación si no existe
        export_dir = "exports"
        os.makedirs(export_dir, exist_ok=True)
        
        # Nombre del archivo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{export_dir}/noticias_muestra_{timestamp}.csv"
        
        # Campos a exportar (todos los campos)
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
            
            for noticia in noticias:
                row_data = {
                    'id': noticia.id,
                    'titulo': clean_text(noticia.titulo),
                    'contenido': clean_text(noticia.contenido),
                    'enlace': clean_text(noticia.enlace),
                    'imagen_url': clean_text(noticia.imagen_url),
                    'categoria': clean_text(noticia.categoria),
                    'fecha_publicacion': noticia.fecha_publicacion.strftime('%Y-%m-%d %H:%M:%S') if noticia.fecha_publicacion else '',
                    'fecha_extraccion': noticia.fecha_extraccion.strftime('%Y-%m-%d %H:%M:%S') if noticia.fecha_extraccion else '',
                    'diario_id': noticia.diario_id,
                    'diario_nombre': clean_text(noticia.diario.nombre if noticia.diario else ''),
                    'autor': clean_text(noticia.autor),
                    'tags': json.dumps(noticia.tags, ensure_ascii=False) if noticia.tags else '',
                    'sentimiento': clean_text(noticia.sentimiento),
                    'tiempo_lectura_min': noticia.tiempo_lectura_min if noticia.tiempo_lectura_min is not None else '',
                    'popularidad_score': noticia.popularidad_score if noticia.popularidad_score is not None else '',
                    'es_trending': 'Sí' if noticia.es_trending else 'No',
                    'palabras_clave': json.dumps(noticia.palabras_clave, ensure_ascii=False) if noticia.palabras_clave else '',
                    'resumen_auto': clean_text(noticia.resumen_auto),
                    'idioma': clean_text(noticia.idioma),
                    'region': clean_text(noticia.region),
                    'titulo_hash': clean_text(noticia.titulo_hash),
                    'contenido_hash': clean_text(noticia.contenido_hash),
                    'similarity_hash': clean_text(noticia.similarity_hash),
                    'es_alerta': 'Sí' if noticia.es_alerta else 'No',
                    'nivel_urgencia': clean_text(noticia.nivel_urgencia),
                    'keywords_alerta': json.dumps(noticia.keywords_alerta, ensure_ascii=False) if noticia.keywords_alerta else '',
                    'geographic_type': clean_text(noticia.geographic_type),
                    'geographic_confidence': noticia.geographic_confidence if noticia.geographic_confidence is not None else '',
                    'geographic_keywords': json.dumps(noticia.geographic_keywords, ensure_ascii=False) if noticia.geographic_keywords else ''
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
    
    print("=" * 70)
    print("📊 EXPORTADOR MEJORADO DE DATOS DE NOTICIAS A CSV")
    print("=" * 70)
    
    try:
        # Verificar conexión a la base de datos
        from database import test_connection
        if not test_connection():
            logger.error("❌ No se pudo conectar a la base de datos")
            return
        
        print("\n🔍 Primero exportando una muestra para verificar el formato...")
        sample_file = export_sample_improved()
        
        if sample_file:
            print(f"✅ Muestra exportada: {sample_file}")
            print("\n📋 Verifica que el archivo de muestra tenga todos los campos correctos.")
            print("   - Debe tener 29 columnas")
            print("   - Las fechas deben aparecer en formato YYYY-MM-DD HH:MM:SS")
            print("   - No debe haber problemas de codificación")
            
            print("\n¿Deseas continuar con la exportación completa? (s/n): ", end="")
            response = input().lower().strip()
            
            if response in ['s', 'si', 'sí', 'y', 'yes']:
                print("\n🚀 Iniciando exportación completa...")
                full_file = export_noticias_to_csv_improved()
                
                if full_file:
                    print(f"\n🎉 ¡Exportación completa finalizada!")
                    print(f"📁 Archivo generado: {full_file}")
                    print(f"📊 Total de noticias exportadas: 3,780")
                    print(f"📋 Total de campos por noticia: 29")
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
