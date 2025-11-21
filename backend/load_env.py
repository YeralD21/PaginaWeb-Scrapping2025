"""
Cargador de variables de entorno desde archivo .env
Úsalo al inicio de chatbot_routes.py si quieres cargar desde archivo .env
"""

import os
from pathlib import Path

def load_env_file():
    """Carga variables de entorno desde archivo .env"""
    env_file = Path(__file__).parent / '.env'
    
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                # Ignorar comentarios y líneas vacías
                if line and not line.startswith('#'):
                    if '=' in line:
                        key, value = line.split('=', 1)
                        key = key.strip()
                        value = value.strip().strip('"').strip("'")
                        # Solo establecer si no existe ya
                        if key not in os.environ:
                            os.environ[key] = value

# Cargar automáticamente al importar
load_env_file()

