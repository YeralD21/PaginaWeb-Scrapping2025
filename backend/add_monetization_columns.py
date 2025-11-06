"""
Script para agregar columnas de monetización al modelo User
"""

import sys
import os
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_column_exists(table_name, column_name):
    """Verificar si una columna existe en una tabla"""
    with engine.connect() as conn:
        result = conn.execute(text(f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='{table_name}' AND column_name='{column_name}'
        """))
        return result.fetchone() is not None

def add_monetization_columns():
    """Agregar columnas para sistema de monetización"""
    logger.info("🚀 Iniciando migración de columnas de monetización...")
    
    with engine.connect() as conn:
        # Columnas a agregar
        columns = [
            ("monetization_enabled", "ALTER TABLE users ADD COLUMN monetization_enabled BOOLEAN DEFAULT FALSE"),
            ("monetization_activated_at", "ALTER TABLE users ADD COLUMN monetization_activated_at TIMESTAMP"),
        ]
        
        for column_name, sql in columns:
            try:
                if not check_column_exists('users', column_name):
                    conn.execute(text(sql))
                    conn.commit()
                    logger.info(f"✅ Columna '{column_name}' agregada a tabla 'users'")
                else:
                    logger.info(f"ℹ️  Columna '{column_name}' ya existe en users")
            except Exception as e:
                logger.warning(f"⚠️  Error agregando '{column_name}': {e}")
                conn.rollback()
        
        logger.info("🎉 Migración completada exitosamente")

if __name__ == "__main__":
    try:
        add_monetization_columns()
    except Exception as e:
        logger.error(f"❌ Error en la migración: {e}")
        sys.exit(1)

