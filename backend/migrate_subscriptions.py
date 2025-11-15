#!/usr/bin/env python3
"""
Script de apoyo para agregar la columna es_premium y crear tablas de suscripciones.
Ejecutar una sola vez después de actualizar el código.
"""

import logging
from sqlalchemy import text

from database import engine
from models import Base, SubscriptionPlan, UserSubscription

# Asegurar que el modelo User esté registrado en la metadata para las FK
try:
    from models_ugc_enhanced import User  # noqa: F401
except ImportError:
    from models_ugc import User  # noqa: F401

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def add_es_premium_column():
    """Agregar columna es_premium a la tabla noticias si no existe."""
    query = text("""
        ALTER TABLE IF EXISTS noticias
        ADD COLUMN IF NOT EXISTS es_premium BOOLEAN DEFAULT FALSE;
    """)
    with engine.connect() as connection:
        logger.info("🛠️  Agregando columna es_premium a noticias (si no existe)...")
        connection.execute(query)
        connection.commit()
        logger.info("✅ Columna es_premium lista.")


def create_subscription_tables():
    """Crear tablas de suscripciones si no existen."""
    logger.info("🛠️  Creando tablas de suscripciones (si no existen)...")
    SubscriptionPlan.__table__.create(bind=engine, checkfirst=True)
    UserSubscription.__table__.create(bind=engine, checkfirst=True)
    logger.info("✅ Tablas de suscripciones listas.")


def main():
    logger.info("=== Migración de suscripciones iniciada ===")
    add_es_premium_column()
    create_subscription_tables()
    logger.info("=== Migración de suscripciones finalizada ===")


if __name__ == "__main__":
    main()

