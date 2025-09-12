#!/usr/bin/env python3
"""
Iniciador Simplificado: Solo Backend + Scheduler
(Sin Frontend para evitar problemas con npm)
"""

import os
import sys
import subprocess
import time
import signal
from pathlib import Path
from datetime import datetime

class BackendSchedulerManager:
    def __init__(self):
        self.processes = {}
        self.is_running = False
        
        # Configurar manejo de señales
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
    
    def log(self, message: str):
        """Log con timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {message}")
    
    def start_backend(self):
        """Iniciar solo el backend"""
        self.log("🚀 Iniciando Backend API...")
        backend_dir = Path("backend")
        
        try:
            process = subprocess.Popen([
                sys.executable, "-m", "uvicorn", 
                "main:app", 
                "--host", "0.0.0.0", 
                "--port", "8000"
            ], cwd=backend_dir)
            
            self.processes['backend'] = process
            self.log(f"✅ Backend iniciado (PID: {process.pid})")
            
            # Esperar a que esté disponible
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
                response = requests.get("http://localhost:8000/", timeout=5)
                if response.status_code == 200:
                    self.log("✅ Backend disponible")
                    return True
            except:
                pass
            time.sleep(2)
        
        self.log("⚠️  Backend tardó en estar disponible, continuando...")
        return False
    
    def start_scheduler(self):
        """Iniciar el scheduler después de que el backend esté listo"""
        self.log("⏰ Iniciando Advanced Scheduler...")
        
        # Esperar un poco más para asegurar que el backend esté estable
        time.sleep(3)
        
        try:
            # Ejecutar scheduler en el directorio raíz (no en scheduler/)
            process = subprocess.Popen([
                sys.executable, "scheduler/advanced_scheduler.py"
            ])
            
            self.processes['scheduler'] = process
            self.log(f"✅ Advanced Scheduler iniciado (PID: {process.pid})")
            
        except Exception as e:
            self.log(f"❌ Error iniciando scheduler: {e}")
            raise
    
    def monitor_processes(self):
        """Monitorear procesos"""
        while self.is_running:
            try:
                for name, process in self.processes.items():
                    if process.poll() is not None:
                        self.log(f"⚠️  Proceso {name} terminó (código: {process.returncode})")
                
                time.sleep(30)
                
            except Exception as e:
                self.log(f"❌ Error en monitoreo: {e}")
                time.sleep(60)
    
    def show_status(self):
        """Mostrar estado del sistema"""
        self.log("📊 Estado del sistema:")
        for name, process in self.processes.items():
            status = "🟢 Ejecutándose" if process.poll() is None else "🔴 Detenido"
            self.log(f"   {name.capitalize()}: {status}")
        
        self.log("🔗 URLs disponibles:")
        self.log("   • Backend API: http://localhost:8000")
        self.log("   • Documentación: http://localhost:8000/docs")
        self.log("   • Ver noticias: http://localhost:8000/noticias")
    
    def signal_handler(self, signum, frame):
        """Manejar señales"""
        self.log(f"📡 Señal recibida: {signum}")
        self.stop()
    
    def stop(self):
        """Detener procesos"""
        self.log("🛑 Deteniendo sistema...")
        self.is_running = False
        
        for name, process in self.processes.items():
            try:
                if process.poll() is None:
                    self.log(f"🛑 Deteniendo {name}...")
                    process.terminate()
                    
                    try:
                        process.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        self.log(f"⚡ Forzando terminación de {name}...")
                        process.kill()
            except Exception as e:
                self.log(f"❌ Error deteniendo {name}: {e}")
        
        self.log("👋 Sistema detenido")
    
    def start(self):
        """Iniciar sistema simplificado"""
        self.log("=" * 80)
        self.log("🚀 SISTEMA SIMPLIFICADO: BACKEND + SCHEDULER")
        self.log("=" * 80)
        
        try:
            self.is_running = True
            
            # Iniciar backend
            self.start_backend()
            
            # Iniciar scheduler
            self.start_scheduler()
            
            # Mostrar estado
            time.sleep(2)
            self.show_status()
            
            self.log("✅ Sistema iniciado correctamente!")
            self.log("💡 Características activas:")
            self.log("   • Backend API funcionando")
            self.log("   • Scheduler extrayendo noticias automáticamente")
            self.log("   • Horarios: 06:00, 09:00, 12:00, 15:00, 18:00, 21:00")
            self.log("")
            self.log("🔧 Para monitorear: python monitor_system.py")
            self.log("🌐 Para ver noticias: http://localhost:8000/noticias")
            self.log("🛑 Presiona Ctrl+C para detener")
            
            # Mantener corriendo
            while self.is_running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            self.log("⌨️  Interrupción por teclado")
        except Exception as e:
            self.log(f"💥 Error crítico: {e}")
        finally:
            self.stop()

def main():
    """Función principal"""
    manager = BackendSchedulerManager()
    
    try:
        manager.start()
        return 0
    except Exception as e:
        print(f"💥 Error fatal: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
