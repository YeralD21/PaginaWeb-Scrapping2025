#!/usr/bin/env python3
"""
Agregar columna premium_score a noticias.
Ejecutar una sola vez después de actualizar el código.
"""

import logging
from sqlalchemy import text

from database import engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def add_premium_score_column():
    query = text("""
        ALTER TABLE IF EXISTS noticias
        ADD COLUMN IF NOT EXISTS premium_score FLOAT DEFAULT 0;
    """)
    with engine.connect() as connection:
        logger.info("🛠️  Agregando columna premium_score a noticias (si no existe)...")
        connection.execute(query)
        connection.commit()
        logger.info("✅ Columna premium_score lista.")


def main():
    logger.info("=== Migración premium_score iniciada ===")
    add_premium_score_column()
    logger.info("=== Migración premium_score finalizada ===")


if __name__ == "__main__":
    main()

