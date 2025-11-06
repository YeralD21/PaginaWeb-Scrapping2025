#!/usr/bin/env python3
"""
Script para cambiar las columnas tipo y estado de enum a varchar
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_enum_columns():
    """Cambiar columnas de enum a varchar"""
    
    try:
        with engine.connect() as conn:
            # Cambiar tipo de enum a varchar
            logger.info("Cambiando columna 'tipo' de enum a varchar...")
            try:
                conn.execute(text("""
                    ALTER TABLE posts 
                    ALTER COLUMN tipo TYPE VARCHAR(50) 
                    USING tipo::text
                """))
                conn.commit()
                logger.info("✅ Columna 'tipo' cambiada exitosamente")
            except Exception as e:
                logger.error(f"❌ Error cambiando 'tipo': {e}")
                conn.rollback()
            
            # Cambiar estado de enum a varchar
            logger.info("Cambiando columna 'estado' de enum a varchar...")
            try:
                conn.execute(text("""
                    ALTER TABLE posts 
                    ALTER COLUMN estado TYPE VARCHAR(50) 
                    USING estado::text
                """))
                conn.commit()
                logger.info("✅ Columna 'estado' cambiada exitosamente")
            except Exception as e:
                logger.error(f"❌ Error cambiando 'estado': {e}")
                conn.rollback()
            
            # Verificar resultado
            result = conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'posts' 
                AND column_name IN ('tipo', 'estado')
            """))
            
            logger.info("Tipos de datos actuales:")
            for row in result:
                logger.info(f"  {row[0]}: {row[1]}")
            
            return True
            
    except Exception as e:
        logger.error(f"❌ Error general: {e}")
        return False

if __name__ == "__main__":
    logger.info("🔧 Cambiando columnas de enum a varchar...")
    success = fix_enum_columns()
    
    if success:
        logger.info("🎉 Cambios aplicados exitosamente")
    else:
        logger.error("❌ Error aplicando cambios")
        sys.exit(1)
