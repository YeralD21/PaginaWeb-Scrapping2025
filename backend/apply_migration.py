"""
Script simple para aplicar migraciones SQL a la base de datos existente
"""

import sys
import os
from sqlalchemy import text

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def apply_migration():
    """Aplicar migraciones SQL"""
    
    # Leer el archivo SQL
    sql_file = os.path.join(os.path.dirname(__file__), 'add_ugc_columns.sql')
    
    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Ejecutar cada statement SQL
        with engine.connect() as conn:
            # Dividir por COMMIT y ejecutar cada bloque
            sql_blocks = sql_content.split('COMMIT;')[0].split(';')
            
            for sql_statement in sql_blocks:
                sql_statement = sql_statement.strip()
                if sql_statement and not sql_statement.startswith('--'):
                    try:
                        conn.execute(text(sql_statement))
                        conn.commit()
                        logger.info(f"✅ Ejecutado: {sql_statement[:50]}...")
                    except Exception as e:
                        logger.warning(f"⚠️  Statement ya existe o error: {str(e)[:100]}")
                        continue
        
        logger.info("✅ Migración completada exitosamente")
        return True
        
    except FileNotFoundError:
        logger.error(f"❌ Archivo SQL no encontrado: {sql_file}")
        return False
    except Exception as e:
        logger.error(f"❌ Error aplicando migración: {e}")
        return False

if __name__ == "__main__":
    logger.info("🚀 Iniciando migración de base de datos...")
    success = apply_migration()
    sys.exit(0 if success else 1)

