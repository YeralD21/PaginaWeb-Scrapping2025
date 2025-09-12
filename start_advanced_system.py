#!/usr/bin/env python3
"""
Sistema Avanzado de Automatización de Scraping
Incluye: Backend API, Advanced Scheduler, y Frontend con monitoreo
"""

import os
import sys
import subprocess
import time
import threading
import signal
import json
from pathlib import Path
from datetime import datetime

# Configuración
BACKEND_PORT = 8000
FRONTEND_PORT = 3000

class AdvancedSystemManager:
    def __init__(self):
        self.processes = {}
        self.is_running = False
        self.log_file = Path("system_manager.log")
        
        # Configurar manejo de señales
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
    
    def log(self, message: str):
        """Log con timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] {message}"
        print(log_message)
        
        try:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(log_message + "\n")
        except:
            pass
    
    def check_requirements(self) -> bool:
        """Verificar requisitos del sistema"""
        self.log("🔍 Verificando requisitos del sistema...")
        
        # Verificar directorios
        required_dirs = ['backend', 'frontend', 'scheduler']
        for dir_name in required_dirs:
            if not Path(dir_name).exists():
                self.log(f"❌ Error: Directorio '{dir_name}' no encontrado")
                return False
        
        # Verificar archivos clave
        required_files = [
            'backend/main.py',
            'backend/scraping_service.py',
            'scheduler/advanced_scheduler.py',
            'frontend/package.json'
        ]
        
        for file_path in required_files:
            if not Path(file_path).exists():
                self.log(f"❌ Error: Archivo '{file_path}' no encontrado")
                return False
        
        # Verificar configuración
        config_file = Path("scheduler_config.json")
        if not config_file.exists():
            self.log("⚠️  Archivo de configuración no encontrado, se creará uno por defecto")
        
        self.log("✅ Todos los requisitos verificados")
        return True
    
    def start_backend(self):
        """Iniciar el backend API"""
        self.log("🚀 Iniciando Backend API...")
        backend_dir = Path("backend")
        
        try:
            process = subprocess.Popen([
                sys.executable, "-m", "uvicorn", 
                "main:app", 
                "--host", "0.0.0.0", 
                "--port", str(BACKEND_PORT),
                "--reload"
            ], cwd=backend_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            self.processes['backend'] = process
            self.log(f"✅ Backend iniciado (PID: {process.pid})")
            
            # Esperar a que el backend esté listo
            self.wait_for_backend()
            
        except Exception as e:
            self.log(f"❌ Error iniciando backend: {e}")
            raise
    
    def wait_for_backend(self, timeout: int = 30):
        """Esperar a que el backend esté disponible"""
        import requests
        
        self.log("⏳ Esperando a que el backend esté disponible...")
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                response = requests.get(f"http://localhost:{BACKEND_PORT}/", timeout=5)
                if response.status_code == 200:
                    self.log("✅ Backend disponible")
                    return True
            except:
                pass
            time.sleep(2)
        
        self.log("⚠️  Backend tardó en estar disponible, continuando...")
        return False
    
    def start_scheduler(self):
        """Iniciar el Advanced Scheduler"""
        self.log("⏰ Iniciando Advanced Scheduler...")
        scheduler_dir = Path("scheduler")
        
        try:
            process = subprocess.Popen([
                sys.executable, "advanced_scheduler.py"
            ], cwd=scheduler_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            self.processes['scheduler'] = process
            self.log(f"✅ Advanced Scheduler iniciado (PID: {process.pid})")
            
        except Exception as e:
            self.log(f"❌ Error iniciando scheduler: {e}")
            raise
    
    def start_frontend(self):
        """Iniciar el frontend"""
        self.log("🌐 Iniciando Frontend...")
        frontend_dir = Path("frontend")
        
        try:
            # Verificar si node_modules existe
            if not (frontend_dir / "node_modules").exists():
                self.log("📦 Instalando dependencias del frontend...")
                subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
            
            process = subprocess.Popen([
                "npm", "start"
            ], cwd=frontend_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            self.processes['frontend'] = process
            self.log(f"✅ Frontend iniciado (PID: {process.pid})")
            
        except Exception as e:
            self.log(f"❌ Error iniciando frontend: {e}")
            raise
    
    def monitor_processes(self):
        """Monitorear procesos en ejecución"""
        while self.is_running:
            try:
                for name, process in self.processes.items():
                    if process.poll() is not None:  # Proceso terminó
                        self.log(f"⚠️  Proceso {name} terminó inesperadamente (código: {process.returncode})")
                        
                        # Intentar reiniciar proceso crítico
                        if name in ['backend', 'scheduler']:
                            self.log(f"🔄 Intentando reiniciar {name}...")
                            self.restart_process(name)
                
                time.sleep(30)  # Verificar cada 30 segundos
                
            except Exception as e:
                self.log(f"❌ Error en monitoreo: {e}")
                time.sleep(60)
    
    def restart_process(self, process_name: str):
        """Reiniciar un proceso específico"""
        try:
            if process_name == 'backend':
                self.start_backend()
            elif process_name == 'scheduler':
                self.start_scheduler()
            elif process_name == 'frontend':
                self.start_frontend()
        except Exception as e:
            self.log(f"❌ Error reiniciando {process_name}: {e}")
    
    def show_status(self):
        """Mostrar estado del sistema"""
        self.log("📊 Estado del sistema:")
        
        # Cargar configuración
        try:
            with open("scheduler_config.json", 'r') as f:
                config = json.load(f)
            scraping_hours = config.get('scraping_hours', [])
            self.log(f"   📅 Horarios de scraping: {scraping_hours}")
        except:
            self.log("   ⚠️  No se pudo cargar configuración")
        
        # Estado de procesos
        for name, process in self.processes.items():
            status = "🟢 Ejecutándose" if process.poll() is None else "🔴 Detenido"
            self.log(f"   {name.capitalize()}: {status}")
        
        self.log(f"   🔗 Backend API: http://localhost:{BACKEND_PORT}")
        self.log(f"   🌐 Frontend: http://localhost:{FRONTEND_PORT}")
    
    def signal_handler(self, signum, frame):
        """Manejar señales del sistema"""
        self.log(f"📡 Señal recibida: {signum}")
        self.stop()
    
    def stop(self):
        """Detener todos los procesos"""
        self.log("🛑 Deteniendo sistema...")
        self.is_running = False
        
        for name, process in self.processes.items():
            try:
                if process.poll() is None:  # Proceso aún ejecutándose
                    self.log(f"🛑 Deteniendo {name}...")
                    process.terminate()
                    
                    # Esperar terminación graceful
                    try:
                        process.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        self.log(f"⚡ Forzando terminación de {name}...")
                        process.kill()
            except Exception as e:
                self.log(f"❌ Error deteniendo {name}: {e}")
        
        self.log("👋 Sistema detenido")
    
    def start(self):
        """Iniciar el sistema completo"""
        self.log("=" * 80)
        self.log("🚀 SISTEMA AVANZADO DE SCRAPING DE DIARIOS PERUANOS")
        self.log("=" * 80)
        
        # Verificar requisitos
        if not self.check_requirements():
            self.log("❌ Requisitos no cumplidos. Abortando inicio.")
            return False
        
        try:
            self.is_running = True
            
            # Iniciar servicios en orden
            self.start_backend()
            time.sleep(5)  # Esperar a que el backend se estabilice
            
            self.start_scheduler()
            time.sleep(3)  # Esperar a que el scheduler se inicie
            
            self.start_frontend()
            time.sleep(5)  # Esperar a que el frontend se inicie
            
            # Mostrar estado
            self.show_status()
            
            # Iniciar monitoreo en hilo separado
            monitor_thread = threading.Thread(target=self.monitor_processes, daemon=True)
            monitor_thread.start()
            
            self.log("✅ Sistema iniciado correctamente!")
            self.log("💡 Características del sistema:")
            self.log("   • Extracción automática en horarios configurados")
            self.log("   • Detección avanzada de duplicados")
            self.log("   • Sistema de alertas inteligente")
            self.log("   • Monitoreo y recuperación automática")
            self.log("   • Logs detallados para debugging")
            self.log("   • Configuración flexible via JSON")
            self.log("")
            self.log("🔧 Para cambiar configuración, edita: scheduler_config.json")
            self.log("📋 Para ver logs detallados, revisa: logs/scheduler_*.log")
            self.log("🛑 Presiona Ctrl+C para detener el sistema")
            
            # Mantener el programa corriendo
            while self.is_running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            self.log("⌨️  Interrupción por teclado")
        except Exception as e:
            self.log(f"💥 Error crítico: {e}")
        finally:
            self.stop()
        
        return True

def main():
    """Función principal"""
    system_manager = AdvancedSystemManager()
    
    try:
        success = system_manager.start()
        return 0 if success else 1
    except Exception as e:
        print(f"💥 Error fatal: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
