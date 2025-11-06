#!/usr/bin/env python3
"""
Script para agregar las columnas faltantes a la tabla posts
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine
from sqlalchemy import text
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_missing_columns():
    """Agregar las columnas faltantes a la tabla posts"""
    
    # Columnas que necesitamos agregar
    columns_to_add = [
        ("revisado_por", "INTEGER"),
        ("fecha_revision", "TIMESTAMP"),
        ("motivo_rechazo", "TEXT"),
        ("total_reportes", "INTEGER DEFAULT 0"),
        ("fecha_flagged", "TIMESTAMP"),
        ("verificado_como_fake", "BOOLEAN DEFAULT FALSE"),
        ("fecha_verificacion_fake", "TIMESTAMP")
    ]
    
    try:
        with engine.connect() as conn:
            # Verificar columnas existentes
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'posts'
            """))
            
            existing_columns = [row[0] for row in result]
            logger.info(f"Columnas existentes: {existing_columns}")
            
            # Agregar columnas faltantes
            for column_name, column_definition in columns_to_add:
                if column_name not in existing_columns:
                    try:
                        sql = f"ALTER TABLE posts ADD COLUMN {column_name} {column_definition}"
                        logger.info(f"Ejecutando: {sql}")
                        conn.execute(text(sql))
                        conn.commit()
                        logger.info(f"✅ Columna '{column_name}' agregada exitosamente")
                    except Exception as e:
                        logger.error(f"❌ Error agregando columna '{column_name}': {e}")
                        conn.rollback()
                else:
                    logger.info(f"ℹ️  Columna '{column_name}' ya existe")
            
            # Verificar resultado final
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'posts'
                ORDER BY column_name
            """))
            
            final_columns = [row[0] for row in result]
            logger.info(f"Columnas finales: {final_columns}")
            
            # Verificar que todas las columnas necesarias estén presentes
            required_columns = [col[0] for col in columns_to_add]
            missing_columns = [col for col in required_columns if col not in final_columns]
            
            if missing_columns:
                logger.error(f"❌ Aún faltan columnas: {missing_columns}")
                return False
            else:
                logger.info("✅ Todas las columnas necesarias están presentes")
                return True
                
    except Exception as e:
        logger.error(f"❌ Error general: {e}")
        return False

if __name__ == "__main__":
    logger.info("🔧 Iniciando migración de columnas de posts...")
    success = add_missing_columns()
    
    if success:
        logger.info("🎉 Migración completada exitosamente")
    else:
        logger.error("❌ Migración falló")
        sys.exit(1)
