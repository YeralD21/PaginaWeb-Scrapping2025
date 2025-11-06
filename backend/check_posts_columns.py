#!/usr/bin/env python3
"""
Script para verificar las columnas de la tabla posts
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine
from sqlalchemy import text

def check_posts_columns():
    """Verificar las columnas existentes en la tabla posts"""
    try:
        with engine.connect() as conn:
            # Obtener columnas existentes
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'posts' 
                ORDER BY column_name
            """))
            
            print("📋 Columnas existentes en la tabla 'posts':")
            print("-" * 50)
            for row in result:
                print(f"✅ {row[0]} ({row[1]}) - Nullable: {row[2]}")
            
            # Verificar columnas que faltan
            expected_columns = [
                'revisado_por', 'fecha_revision', 'motivo_rechazo', 
                'total_reportes', 'fecha_flagged', 'verificado_como_fake', 
                'fecha_verificacion_fake'
            ]
            
            existing_columns = [row[0] for row in conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'posts'
            """))]
            
            print("\n❌ Columnas que faltan:")
            print("-" * 30)
            missing_columns = []
            for col in expected_columns:
                if col not in existing_columns:
                    print(f"❌ {col}")
                    missing_columns.append(col)
                else:
                    print(f"✅ {col}")
            
            if missing_columns:
                print(f"\n🔧 Se necesitan agregar {len(missing_columns)} columnas")
                return missing_columns
            else:
                print("\n✅ Todas las columnas necesarias están presentes")
                return []
                
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    missing = check_posts_columns()
    if missing:
        print(f"\n📝 Columnas faltantes: {missing}")
    else:
        print("\n🎉 Base de datos está actualizada")
