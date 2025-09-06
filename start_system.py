#!/usr/bin/env python3
import os
import sys
import subprocess
import time
import signal
from pathlib import Path

class SystemStarter:
    def __init__(self):
        self.processes = []
        self.project_root = Path(__file__).parent
        
    def check_requirements(self):
        print(" Verificando requisitos...")
        
        if sys.version_info < (3, 8):
            print(" Se requiere Python 3.8 o superior")
            return False
        
        try:
            subprocess.run(['node', '--version'], capture_output=True, text=True)
        except FileNotFoundError:
            print(" Node.js no está instalado")
            return False
        
        print(" Todos los requisitos están instalados")
        return True
    
    def check_env_file(self):
        env_file = self.project_root / '.env'
        if not env_file.exists():
            print(" Archivo .env no encontrado")
            print(" Copia .env.example a .env y configura las variables")
            return False
        
        print(" Archivo .env encontrado")
        return True
    
    def start_backend(self):
        print(" Iniciando backend...")
        
        backend_dir = self.project_root / 'backend'
        process = subprocess.Popen(
            [sys.executable, 'main.py'],
            cwd=backend_dir
        )
        
        self.processes.append(('Backend', process))
        print(" Backend iniciado en http://localhost:8000")
        time.sleep(3)
    
    def start_frontend(self):
        print(" Iniciando frontend...")
        
        frontend_dir = self.project_root / 'frontend'
        process = subprocess.Popen(
            ['npm', 'start'],
            cwd=frontend_dir
        )
        
        self.processes.append(('Frontend', process))
        print(" Frontend iniciado en http://localhost:3000")
    
    def monitor_processes(self):
        print("\n Sistema iniciado correctamente!")
        print(" Frontend: http://localhost:3000")
        print(" Backend API: http://localhost:8000")
        print(" API Docs: http://localhost:8000/docs")
        print("\nPresiona Ctrl+C para detener todos los servicios")
        
        try:
            while True:
                time.sleep(1)
                for name, process in self.processes:
                    if process.poll() is not None:
                        print(f" {name} se detuvo inesperadamente")
                        return
                        
        except KeyboardInterrupt:
            print("\n Deteniendo sistema...")
            self.stop_all_processes()
    
    def stop_all_processes(self):
        for name, process in self.processes:
            print(f" Deteniendo {name}...")
            try:
                process.terminate()
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
            except Exception as e:
                print(f" Error deteniendo {name}: {e}")
        
        print(" Todos los servicios detenidos")
    
    def run(self):
        print(" Iniciando Sistema de Scraping de Diarios Peruanos")
        print("=" * 60)
        
        if not self.check_requirements():
            return
        
        if not self.check_env_file():
            return
        
        self.start_backend()
        self.start_frontend()
        self.monitor_processes()

def main():
    starter = SystemStarter()
    
    def signal_handler(sig, frame):
        print("\n Recibida señal de interrupción...")
        starter.stop_all_processes()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        starter.run()
    except Exception as e:
        print(f" Error inesperado: {e}")
        starter.stop_all_processes()
        sys.exit(1)

if __name__ == "__main__":
    main()
