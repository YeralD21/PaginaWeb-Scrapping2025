#!/usr/bin/env python3
"""
Script para inicializar planes de suscripción por defecto.
Ejecutar después de migrate_subscriptions.py
"""

import logging
from datetime import datetime

from database import get_db
from models import SubscriptionPlan

# Asegurar que el modelo User esté registrado en la metadata para las FK
try:
    from models_ugc_enhanced import User  # noqa: F401
except ImportError:
    from models_ugc import User  # noqa: F401

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def init_default_plans():
    """Crear planes de suscripción por defecto si no existen."""
    db = next(get_db())
    
    try:
        default_plans = [
            {
                "nombre": "Plan Semanal",
                "descripcion": "Acceso premium por 7 días",
                "precio": 9.99,
                "periodo": "semanal",
                "beneficios": [
                    "Acceso a todas las noticias premium",
                    "Análisis exclusivos",
                    "Sin anuncios",
                    "Soporte prioritario"
                ],
                "es_activo": True
            },
            {
                "nombre": "Plan Mensual",
                "descripcion": "Acceso premium por 30 días - ¡Más popular!",
                "precio": 29.99,
                "periodo": "mensual",
                "beneficios": [
                    "Acceso a todas las noticias premium",
                    "Análisis exclusivos y reportes especiales",
                    "Sin anuncios",
                    "Soporte prioritario",
                    "Acceso anticipado a contenido"
                ],
                "es_activo": True
            },
            {
                "nombre": "Plan Trimestral",
                "descripcion": "Acceso premium por 90 días - ¡Ahorra 15%!",
                "precio": 79.99,
                "periodo": "mensual",  # Se calculará como 3 meses
                "beneficios": [
                    "Acceso a todas las noticias premium",
                    "Análisis exclusivos y reportes especiales",
                    "Sin anuncios",
                    "Soporte prioritario",
                    "Acceso anticipado a contenido",
                    "Descuento del 15%"
                ],
                "es_activo": True
            },
            {
                "nombre": "Plan Anual",
                "descripcion": "Acceso premium por 365 días - ¡Mejor valor!",
                "precio": 299.99,
                "periodo": "anual",
                "beneficios": [
                    "Acceso a todas las noticias premium",
                    "Análisis exclusivos y reportes especiales",
                    "Sin anuncios",
                    "Soporte prioritario 24/7",
                    "Acceso anticipado a contenido",
                    "Descuento del 30%",
                    "Contenido exclusivo adicional"
                ],
                "es_activo": True
            }
        ]
        
        created_count = 0
        updated_count = 0
        
        for plan_data in default_plans:
            existing = db.query(SubscriptionPlan).filter(
                SubscriptionPlan.nombre == plan_data["nombre"]
            ).first()
            
            if existing:
                # Actualizar plan existente
                for key, value in plan_data.items():
                    if key != "nombre":  # No actualizar el nombre
                        setattr(existing, key, value)
                updated_count += 1
                logger.info(f"🔄 Plan actualizado: {plan_data['nombre']}")
            else:
                # Crear nuevo plan
                plan = SubscriptionPlan(**plan_data)
                db.add(plan)
                created_count += 1
                logger.info(f"✅ Plan creado: {plan_data['nombre']} - ${plan_data['precio']}")
        
        db.commit()
        
        logger.info("")
        logger.info("=" * 50)
        logger.info("📊 RESUMEN DE PLANES:")
        logger.info(f"  • Planes creados: {created_count}")
        logger.info(f"  • Planes actualizados: {updated_count}")
        logger.info("=" * 50)
        
        # Mostrar todos los planes activos
        all_plans = db.query(SubscriptionPlan).filter(
            SubscriptionPlan.es_activo == True
        ).order_by(SubscriptionPlan.precio.asc()).all()
        
        logger.info("")
        logger.info("📋 PLANES DISPONIBLES:")
        for plan in all_plans:
            logger.info(f"  • {plan.nombre}: ${plan.precio} ({plan.periodo})")
        
    except Exception as e:
        logger.error(f"❌ Error inicializando planes: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logger.info("🚀 Inicializando planes de suscripción por defecto...")
    init_default_plans()
    logger.info("✅ Inicialización completada!")

