#!/usr/bin/env python3
"""
Migración para agregar campos de cancelación a UserSubscription
"""

import logging
from sqlalchemy import text

from database import engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def add_cancellation_fields():
    """Agregar campos para cancelación de suscripciones"""
    queries = [
        """
        ALTER TABLE user_subscriptions
        ADD COLUMN IF NOT EXISTS motivo_cancelacion TEXT;
        """,
        """
        ALTER TABLE user_subscriptions
        ADD COLUMN IF NOT EXISTS fecha_cancelacion TIMESTAMP;
        """,
        """
        ALTER TABLE user_subscriptions
        ADD COLUMN IF NOT EXISTS cancelado_por INTEGER REFERENCES users(id);
        """
    ]
    
    with engine.connect() as connection:
        for query in queries:
            try:
                logger.info(f"Ejecutando: {query[:50]}...")
                connection.execute(text(query))
                connection.commit()
                logger.info("✅ Campo agregado correctamente")
            except Exception as e:
                logger.warning(f"⚠️ Campo posiblemente ya existe: {e}")
                connection.rollback()
        
        logger.info("✅ Migración de campos de cancelación completada")


if __name__ == "__main__":
    logger.info("🚀 Iniciando migración de campos de cancelación...")
    add_cancellation_fields()
    logger.info("✅ Migración completada!")

