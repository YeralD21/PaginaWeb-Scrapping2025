#!/usr/bin/env python3
"""
Migración para agregar campos de gestión de pagos a UserSubscription
"""

import logging
from sqlalchemy import text

from database import engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def add_payment_fields():
    """Agregar campos para gestión de pagos"""
    queries = [
        """
        ALTER TABLE user_subscriptions
        ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;
        """,
        """
        ALTER TABLE user_subscriptions
        ADD COLUMN IF NOT EXISTS fecha_pago_notificado TIMESTAMP;
        """,
        """
        ALTER TABLE user_subscriptions
        ADD COLUMN IF NOT EXISTS revisado_por INTEGER REFERENCES users(id);
        """,
        """
        ALTER TABLE user_subscriptions
        ADD COLUMN IF NOT EXISTS fecha_revision TIMESTAMP;
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
        
        logger.info("✅ Migración de campos de pago completada")


if __name__ == "__main__":
    logger.info("🚀 Iniciando migración de campos de pago...")
    add_payment_fields()
    logger.info("✅ Migración completada!")

