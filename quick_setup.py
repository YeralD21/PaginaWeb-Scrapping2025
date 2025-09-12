#!/usr/bin/env python3
"""
Instalación Rápida del Sistema de Automatización
Este script configura automáticamente el sistema para funcionar de inmediato
"""

import os
import json
import sys
from pathlib import Path
from datetime import datetime

def create_default_config():
    """Crear configuración por defecto optimizada"""
    config = {
        "scraping_hours": [6, 9, 12, 15, 18, 21],
        "timezone": "America/Lima",
        "max_retries": 3,
        "retry_delay_minutes": 5,
        "log_level": "INFO",
        "log_rotation": True,
        "max_log_files": 7,
        "health_check_interval": 300,
        "enable_notifications": True,
        "database_timeout": 30,
        "scraping_timeout": 600,
        "cleanup_old_logs_days": 30,
        "emergency_stop_after_failures": 10,
        "run_initial_scraping": False,
        "created_by": "quick_setup.py",
        "created_at": datetime.now().isoformat(),
        "description": "Configuración automática - Sistema optimizado para extracción cada 3 horas"
    }
    
    config_file = Path("scheduler_config.json")
    with open(config_file, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Configuración creada: {config_file}")
    return config

def create_directories():
    """Crear directorios necesarios"""
    dirs = ["logs", "reports"]
    
    for dir_name in dirs:
        dir_path = Path(dir_name)
        dir_path.mkdir(exist_ok=True)
        print(f"📁 Directorio creado: {dir_path}")

def check_requirements():
    """Verificar requisitos básicos"""
    print("🔍 Verificando requisitos...")
    
    # Verificar Python
    if sys.version_info < (3, 8):
        print("❌ Se requiere Python 3.8 o superior")
        return False
    
    # Verificar directorios del proyecto
    required_dirs = ["backend", "frontend", "scheduler", "scraping"]
    for dir_name in required_dirs:
        if not Path(dir_name).exists():
            print(f"❌ Directorio requerido no encontrado: {dir_name}")
            return False
    
    # Verificar archivos clave
    key_files = [
        "backend/main.py",
        "backend/scraping_service.py",
        "frontend/package.json",
        "scraping/main_scraper.py"
    ]
    
    for file_path in key_files:
        if not Path(file_path).exists():
            print(f"❌ Archivo requerido no encontrado: {file_path}")
            return False
    
    print("✅ Todos los requisitos verificados")
    return True

def create_startup_script():
    """Crear script de inicio rápido"""
    script_content = """#!/bin/bash
# Script de inicio rápido del sistema automatizado

echo "🚀 Iniciando Sistema de Scraping Automatizado..."

# Activar entorno virtual si existe
if [ -d "venv" ]; then
    echo "📦 Activando entorno virtual..."
    source venv/Scripts/activate 2>/dev/null || source venv/bin/activate
fi

# Iniciar sistema
echo "🔄 Iniciando sistema completo..."
python start_advanced_system.py

echo "👋 Sistema detenido"
"""
    
    script_path = Path("start_quick.sh")
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    # Hacer ejecutable en sistemas Unix
    try:
        os.chmod(script_path, 0o755)
    except:
        pass
    
    print(f"📜 Script de inicio creado: {script_path}")

def create_windows_batch():
    """Crear archivo batch para Windows"""
    batch_content = """@echo off
echo 🚀 Iniciando Sistema de Scraping Automatizado...

REM Activar entorno virtual si existe
if exist venv\\Scripts\\activate.bat (
    echo 📦 Activando entorno virtual...
    call venv\\Scripts\\activate.bat
)

REM Iniciar sistema
echo 🔄 Iniciando sistema completo...
python start_advanced_system.py

echo 👋 Sistema detenido
pause
"""
    
    batch_path = Path("start_quick.bat")
    with open(batch_path, 'w', encoding='utf-8') as f:
        f.write(batch_content)
    
    print(f"📜 Script de inicio para Windows creado: {batch_path}")

def show_next_steps(config):
    """Mostrar próximos pasos"""
    print("\n" + "=" * 80)
    print("🎉 ¡CONFIGURACIÓN COMPLETADA!")
    print("=" * 80)
    
    print("\n📋 CONFIGURACIÓN APLICADA:")
    hours = config.get('scraping_hours', [])
    hours_str = ", ".join([f"{h:02d}:00" for h in sorted(hours)])
    print(f"   ⏰ Horarios de scraping: {hours_str}")
    print(f"   🔄 Reintentos máximos: {config.get('max_retries', 3)}")
    print(f"   📝 Nivel de logging: {config.get('log_level', 'INFO')}")
    print(f"   🚨 Parada de emergencia tras: {config.get('emergency_stop_after_failures', 10)} fallos")
    
    print("\n🚀 PRÓXIMOS PASOS:")
    print("   1. Iniciar el sistema:")
    print("      python start_advanced_system.py")
    print("      # O usar: ./start_quick.sh (Linux/Mac) o start_quick.bat (Windows)")
    print("")
    print("   2. Monitorear el sistema:")
    print("      python monitor_system.py")
    print("")
    print("   3. Personalizar configuración (opcional):")
    print("      python configure_scheduler.py")
    
    print("\n🌐 URLs DEL SISTEMA:")
    print("   • Backend API: http://localhost:8000")
    print("   • Frontend Web: http://localhost:3000")
    print("   • Documentación API: http://localhost:8000/docs")
    
    print("\n💡 CARACTERÍSTICAS ACTIVADAS:")
    print("   ✅ Scraping automático cada 3 horas")
    print("   ✅ Detección avanzada de duplicados")
    print("   ✅ Sistema de alertas inteligente")
    print("   ✅ Reintentos automáticos en caso de fallo")
    print("   ✅ Logging detallado para debugging")
    print("   ✅ Monitoreo de recursos del sistema")
    print("   ✅ Recuperación automática de errores")
    
    print("\n📚 DOCUMENTACIÓN:")
    print("   • Guía completa: README_AUTOMATIZACION.md")
    print("   • Logs del sistema: logs/")
    print("   • Reportes: reports/")
    
    print("\n🔧 PERSONALIZACIÓN:")
    print("   • Cambiar horarios: Edita scheduler_config.json")
    print("   • Configuración interactiva: python configure_scheduler.py")
    print("   • Monitoreo continuo: python monitor_system.py --continuous 10")
    
    print("=" * 80)
    print("🎯 ¡Tu sistema está listo para funcionar 24/7 automáticamente!")
    print("=" * 80)

def main():
    """Función principal de instalación"""
    print("🔧 INSTALACIÓN RÁPIDA DEL SISTEMA DE AUTOMATIZACIÓN")
    print("=" * 60)
    print("Este script configurará automáticamente tu sistema de scraping")
    print("para que funcione de forma completamente automática.")
    print("=" * 60)
    
    # Verificar requisitos
    if not check_requirements():
        print("\n❌ No se pueden cumplir todos los requisitos.")
        print("Verifica que tengas todos los archivos del proyecto.")
        return 1
    
    # Crear directorios
    print("\n📁 Creando directorios...")
    create_directories()
    
    # Crear configuración
    print("\n⚙️ Creando configuración optimizada...")
    config = create_default_config()
    
    # Crear scripts de inicio
    print("\n📜 Creando scripts de inicio...")
    create_startup_script()
    create_windows_batch()
    
    # Mostrar próximos pasos
    show_next_steps(config)
    
    return 0

if __name__ == "__main__":
    try:
        exit(main())
    except KeyboardInterrupt:
        print("\n❌ Instalación cancelada por el usuario")
        exit(1)
    except Exception as e:
        print(f"\n💥 Error durante la instalación: {e}")
        exit(1)
