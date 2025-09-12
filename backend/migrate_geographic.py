#!/usr/bin/env python3
"""
Migración para añadir campos geográficos a noticias existentes
"""

import sys
import os
from sqlalchemy import text
from datetime import datetime

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import get_db, engine
from backend.models import Noticia
from backend.geographic_classifier import GeographicClassifier

def add_geographic_columns():
    """Añadir columnas geográficas a la tabla noticias si no existen"""
    print("🔧 Añadiendo columnas geográficas...")
    
    try:
        with engine.connect() as conn:
            # Verificar si las columnas ya existen
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'noticias' 
                AND column_name IN ('geographic_type', 'geographic_confidence', 'geographic_keywords')
            """))
            
            existing_columns = [row[0] for row in result.fetchall()]
            
            # Añadir columnas que no existen
            if 'geographic_type' not in existing_columns:
                conn.execute(text("ALTER TABLE noticias ADD COLUMN geographic_type VARCHAR(20) DEFAULT 'nacional'"))
                print("✅ Columna 'geographic_type' añadida")
            
            if 'geographic_confidence' not in existing_columns:
                conn.execute(text("ALTER TABLE noticias ADD COLUMN geographic_confidence FLOAT DEFAULT 0.5"))
                print("✅ Columna 'geographic_confidence' añadida")
            
            if 'geographic_keywords' not in existing_columns:
                conn.execute(text("ALTER TABLE noticias ADD COLUMN geographic_keywords JSON"))
                print("✅ Columna 'geographic_keywords' añadida")
            
            conn.commit()
            print("✅ Columnas geográficas añadidas exitosamente")
            
    except Exception as e:
        print(f"❌ Error añadiendo columnas: {e}")
        raise

def classify_existing_news():
    """Clasificar geográficamente las noticias existentes"""
    print("🌍 Clasificando noticias existentes...")
    
    classifier = GeographicClassifier()
    db = next(get_db())
    
    try:
        # Obtener noticias que no tienen clasificación geográfica
        noticias = db.query(Noticia).filter(
            Noticia.geographic_type.is_(None)
        ).all()
        
        print(f"📊 Encontradas {len(noticias)} noticias para clasificar")
        
        classified_count = 0
        batch_size = 50
        
        for i, noticia in enumerate(noticias):
            try:
                # Clasificar la noticia
                classification = classifier.classify_news(
                    title=noticia.titulo,
                    content=noticia.contenido or ""
                )
                
                # Actualizar la noticia
                noticia.geographic_type = classification['geographic_type']
                noticia.geographic_confidence = classification['confidence']
                noticia.geographic_keywords = classification['keywords_found']
                
                classified_count += 1
                
                # Commit cada cierto número de noticias
                if (i + 1) % batch_size == 0:
                    db.commit()
                    print(f"📈 Procesadas {i + 1}/{len(noticias)} noticias...")
                
            except Exception as e:
                print(f"⚠️  Error clasificando noticia {noticia.id}: {e}")
                continue
        
        # Commit final
        db.commit()
        print(f"✅ Clasificadas {classified_count} noticias exitosamente")
        
        # Mostrar estadísticas
        show_classification_stats(db)
        
    except Exception as e:
        print(f"❌ Error clasificando noticias: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def show_classification_stats(db):
    """Mostrar estadísticas de clasificación"""
    print("\n📊 ESTADÍSTICAS DE CLASIFICACIÓN GEOGRÁFICA:")
    print("=" * 60)
    
    # Contar por tipo geográfico
    stats = db.query(
        Noticia.geographic_type,
        db.func.count(Noticia.id).label('cantidad')
    ).group_by(Noticia.geographic_type).all()
    
    total = sum(stat.cantidad for stat in stats)
    
    for stat in stats:
        tipo = stat.geographic_type or 'sin_clasificar'
        cantidad = stat.cantidad
        porcentaje = (cantidad / total) * 100 if total > 0 else 0
        
        # Emojis por tipo
        emoji_map = {
            'internacional': '🌍',
            'nacional': '🇵🇪',
            'regional': '🏞️',
            'local': '🏙️',
            'sin_clasificar': '❓'
        }
        emoji = emoji_map.get(tipo, '📰')
        
        print(f"{emoji} {tipo.upper()}: {cantidad} noticias ({porcentaje:.1f}%)")
    
    print(f"\n📈 TOTAL: {total} noticias clasificadas")
    print("=" * 60)

def main():
    """Función principal de migración"""
    print("🚀 MIGRACIÓN GEOGRÁFICA DE NOTICIAS")
    print("=" * 50)
    print("Este script añadirá clasificación geográfica automática")
    print("a todas las noticias existentes en la base de datos.")
    print("=" * 50)
    
    try:
        # Paso 1: Añadir columnas
        add_geographic_columns()
        
        # Paso 2: Clasificar noticias existentes
        classify_existing_news()
        
        print("\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE")
        print("✅ Todas las noticias ahora tienen clasificación geográfica")
        print("✅ Los nuevos scrapings incluirán clasificación automática")
        print("\n🌐 Tipos de clasificación disponibles:")
        print("   • 🌍 Internacional: Noticias de otros países")
        print("   • 🇵🇪 Nacional: Noticias del gobierno y país")
        print("   • 🏞️ Regional: Noticias de regiones del Perú")
        print("   • 🏙️ Local: Noticias de Lima y Callao")
        
    except Exception as e:
        print(f"\n💥 ERROR EN LA MIGRACIÓN: {e}")
        print("❌ La migración falló. Revisa los logs para más detalles.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
