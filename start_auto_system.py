#!/usr/bin/env python3
"""
Script para iniciar el sistema completo de scraping automático
Incluye: Backend API, Scheduler automático, y Frontend
"""

import os
import sys
import subprocess
import time
import threading
import signal
from pathlib import Path

# Configuración
BACKEND_PORT = 8000
FRONTEND_PORT = 3000
SCHEDULE_INTERVAL_MINUTES = 5  # Cambiar este valor para ajustar la frecuencia (5 minutos)

def start_backend():
    """Iniciar el backend API"""
    print("🚀 Iniciando Backend API...")
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Error: Directorio 'backend' no encontrado")
        return
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", str(BACKEND_PORT),
            "--reload"
        ], cwd=backend_dir, check=True)
    except KeyboardInterrupt:
        print("Backend detenido")
    except Exception as e:
        print(f"Error iniciando backend: {e}")

def start_scheduler():
    """Iniciar el scheduler automático"""
    print("⏰ Iniciando Scheduler Automático...")
    os.environ['SCHEDULE_INTERVAL_MINUTES'] = str(SCHEDULE_INTERVAL_MINUTES)
    
    scheduler_dir = Path("scheduler")
    if not scheduler_dir.exists():
        print("❌ Error: Directorio 'scheduler' no encontrado")
        return
    
    try:
        subprocess.run([sys.executable, "cron_job.py"], cwd=scheduler_dir, check=True)
    except KeyboardInterrupt:
        print("Scheduler detenido")
    except Exception as e:
        print(f"Error iniciando scheduler: {e}")

def start_frontend():
    """Iniciar el frontend"""
    print("🌐 Iniciando Frontend...")
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Error: Directorio 'frontend' no encontrado")
        return
    
    try:
        subprocess.run(["npm", "start"], cwd=frontend_dir, check=True)
    except KeyboardInterrupt:
        print("Frontend detenido")
    except Exception as e:
        print(f"Error iniciando frontend: {e}")

def signal_handler(sig, frame):
    """Manejar señales de interrupción"""
    print("\n🛑 Deteniendo sistema...")
    sys.exit(0)

def main():
    """Función principal"""
    print("=" * 60)
    print("📰 SISTEMA DE SCRAPING AUTOMÁTICO DE DIARIOS PERUANOS")
    print("=" * 60)
    print(f"⏱️  Frecuencia de actualización: {SCHEDULE_INTERVAL_MINUTES} minutos")
    print(f"🔗 Backend API: http://localhost:{BACKEND_PORT}")
    print(f"🌐 Frontend: http://localhost:{FRONTEND_PORT}")
    print("=" * 60)
    
    # Configurar manejo de señales
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Verificar que estamos en el directorio correcto
    if not Path("backend").exists() or not Path("frontend").exists():
        print("❌ Error: Ejecutar desde el directorio raíz del proyecto")
        sys.exit(1)
    
    # Crear threads para cada servicio
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    scheduler_thread = threading.Thread(target=start_scheduler, daemon=True)
    frontend_thread = threading.Thread(target=start_frontend, daemon=True)
    
    try:
        # Iniciar servicios
        backend_thread.start()
        time.sleep(3)  # Esperar a que el backend se inicie
        
        scheduler_thread.start()
        time.sleep(2)  # Esperar a que el scheduler se inicie
        
        frontend_thread.start()
        
        print("\n✅ Sistema iniciado correctamente!")
        print("📋 Servicios activos:")
        print(f"   • Backend API (Puerto {BACKEND_PORT})")
        print(f"   • Scheduler Automático (Cada {SCHEDULE_INTERVAL_MINUTES} min)")
        print(f"   • Frontend React (Puerto {FRONTEND_PORT})")
        print("\n💡 El sistema ahora:")
        print("   • Extrae noticias automáticamente cada 15 minutos")
        print("   • Detecta solo noticias nuevas (sin duplicados)")
        print("   • Actualiza la base de datos con timestamps")
        print("   • Muestra noticias recientes en el frontend")
        print("\n🔄 Para cambiar la frecuencia, modifica SCHEDULE_INTERVAL_MINUTES")
        print("🛑 Presiona Ctrl+C para detener el sistema")
        
        # Mantener el programa corriendo
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Deteniendo sistema...")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        print("👋 Sistema detenido")

if __name__ == "__main__":
    main()
