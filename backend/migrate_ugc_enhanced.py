"""
Script de migración para UGC mejorado con sistema de revisión y reportes
"""

import sys
import os
from sqlalchemy.orm import Session
from datetime import datetime
import logging

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

from backend.database import engine, Base, get_db
from backend.models_ugc_enhanced import (
    User, Post, Report, Notification, SystemSettings, Ingreso,
    EstadoPublicacion, RoleEnum, TipoContenido
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_enhanced_tables():
    """Crear todas las tablas del sistema mejorado"""
    logger.info("🔧 Creando tablas UGC mejoradas...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tablas creadas exitosamente.")
    except Exception as e:
        logger.error(f"❌ Error creando tablas: {e}")
        raise

def create_system_settings(db: Session):
    """Crear configuración inicial del sistema"""
    logger.info("⚙️ Creando configuración del sistema...")
    
    settings = [
        {
            "clave": "report_threshold",
            "valor": "10",
            "descripcion": "Número de reportes necesarios para marcar una publicación como flagged"
        },
        {
            "clave": "auto_approve_enabled",
            "valor": "false",
            "descripcion": "Aprobar automáticamente publicaciones de usuarios confiables"
        },
        {
            "clave": "review_required",
            "valor": "true",
            "descripcion": "Requiere revisión de admin antes de publicar"
        }
    ]
    
    for setting_data in settings:
        existing = db.query(SystemSettings).filter(
            SystemSettings.clave == setting_data["clave"]
        ).first()
        
        if not existing:
            setting = SystemSettings(**setting_data)
            db.add(setting)
            logger.info(f"✅ Configuración creada: {setting_data['clave']} = {setting_data['valor']}")
        else:
            logger.info(f"ℹ️ Configuración ya existe: {setting_data['clave']}")
    
    db.commit()

def create_initial_users(db: Session):
    """Crear usuarios iniciales"""
    logger.info("👤 Creando usuarios iniciales...")
    
    # Verificar si ya existe el admin
    admin_user = db.query(User).filter(User.email == "admin@ugc.com").first()
    
    if not admin_user:
        admin_user = User(
            email="admin@ugc.com",
            role=RoleEnum.ADMIN
        )
        admin_user.set_password("admin123")
        db.add(admin_user)
        db.flush()
        logger.info("✅ Usuario admin creado: admin@ugc.com")
    else:
        logger.info("ℹ️ Usuario admin ya existe.")
    
    # Crear usuarios de prueba
    test_users = [
        {"email": "user1@test.com", "password": "user123"},
        {"email": "user2@test.com", "password": "user123"},
        {"email": "user3@test.com", "password": "user123"},
    ]
    
    for user_data in test_users:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing:
            user = User(email=user_data["email"], role=RoleEnum.USER)
            user.set_password(user_data["password"])
            db.add(user)
            logger.info(f"✅ Usuario creado: {user_data['email']}")
        else:
            logger.info(f"ℹ️ Usuario ya existe: {user_data['email']}")
    
    db.commit()

def create_sample_posts(db: Session):
    """Crear publicaciones de ejemplo en diferentes estados"""
    logger.info("📝 Creando publicaciones de ejemplo...")
    
    user1 = db.query(User).filter(User.email == "user1@test.com").first()
    user2 = db.query(User).filter(User.email == "user2@test.com").first()
    
    if not user1 or not user2:
        logger.warning("⚠️ No se encontraron usuarios de prueba")
        return
    
    sample_posts = [
        {
            "user": user1,
            "tipo": TipoContenido.NOTICIA,
            "titulo": "Nueva ley de educación aprobada",
            "contenido": "El congreso aprobó hoy una nueva ley que moderniza el sistema educativo...",
            "estado": EstadoPublicacion.PENDING_REVIEW
        },
        {
            "user": user1,
            "tipo": TipoContenido.NOTICIA,
            "titulo": "Descubrimiento científico revolucionario",
            "contenido": "Científicos peruanos descubren nueva especie en la Amazonía...",
            "estado": EstadoPublicacion.PUBLISHED,
            "views": 150,
            "clicks": 30
        },
        {
            "user": user2,
            "tipo": TipoContenido.POST,
            "titulo": "Opinión sobre economía nacional",
            "contenido": "La economía peruana muestra signos de recuperación tras...",
            "estado": EstadoPublicacion.PENDING_REVIEW
        },
        {
            "user": user2,
            "tipo": TipoContenido.NOTICIA,
            "titulo": "Evento deportivo importante",
            "contenido": "La selección peruana clasificó a la final del torneo...",
            "estado": EstadoPublicacion.PUBLISHED,
            "views": 500,
            "clicks": 120
        },
        {
            "user": user1,
            "tipo": TipoContenido.RESENA,
            "titulo": "Reseña de restaurante local",
            "contenido": "Excelente comida peruana en el corazón de Lima...",
            "estado": EstadoPublicacion.DRAFT
        }
    ]
    
    for post_data in sample_posts:
        # Verificar si el post ya existe (por título)
        existing = db.query(Post).filter(
            Post.titulo == post_data.get("titulo")
        ).first()
        
        if not existing:
            user = post_data.pop("user")
            post = Post(
                user_id=user.id,
                **post_data
            )
            db.add(post)
            db.flush()
            logger.info(f"✅ Post creado: {post.titulo} (estado: {post.estado.value})")
        else:
            logger.info(f"ℹ️ Post ya existe: {post_data.get('titulo')}")
    
    db.commit()

def create_sample_reports(db: Session):
    """Crear reportes de ejemplo"""
    logger.info("🚩 Creando reportes de ejemplo...")
    
    # Buscar un post published para reportar
    published_posts = db.query(Post).filter(
        Post.estado == EstadoPublicacion.PUBLISHED
    ).limit(2).all()
    
    if not published_posts:
        logger.warning("⚠️ No hay posts published para crear reportes")
        return
    
    user3 = db.query(User).filter(User.email == "user3@test.com").first()
    
    if user3 and len(published_posts) > 0:
        # Crear algunos reportes
        post_to_report = published_posts[0]
        
        try:
            from backend.models_ugc_enhanced import Report, MotivoReporte, EstadoReporte
            
            report = Report(
                post_id=post_to_report.id,
                reporter_id=user3.id,
                motivo=MotivoReporte.INFORMACION_FALSA,
                comentario="Esta información parece ser incorrecta o engañosa."
            )
            db.add(report)
            db.commit()
            logger.info(f"✅ Reporte creado para post ID {post_to_report.id}")
        except Exception as e:
            logger.error(f"❌ Error creando reporte: {e}")
            db.rollback()

def main():
    """Ejecutar migración completa"""
    logger.info("🚀 Iniciando migración UGC mejorada...")
    db = next(get_db())
    
    try:
        # 1. Crear tablas
        create_enhanced_tables()
        
        # 2. Crear configuración del sistema
        create_system_settings(db)
        
        # 3. Crear usuarios
        create_initial_users(db)
        
        # 4. Crear posts de ejemplo
        create_sample_posts(db)
        
        # 5. Crear reportes de ejemplo
        create_sample_reports(db)
        
        logger.info("🎉 Migración UGC mejorada completada exitosamente!")
        logger.info("")
        logger.info("📋 RESUMEN:")
        logger.info("  • Tablas creadas: users, posts, reports, notifications, system_settings, ingresos")
        logger.info("  • Configuración del sistema inicializada")
        logger.info("  • Usuarios de prueba creados")
        logger.info("  • Posts de ejemplo en diferentes estados")
        logger.info("")
        logger.info("🔐 CREDENCIALES:")
        logger.info("  Admin: admin@ugc.com / admin123")
        logger.info("  User1: user1@test.com / user123")
        logger.info("  User2: user2@test.com / user123")
        logger.info("  User3: user3@test.com / user123")
        logger.info("")
        logger.info("⚙️ CONFIGURACIÓN:")
        logger.info("  • Umbral de reportes: 10")
        logger.info("  • Revisión requerida: Sí")
        logger.info("")
        
    except Exception as e:
        logger.error(f"💥 La migración falló: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
