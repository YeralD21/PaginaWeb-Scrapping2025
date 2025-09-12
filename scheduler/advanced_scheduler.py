#!/usr/bin/env python3
"""
Sistema de Scheduler Avanzado para Scraping Automático
Características:
- Programación por horarios específicos
- Manejo robusto de errores
- Logging detallado
- Recuperación automática
- Monitoreo de estado
- Configuración flexible
"""

import sys
import os
import time
import logging
import json
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pathlib import Path
import schedule
import signal

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.scraping_service import ScrapingService
from backend.database import get_db, test_connection
from backend.models import EstadisticaScraping

class AdvancedScheduler:
    def __init__(self, config_file: str = "scheduler_config.json"):
        self.config_file = Path(config_file)
        self.config = self.load_config()
        self.scraping_service = ScrapingService()
        self.is_running = False
        self.last_execution = None
        self.execution_count = 0
        self.failed_attempts = 0
        self.max_retries = self.config.get('max_retries', 3)
        
        # Configurar logging avanzado
        self.setup_logging()
        
        # Configurar manejo de señales
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        self.logger.info("🚀 Advanced Scheduler inicializado")
        self.logger.info(f"📋 Configuración cargada: {self.config}")
    
    def load_config(self) -> Dict:
        """Cargar configuración desde archivo JSON"""
        default_config = {
            "scraping_hours": [6, 9, 12, 15, 18, 21],  # Horarios específicos
            "timezone": "America/Lima",
            "max_retries": 3,
            "retry_delay_minutes": 5,
            "log_level": "INFO",
            "log_rotation": True,
            "max_log_files": 7,
            "health_check_interval": 300,  # 5 minutos
            "enable_notifications": True,
            "database_timeout": 30,
            "scraping_timeout": 600,  # 10 minutos
            "cleanup_old_logs_days": 30,
            "emergency_stop_after_failures": 10
        }
        
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                default_config.update(user_config)
                return default_config
            except Exception as e:
                print(f"⚠️  Error cargando configuración: {e}. Usando configuración por defecto.")
                return default_config
        else:
            # Crear archivo de configuración por defecto
            self.save_config(default_config)
            return default_config
    
    def save_config(self, config: Dict):
        """Guardar configuración a archivo"""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"❌ Error guardando configuración: {e}")
    
    def setup_logging(self):
        """Configurar sistema de logging avanzado"""
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        # Configurar logger principal
        self.logger = logging.getLogger("AdvancedScheduler")
        self.logger.setLevel(getattr(logging, self.config.get('log_level', 'INFO')))
        
        # Limpiar handlers existentes
        self.logger.handlers.clear()
        
        # Handler para archivo con rotación
        log_file = log_dir / f"scheduler_{datetime.now().strftime('%Y%m%d')}.log"
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)
        
        # Handler para consola
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # Formato detallado
        formatter = logging.Formatter(
            '%(asctime)s | %(levelname)-8s | %(name)s | %(funcName)s:%(lineno)d | %(message)s'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
        
        # Cleanup de logs antiguos
        self.cleanup_old_logs()
    
    def cleanup_old_logs(self):
        """Limpiar logs antiguos"""
        try:
            log_dir = Path("logs")
            if not log_dir.exists():
                return
            
            cutoff_date = datetime.now() - timedelta(days=self.config.get('cleanup_old_logs_days', 30))
            
            for log_file in log_dir.glob("scheduler_*.log"):
                try:
                    file_date = datetime.fromtimestamp(log_file.stat().st_mtime)
                    if file_date < cutoff_date:
                        log_file.unlink()
                        self.logger.info(f"🗑️  Log antiguo eliminado: {log_file}")
                except Exception as e:
                    self.logger.warning(f"⚠️  No se pudo eliminar log {log_file}: {e}")
        except Exception as e:
            self.logger.error(f"❌ Error en cleanup de logs: {e}")
    
    def check_database_connection(self) -> bool:
        """Verificar conexión a la base de datos"""
        try:
            return test_connection()
        except Exception as e:
            self.logger.error(f"❌ Error de conexión a BD: {e}")
            return False
    
    def execute_scraping_with_retry(self) -> Dict:
        """Ejecutar scraping con reintentos automáticos"""
        max_retries = self.config.get('max_retries', 3)
        retry_delay = self.config.get('retry_delay_minutes', 5)
        
        for attempt in range(max_retries + 1):
            try:
                self.logger.info(f"🔄 Intento {attempt + 1}/{max_retries + 1} de scraping")
                
                # Verificar conexión a BD antes de intentar
                if not self.check_database_connection():
                    raise Exception("No hay conexión a la base de datos")
                
                # Ejecutar scraping con timeout
                result = self.scraping_service.execute_scraping()
                
                if result.get('success', False):
                    self.failed_attempts = 0  # Reset contador de fallos
                    self.logger.info(f"✅ Scraping exitoso: {result}")
                    return result
                else:
                    raise Exception(f"Scraping falló: {result.get('error', 'Error desconocido')}")
                    
            except Exception as e:
                self.logger.error(f"❌ Error en intento {attempt + 1}: {e}")
                self.failed_attempts += 1
                
                if attempt < max_retries:
                    self.logger.info(f"⏳ Esperando {retry_delay} minutos antes del siguiente intento...")
                    time.sleep(retry_delay * 60)
                else:
                    self.logger.error(f"💥 Todos los intentos fallaron. Total de fallos consecutivos: {self.failed_attempts}")
                    
                    # Parada de emergencia si hay demasiados fallos
                    if self.failed_attempts >= self.config.get('emergency_stop_after_failures', 10):
                        self.logger.critical("🚨 PARADA DE EMERGENCIA: Demasiados fallos consecutivos")
                        self.is_running = False
                        return {'success': False, 'error': 'Emergency stop triggered', 'emergency_stop': True}
        
        return {'success': False, 'error': 'Max retries exceeded', 'attempts': max_retries + 1}
    
    def scraping_job(self):
        """Trabajo principal de scraping"""
        job_start = datetime.now()
        self.execution_count += 1
        
        self.logger.info("=" * 80)
        self.logger.info(f"🚀 INICIANDO SCRAPING PROGRAMADO #{self.execution_count}")
        self.logger.info(f"🕒 Hora de inicio: {job_start.strftime('%Y-%m-%d %H:%M:%S')}")
        self.logger.info("=" * 80)
        
        try:
            # Ejecutar scraping con reintentos
            result = self.execute_scraping_with_retry()
            
            # Calcular duración
            duration = (datetime.now() - job_start).total_seconds()
            
            # Registrar estadísticas
            self.save_execution_stats(result, duration)
            
            # Log de resultado
            if result.get('success', False):
                self.logger.info(f"✅ SCRAPING COMPLETADO EXITOSAMENTE")
                self.logger.info(f"📊 Noticias extraídas: {result.get('total_extracted', 0)}")
                self.logger.info(f"💾 Noticias guardadas: {result.get('total_saved', 0)}")
                self.logger.info(f"🔍 Duplicados detectados: {result.get('duplicates_detected', 0)}")
                self.logger.info(f"🚨 Alertas activadas: {result.get('alerts_triggered', 0)}")
                self.logger.info(f"⏱️  Duración: {duration:.2f} segundos")
                
                # Enviar notificación de éxito si está habilitado
                if self.config.get('enable_notifications', False):
                    self.send_success_notification(result)
            else:
                self.logger.error(f"❌ SCRAPING FALLÓ: {result.get('error', 'Error desconocido')}")
                
                # Parada de emergencia
                if result.get('emergency_stop', False):
                    self.logger.critical("🚨 Activando parada de emergencia...")
                    self.is_running = False
            
            self.last_execution = job_start
            
        except Exception as e:
            self.logger.error(f"💥 Error crítico en scraping job: {e}")
            self.failed_attempts += 1
        
        self.logger.info("=" * 80)
        self.logger.info(f"🏁 SCRAPING FINALIZADO - Próxima ejecución programada")
        self.logger.info("=" * 80)
    
    def save_execution_stats(self, result: Dict, duration: float):
        """Guardar estadísticas de ejecución"""
        try:
            db = next(get_db())
            
            stats = EstadisticaScraping(
                diario_id=1,  # ID genérico para estadísticas del scheduler
                categoria='scheduler_execution',
                cantidad_noticias=result.get('total_saved', 0),
                duracion_segundos=int(duration),
                estado='exitoso' if result.get('success', False) else 'error',
                detalles=json.dumps({
                    'total_extracted': result.get('total_extracted', 0),
                    'total_saved': result.get('total_saved', 0),
                    'duplicates_detected': result.get('duplicates_detected', 0),
                    'alerts_triggered': result.get('alerts_triggered', 0),
                    'execution_count': self.execution_count,
                    'failed_attempts': self.failed_attempts,
                    'error': result.get('error')
                })
            )
            
            db.add(stats)
            db.commit()
            
        except Exception as e:
            self.logger.error(f"❌ Error guardando estadísticas: {e}")
        finally:
            db.close()
    
    def send_success_notification(self, result: Dict):
        """Enviar notificación de éxito (placeholder para futuras implementaciones)"""
        try:
            # Aquí podrías integrar con servicios como:
            # - Telegram Bot
            # - Email
            # - Slack
            # - Discord Webhook
            self.logger.info(f"📢 Notificación: Scraping exitoso - {result.get('total_saved', 0)} noticias nuevas")
        except Exception as e:
            self.logger.warning(f"⚠️  Error enviando notificación: {e}")
    
    def health_check(self):
        """Verificación de salud del sistema"""
        try:
            # Verificar conexión a BD
            db_ok = self.check_database_connection()
            
            # Verificar última ejecución
            time_since_last = None
            if self.last_execution:
                time_since_last = (datetime.now() - self.last_execution).total_seconds() / 3600
            
            # Verificar estado general
            status = {
                'database_connection': db_ok,
                'last_execution': self.last_execution.isoformat() if self.last_execution else None,
                'hours_since_last_execution': time_since_last,
                'execution_count': self.execution_count,
                'failed_attempts': self.failed_attempts,
                'is_running': self.is_running,
                'config_loaded': bool(self.config)
            }
            
            self.logger.debug(f"🏥 Health Check: {status}")
            return status
            
        except Exception as e:
            self.logger.error(f"❌ Error en health check: {e}")
            return {'error': str(e)}
    
    def schedule_jobs(self):
        """Programar trabajos en horarios específicos"""
        scraping_hours = self.config.get('scraping_hours', [6, 9, 12, 15, 18, 21])
        
        # Limpiar trabajos anteriores
        schedule.clear()
        
        # Programar scraping en horarios específicos
        for hour in scraping_hours:
            schedule.every().day.at(f"{hour:02d}:00").do(self.scraping_job)
            self.logger.info(f"⏰ Scraping programado a las {hour:02d}:00")
        
        # Programar health check cada cierto tiempo
        health_interval = self.config.get('health_check_interval', 300) // 60  # convertir a minutos
        schedule.every(health_interval).minutes.do(self.health_check)
        self.logger.info(f"🏥 Health check programado cada {health_interval} minutos")
        
        # Mostrar próximas ejecuciones
        self.show_next_executions()
    
    def show_next_executions(self):
        """Mostrar próximas ejecuciones programadas"""
        jobs = schedule.jobs
        if jobs:
            self.logger.info("📅 Próximas ejecuciones programadas:")
            for job in sorted(jobs, key=lambda x: x.next_run):
                self.logger.info(f"   🔹 {job.next_run.strftime('%Y-%m-%d %H:%M:%S')} - {job.job_func.__name__}")
    
    def signal_handler(self, signum, frame):
        """Manejar señales del sistema"""
        self.logger.info(f"📡 Señal recibida: {signum}")
        self.stop()
    
    def start(self):
        """Iniciar el scheduler"""
        self.logger.info("🚀 Iniciando Advanced Scheduler...")
        
        # Verificar conexión inicial
        if not self.check_database_connection():
            self.logger.error("❌ No se puede conectar a la base de datos. Abortando inicio.")
            return False
        
        # Programar trabajos
        self.schedule_jobs()
        
        # Marcar como en ejecución
        self.is_running = True
        
        # Ejecutar scraping inicial si se desea
        if self.config.get('run_initial_scraping', True):
            self.logger.info("🔄 Ejecutando scraping inicial...")
            threading.Thread(target=self.scraping_job, daemon=True).start()
        
        # Loop principal
        self.logger.info("✅ Scheduler iniciado correctamente")
        self.logger.info("🔄 Entrando en loop principal...")
        
        try:
            while self.is_running:
                schedule.run_pending()
                time.sleep(30)  # Verificar cada 30 segundos
                
        except KeyboardInterrupt:
            self.logger.info("⌨️  Interrupción por teclado detectada")
        except Exception as e:
            self.logger.error(f"💥 Error en loop principal: {e}")
        finally:
            self.stop()
        
        return True
    
    def stop(self):
        """Detener el scheduler"""
        self.logger.info("🛑 Deteniendo Advanced Scheduler...")
        self.is_running = False
        
        # Limpiar trabajos programados
        schedule.clear()
        
        self.logger.info("👋 Advanced Scheduler detenido")
    
    def get_status(self) -> Dict:
        """Obtener estado actual del scheduler"""
        return {
            'is_running': self.is_running,
            'last_execution': self.last_execution.isoformat() if self.last_execution else None,
            'execution_count': self.execution_count,
            'failed_attempts': self.failed_attempts,
            'config': self.config,
            'scheduled_jobs': len(schedule.jobs),
            'next_execution': schedule.next_run().isoformat() if schedule.jobs else None
        }

def main():
    """Función principal"""
    print("🚀 Advanced Scheduler para Scraping de Diarios")
    print("=" * 60)
    
    # Crear y iniciar scheduler
    scheduler = AdvancedScheduler()
    
    try:
        success = scheduler.start()
        if not success:
            print("❌ No se pudo iniciar el scheduler")
            return 1
    except Exception as e:
        print(f"💥 Error fatal: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
