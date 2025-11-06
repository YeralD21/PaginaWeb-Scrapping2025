#!/usr/bin/env python3
"""
Script para corregir las URLs de imágenes faltantes en las noticias
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_missing_images():
    """Actualizar URLs de imágenes que no existen"""
    
    try:
        with engine.connect() as conn:
            # Obtener todas las imágenes disponibles
            images_dir = os.path.join(os.path.dirname(__file__), "uploads", "images")
            available_images = []
            
            if os.path.exists(images_dir):
                available_images = [f for f in os.listdir(images_dir) if f.endswith(('.jpg', '.png', '.jpeg'))]
                logger.info(f"✅ Imágenes disponibles: {len(available_images)}")
                for img in available_images:
                    logger.info(f"  - {img}")
            
            if not available_images:
                logger.warning("⚠️  No hay imágenes disponibles en el directorio")
                return False
            
            # Usar la primera imagen disponible como placeholder
            placeholder_image = f"/uploads/images/{available_images[0]}"
            logger.info(f"📸 Usando como placeholder: {placeholder_image}")
            
            # Obtener posts de tipo noticia con imagen_url
            result = conn.execute(text("""
                SELECT id, titulo, imagen_url 
                FROM posts 
                WHERE tipo = 'noticia' AND imagen_url IS NOT NULL
            """))
            
            posts_to_fix = []
            for row in result:
                post_id, titulo, imagen_url = row
                # Extraer el nombre del archivo de la URL
                if imagen_url:
                    filename = imagen_url.split('/')[-1]
                    # Verificar si el archivo existe
                    file_path = os.path.join(images_dir, filename)
                    if not os.path.exists(file_path):
                        posts_to_fix.append((post_id, titulo, imagen_url, filename))
                        logger.warning(f"❌ Post ID {post_id}: Imagen no encontrada: {filename}")
            
            if not posts_to_fix:
                logger.info("✅ Todas las imágenes existen")
                return True
            
            logger.info(f"\n🔧 Encontrados {len(posts_to_fix)} posts con imágenes faltantes")
            
            # Preguntar al usuario si quiere actualizar
            logger.info(f"\n📝 ¿Quieres actualizar estos posts para usar la imagen placeholder?")
            logger.info(f"   Placeholder: {placeholder_image}")
            logger.info(f"\nSe actualizarán automáticamente...")
            
            # Actualizar los posts
            for post_id, titulo, old_url, filename in posts_to_fix:
                try:
                    conn.execute(text("""
                        UPDATE posts 
                        SET imagen_url = :new_url 
                        WHERE id = :post_id
                    """), {"new_url": placeholder_image, "post_id": post_id})
                    conn.commit()
                    logger.info(f"✅ Post ID {post_id} actualizado")
                except Exception as e:
                    logger.error(f"❌ Error actualizando post {post_id}: {e}")
                    conn.rollback()
            
            logger.info(f"\n🎉 Se actualizaron {len(posts_to_fix)} posts")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error general: {e}")
        return False

if __name__ == "__main__":
    logger.info("🔧 Iniciando corrección de imágenes faltantes...")
    success = fix_missing_images()
    
    if success:
        logger.info("🎉 Proceso completado exitosamente")
        logger.info("\n📋 Próximos pasos:")
        logger.info("   1. Refrescar el frontend (F5)")
        logger.info("   2. Ir a 'Mis Publicaciones'")
        logger.info("   3. Verificar que las imágenes ahora se muestran")
    else:
        logger.error("❌ Proceso falló")
        sys.exit(1)
