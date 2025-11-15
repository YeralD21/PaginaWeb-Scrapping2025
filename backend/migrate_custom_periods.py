"""
Migración para agregar campos de período personalizado a SubscriptionPlan
"""
from sqlalchemy import text
from database import SessionLocal, engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_custom_periods():
    """Agregar campos periodo_tipo y periodo_cantidad a subscription_plans"""
    db = SessionLocal()
    try:
        logger.info("🔄 Iniciando migración de períodos personalizados...")
        
        # Verificar si las columnas ya existen
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='subscription_plans' 
                AND column_name IN ('periodo_tipo', 'periodo_cantidad')
            """))
            existing_columns = [row[0] for row in result]
            
            if 'periodo_tipo' not in existing_columns:
                logger.info("➕ Agregando columna periodo_tipo...")
                conn.execute(text("""
                    ALTER TABLE subscription_plans 
                    ADD COLUMN periodo_tipo VARCHAR(20)
                """))
                conn.commit()
                logger.info("✅ Columna periodo_tipo agregada")
            else:
                logger.info("ℹ️  Columna periodo_tipo ya existe")
            
            if 'periodo_cantidad' not in existing_columns:
                logger.info("➕ Agregando columna periodo_cantidad...")
                conn.execute(text("""
                    ALTER TABLE subscription_plans 
                    ADD COLUMN periodo_cantidad INTEGER
                """))
                conn.commit()
                logger.info("✅ Columna periodo_cantidad agregada")
            else:
                logger.info("ℹ️  Columna periodo_cantidad ya existe")
        
        logger.info("✅ Migración completada exitosamente")
        
    except Exception as e:
        logger.error(f"❌ Error en migración: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate_custom_periods()

