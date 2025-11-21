"""
Script de migración para agregar la columna video_url a la tabla noticias
"""
import sys
import os

# Agregar el directorio backend al path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database import engine
from sqlalchemy import text

def migrate():
    """Agregar columna video_url a la tabla noticias"""
    try:
        print("🔄 Iniciando migración: agregando columna video_url...")
        
        with engine.connect() as conn:
            # Verificar si la columna ya existe
            check_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'noticias' AND column_name = 'video_url'
            """)
            result = conn.execute(check_query).fetchone()
            
            if result:
                print("ℹ️  La columna video_url ya existe en la tabla noticias")
                return
            
            # Agregar la columna
            alter_query = text('ALTER TABLE noticias ADD COLUMN video_url VARCHAR(1000)')
            conn.execute(alter_query)
            conn.commit()
            
        print("✅ Columna video_url agregada exitosamente a la tabla noticias")
        print("✅ Migración completada")
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        print(f"   Tipo de error: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    migrate()

