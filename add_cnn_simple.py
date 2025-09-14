#!/usr/bin/env python3
"""
Script simple para agregar CNN en Español a la base de datos
"""

import sqlite3
import os
from datetime import datetime

def add_cnn_to_database():
    """Agrega CNN en Español a la base de datos SQLite"""
    try:
        # Buscar el archivo de base de datos
        db_path = None
        for root, dirs, files in os.walk('.'):
            for file in files:
                if file.endswith('.db') or file.endswith('.sqlite'):
                    db_path = os.path.join(root, file)
                    break
            if db_path:
                break
        
        if not db_path:
            print("❌ No se encontró archivo de base de datos")
            return
        
        print(f"📁 Usando base de datos: {db_path}")
        
        # Conectar a la base de datos
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar si CNN ya existe
        cursor.execute("SELECT id FROM diarios WHERE nombre = ?", ('CNN en Español',))
        existing = cursor.fetchone()
        
        if not existing:
            # Agregar CNN en Español
            cursor.execute("""
                INSERT INTO diarios (nombre, url, activo, fecha_creacion)
                VALUES (?, ?, ?, ?)
            """, ('CNN en Español', 'https://cnnespanol.cnn.com', 1, datetime.now().isoformat()))
            
            conn.commit()
            print('✅ CNN en Español agregado a la base de datos')
        else:
            print('ℹ️ CNN en Español ya existe en la base de datos')
        
        # Verificar todos los diarios
        cursor.execute("SELECT id, nombre FROM diarios")
        diarios = cursor.fetchall()
        
        print('\n📰 Diarios en la base de datos:')
        for diario_id, nombre in diarios:
            print(f'  • {nombre} (ID: {diario_id})')
        
        conn.close()
        
    except Exception as e:
        print(f'❌ Error: {e}')

if __name__ == "__main__":
    add_cnn_to_database()
