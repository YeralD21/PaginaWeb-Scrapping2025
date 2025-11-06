"""
Script para agregar columnas faltantes a la tabla users existente
"""

import sys
import os
from sqlalchemy import text, inspect

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_column_exists(table_name, column_name):
    """Verificar si una columna existe en una tabla"""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns

def add_missing_columns():
    """Agregar columnas faltantes a la tabla users"""
    
    with engine.connect() as conn:
        # Verificar y agregar columnas una por una
        columns_to_add = [
            ("suspendido", "ALTER TABLE users ADD COLUMN suspendido BOOLEAN DEFAULT FALSE"),
            ("motivo_suspension", "ALTER TABLE users ADD COLUMN motivo_suspension TEXT"),
            ("fecha_suspension", "ALTER TABLE users ADD COLUMN fecha_suspension TIMESTAMP"),
            ("suspendido_por", "ALTER TABLE users ADD COLUMN suspendido_por INTEGER REFERENCES users(id)")
        ]
        
        for column_name, sql in columns_to_add:
            try:
                if not check_column_exists('users', column_name):
                    conn.execute(text(sql))
                    conn.commit()
                    logger.info(f"✅ Columna '{column_name}' agregada a tabla 'users'")
                else:
                    logger.info(f"ℹ️  Columna '{column_name}' ya existe")
            except Exception as e:
                logger.warning(f"⚠️  Error agregando '{column_name}': {e}")
                conn.rollback()
        
        # Agregar columnas a posts
        posts_columns = [
            ("estado", "ALTER TABLE posts ADD COLUMN estado VARCHAR(50) DEFAULT 'published'"),
            ("titulo", "ALTER TABLE posts ADD COLUMN titulo VARCHAR(255)"),
            ("descripcion", "ALTER TABLE posts ADD COLUMN descripcion TEXT"),
            ("imagen_url", "ALTER TABLE posts ADD COLUMN imagen_url VARCHAR(500)"),
            ("fuente", "ALTER TABLE posts ADD COLUMN fuente VARCHAR(255)"),
            ("total_reportes", "ALTER TABLE posts ADD COLUMN total_reportes INTEGER DEFAULT 0"),
            ("updated_at", "ALTER TABLE posts ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
            ("revisado_por", "ALTER TABLE posts ADD COLUMN revisado_por INTEGER REFERENCES users(id)"),
            ("fecha_revision", "ALTER TABLE posts ADD COLUMN fecha_revision TIMESTAMP"),
            ("motivo_rechazo", "ALTER TABLE posts ADD COLUMN motivo_rechazo TEXT"),
            ("fecha_flagged", "ALTER TABLE posts ADD COLUMN fecha_flagged TIMESTAMP"),
            ("verificado_como_fake", "ALTER TABLE posts ADD COLUMN verificado_como_fake BOOLEAN DEFAULT FALSE"),
            ("fecha_verificacion_fake", "ALTER TABLE posts ADD COLUMN fecha_verificacion_fake TIMESTAMP")
        ]
        
        for column_name, sql in posts_columns:
            try:
                if not check_column_exists('posts', column_name):
                    conn.execute(text(sql))
                    conn.commit()
                    logger.info(f"✅ Columna '{column_name}' agregada a tabla 'posts'")
                else:
                    logger.info(f"ℹ️  Columna '{column_name}' ya existe en posts")
            except Exception as e:
                logger.warning(f"⚠️  Error agregando '{column_name}' a posts: {e}")
                conn.rollback()
        
        # Crear tabla reports
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS reports (
                    id SERIAL PRIMARY KEY,
                    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    motivo VARCHAR(50) NOT NULL,
                    comentario TEXT NOT NULL,
                    estado VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(post_id, reporter_id)
                )
            """))
            conn.commit()
            logger.info("✅ Tabla 'reports' creada/verificada")
        except Exception as e:
            logger.warning(f"⚠️  Tabla 'reports': {e}")
            conn.rollback()
        
        # Crear tabla notifications
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    titulo VARCHAR(255) NOT NULL,
                    mensaje TEXT NOT NULL,
                    tipo VARCHAR(50) NOT NULL,
                    leida BOOLEAN DEFAULT FALSE,
                    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            logger.info("✅ Tabla 'notifications' creada/verificada")
        except Exception as e:
            logger.warning(f"⚠️  Tabla 'notifications': {e}")
            conn.rollback()
        
        # Crear tabla system_settings
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS system_settings (
                    id SERIAL PRIMARY KEY,
                    setting_name VARCHAR(100) UNIQUE NOT NULL,
                    setting_value TEXT NOT NULL,
                    description TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_by INTEGER REFERENCES users(id)
                )
            """))
            conn.commit()
            logger.info("✅ Tabla 'system_settings' creada/verificada")
            
            # Insertar configuración inicial
            conn.execute(text("""
                INSERT INTO system_settings (setting_name, setting_value, description)
                VALUES ('report_threshold', '10', 'Número de reportes necesarios para marcar un post como flagged')
                ON CONFLICT (setting_name) DO NOTHING
            """))
            conn.commit()
            logger.info("✅ Configuración inicial insertada")
        except Exception as e:
            logger.warning(f"⚠️  Tabla 'system_settings': {e}")
            conn.rollback()
        
        logger.info("✅ Migración completada exitosamente")

if __name__ == "__main__":
    logger.info("🚀 Iniciando migración de base de datos...")
    try:
        add_missing_columns()
        logger.info("🎉 ¡Migración exitosa! Ahora puedes reiniciar el backend.")
    except Exception as e:
        logger.error(f"❌ Error en la migración: {e}")
        sys.exit(1)

