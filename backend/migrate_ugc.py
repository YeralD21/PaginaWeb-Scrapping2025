#!/usr/bin/env python3
"""
Script de migración automática para sistema UGC
Crea todas las tablas y datos iniciales en PostgreSQL
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db, create_tables
from models_ugc import User, Post, Ingreso, RoleEnum, TipoContenido
from sqlalchemy.orm import Session
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_admin_user(db: Session):
    """Crear usuario administrador"""
    admin = db.query(User).filter(User.email == "admin@ugc.com").first()
    
    if not admin:
        admin = User(
            email="admin@ugc.com",
            role=RoleEnum.ADMIN
        )
        admin.set_password("admin123")  # ⚠️ CAMBIAR EN PRODUCCIÓN
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        logger.info(f"✅ Usuario admin creado: {admin.email} (password: admin123)")
    else:
        logger.info(f"ℹ️  Usuario admin ya existe: {admin.email}")
    
    return admin

def create_sample_users(db: Session):
    """Crear usuarios de ejemplo"""
    sample_users = [
        {"email": "user1@test.com", "password": "user123"},
        {"email": "user2@test.com", "password": "user123"},
        {"email": "user3@test.com", "password": "user123"},
    ]
    
    created_users = []
    
    for user_data in sample_users:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        
        if not existing:
            new_user = User(
                email=user_data["email"],
                role=RoleEnum.USER
            )
            new_user.set_password(user_data["password"])
            
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            created_users.append(new_user)
            logger.info(f"✅ Usuario creado: {new_user.email}")
        else:
            created_users.append(existing)
            logger.info(f"ℹ️  Usuario ya existe: {existing.email}")
    
    return created_users

def create_sample_posts(db: Session, users: list):
    """Crear posts de ejemplo"""
    sample_posts = [
        {
            "user": users[0],
            "tipo": TipoContenido.TEXTO,
            "contenido": "¡Hola mundo! Este es mi primer post en la plataforma UGC. Estoy muy emocionado de compartir contenido con todos."
        },
        {
            "user": users[0],
            "tipo": TipoContenido.IMAGEN,
            "contenido": "https://picsum.photos/800/600?random=1"
        },
        {
            "user": users[1],
            "tipo": TipoContenido.VIDEO,
            "contenido": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
            "user": users[1],
            "tipo": TipoContenido.RESENA,
            "contenido": "Excelente plataforma para compartir contenido. La interfaz es muy intuitiva y el sistema de ganancias es justo. ⭐⭐⭐⭐⭐"
        },
        {
            "user": users[2],
            "tipo": TipoContenido.POST,
            "contenido": "Análisis completo: Las mejores prácticas para crear contenido viral en plataformas UGC. 1) Consistencia 2) Calidad 3) Engagement..."
        },
    ]
    
    created_posts = []
    
    for post_data in sample_posts:
        new_post = Post(
            user_id=post_data["user"].id,
            tipo=post_data["tipo"],
            contenido=post_data["contenido"],
            views=0,
            clicks=0,
            interacciones=0
        )
        
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        
        created_posts.append(new_post)
        logger.info(f"✅ Post creado: ID {new_post.id} por {post_data['user'].email}")
    
    return created_posts

def main():
    """Función principal de migración"""
    print("🚀 MIGRACIÓN DEL SISTEMA UGC")
    print("=" * 60)
    
    try:
        # Paso 1: Crear tablas
        logger.info("📋 Creando tablas en PostgreSQL...")
        create_tables()
        logger.info("✅ Tablas creadas exitosamente")
        
        # Paso 2: Obtener sesión de BD
        db = next(get_db())
        
        # Paso 3: Crear admin
        logger.info("\n👤 Creando usuario administrador...")
        admin = create_admin_user(db)
        
        # Paso 4: Crear usuarios de ejemplo
        logger.info("\n👥 Creando usuarios de ejemplo...")
        users = create_sample_users(db)
        
        # Paso 5: Crear posts de ejemplo
        logger.info("\n📝 Creando posts de ejemplo...")
        posts = create_sample_posts(db, users)
        
        # Cerrar sesión
        db.close()
        
        print("\n" + "=" * 60)
        print("🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!")
        print("=" * 60)
        
        print("\n📋 USUARIOS CREADOS:")
        print(f"   • admin@ugc.com (password: admin123) - ROL: ADMIN")
        print(f"   • user1@test.com (password: user123) - ROL: USER")
        print(f"   • user2@test.com (password: user123) - ROL: USER")
        print(f"   • user3@test.com (password: user123) - ROL: USER")
        
        print("\n📝 POSTS CREADOS:")
        print(f"   • {len(posts)} posts de ejemplo")
        
        print("\n🔐 ROLES DISPONIBLES:")
        print("   • admin - Acceso completo al sistema y dashboard")
        print("   • user - Crear publicaciones y ver ganancias")
        
        print("\n🚀 PRÓXIMOS PASOS:")
        print("   1. Iniciar el backend: cd backend && python ugc_api.py")
        print("   2. Iniciar el frontend: cd frontend && npm start")
        print("   3. Acceder a http://localhost:8001/docs para ver la API")
        print("   4. Login con admin@ugc.com / admin123")
        
        print("\n⚠️  IMPORTANTE:")
        print("   • Cambiar las contraseñas por defecto en producción")
        print("   • Configurar JWT_SECRET_KEY en variables de entorno")
        print("   • El admin puede ver dashboard en /admin/dashboard")
        
        print("\n💰 SISTEMA DE INGRESOS:")
        print("   • Cada interacción genera $0.01 USD")
        print("   • 70% para admin (dueño de la plataforma)")
        print("   • 30% para el creador del contenido")
        print("   • Simular interacciones: POST /admin/simulate-interactions/{post_id}")
        
    except Exception as e:
        print(f"\n💥 ERROR EN LA MIGRACIÓN: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

