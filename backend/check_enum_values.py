#!/usr/bin/env python3
"""
Script para verificar y actualizar los valores del enum TipoContenido
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_and_update_enum():
    """Verificar y actualizar el enum TipoContenido"""
    
    try:
        with engine.connect() as conn:
            # Verificar valores actuales del enum
            result = conn.execute(text("""
                SELECT enumlabel 
                FROM pg_enum 
                WHERE enumtypid = (
                    SELECT oid 
                    FROM pg_type 
                    WHERE typname = 'tipocontenido'
                )
                ORDER BY enumsortorder
            """))
            
            current_values = [row[0] for row in result]
            logger.info(f"Valores actuales del enum TipoContenido: {current_values}")
            
            # Valores que necesitamos
            required_values = ['texto', 'imagen', 'video', 'comentario', 'resena', 'post', 'noticia']
            
            # Verificar qué valores faltan
            missing_values = [val for val in required_values if val not in current_values]
            
            if missing_values:
                logger.info(f"Valores faltantes: {missing_values}")
                
                # Agregar valores faltantes
                for value in missing_values:
                    try:
                        sql = f"ALTER TYPE tipocontenido ADD VALUE '{value}'"
                        logger.info(f"Ejecutando: {sql}")
                        conn.execute(text(sql))
                        conn.commit()
                        logger.info(f"✅ Valor '{value}' agregado al enum")
                    except Exception as e:
                        logger.error(f"❌ Error agregando '{value}': {e}")
                        conn.rollback()
            else:
                logger.info("✅ Todos los valores necesarios están presentes")
            
            # Verificar resultado final
            result = conn.execute(text("""
                SELECT enumlabel 
                FROM pg_enum 
                WHERE enumtypid = (
                    SELECT oid 
                    FROM pg_type 
                    WHERE typname = 'tipocontenido'
                )
                ORDER BY enumsortorder
            """))
            
            final_values = [row[0] for row in result]
            logger.info(f"Valores finales del enum: {final_values}")
            
            return True
            
    except Exception as e:
        logger.error(f"❌ Error general: {e}")
        return False

if __name__ == "__main__":
    logger.info("🔧 Verificando y actualizando enum TipoContenido...")
    success = check_and_update_enum()
    
    if success:
        logger.info("🎉 Enum actualizado exitosamente")
    else:
        logger.error("❌ Error actualizando enum")
        sys.exit(1)
