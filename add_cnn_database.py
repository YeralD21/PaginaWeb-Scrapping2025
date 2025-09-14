#!/usr/bin/env python3
"""
Script para agregar CNN en Español a la base de datos
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database import get_db
from backend.models import Diario
from datetime import datetime

def add_cnn_to_database():
    """Agrega CNN en Español a la base de datos"""
    try:
        db = next(get_db())
        
        # Verificar si ya existe
        existing = db.query(Diario).filter(Diario.nombre == 'CNN en Español').first()
        if not existing:
            cnn_diario = Diario(
                nombre='CNN en Español',
                url='https://cnnespanol.cnn.com',
                activo=True,
                fecha_creacion=datetime.utcnow()
            )
            db.add(cnn_diario)
            db.commit()
            print('✅ CNN en Español agregado a la base de datos')
        else:
            print('ℹ️ CNN en Español ya existe en la base de datos')
        
        # Verificar todos los diarios
        diarios = db.query(Diario).all()
        print('\n📰 Diarios en la base de datos:')
        for diario in diarios:
            print(f'  • {diario.nombre} (ID: {diario.id})')
            
    except Exception as e:
        print(f'❌ Error: {e}')

if __name__ == "__main__":
    add_cnn_to_database()
