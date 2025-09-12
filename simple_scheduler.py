#!/usr/bin/env python3
"""
Scheduler Simple que Funciona
Solo extrae noticias en horarios programados
"""

import sys
import os
import time
import schedule
import requests
from datetime import datetime
import logging

# Configurar logging simple
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/simple_scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SimpleScheduler:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        # Horarios configurados
        self.scraping_hours = [6, 9, 12, 15, 18, 21]
        
    def check_backend(self):
        """Verificar que el backend esté disponible"""
        try:
            response = requests.get(f"{self.backend_url}/", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def execute_scraping(self):
        """Ejecutar scraping via API del backend"""
        logger.info("🚀 Iniciando scraping programado...")
        
        try:
            # Verificar backend
            if not self.check_backend():
                logger.error("❌ Backend no disponible")
                return
            
            # Ejecutar scraping via endpoint del backend
            response = requests.post(f"{self.backend_url}/scraping/ejecutar", timeout=600)
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"✅ Scraping completado:")
                logger.info(f"   📊 Noticias extraídas: {result.get('total_extracted', 0)}")
                logger.info(f"   💾 Noticias guardadas: {result.get('total_saved', 0)}")
                logger.info(f"   🔍 Duplicados detectados: {result.get('duplicates_detected', 0)}")
                logger.info(f"   🚨 Alertas activadas: {result.get('alerts_triggered', 0)}")
                logger.info(f"   ⏱️  Duración: {result.get('duration_seconds', 0)} segundos")
            else:
                logger.error(f"❌ Error en scraping: {response.status_code}")
                
        except Exception as e:
            logger.error(f"💥 Error ejecutando scraping: {e}")
    
    def start(self):
        """Iniciar el scheduler"""
        logger.info("=" * 80)
        logger.info("🚀 SCHEDULER SIMPLE DE SCRAPING")
        logger.info("=" * 80)
        
        # Verificar backend inicial
        if not self.check_backend():
            logger.error("❌ Backend no disponible en http://localhost:8000")
            logger.error("   Ejecuta primero: cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000")
            return False
        
        logger.info("✅ Backend disponible")
        
        # Programar scraping en horarios específicos
        for hour in self.scraping_hours:
            schedule.every().day.at(f"{hour:02d}:00").do(self.execute_scraping)
            logger.info(f"⏰ Scraping programado a las {hour:02d}:00")
        
        # Mostrar próxima ejecución
        next_run = schedule.next_run()
        if next_run:
            logger.info(f"🕒 Próxima ejecución: {next_run.strftime('%Y-%m-%d %H:%M:%S')}")
        
        logger.info("✅ Scheduler iniciado correctamente")
        logger.info("🔄 Esperando horarios programados...")
        logger.info("🛑 Presiona Ctrl+C para detener")
        logger.info("=" * 80)
        
        # Loop principal
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Verificar cada minuto
                
        except KeyboardInterrupt:
            logger.info("⌨️  Scheduler detenido por el usuario")
            return True
        except Exception as e:
            logger.error(f"💥 Error en scheduler: {e}")
            return False

def main():
    """Función principal"""
    scheduler = SimpleScheduler()
    scheduler.start()

if __name__ == "__main__":
    main()
