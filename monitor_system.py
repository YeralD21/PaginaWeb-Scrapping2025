#!/usr/bin/env python3
"""
Monitor del Sistema de Scraping
Proporciona información en tiempo real sobre el estado del sistema
"""

import sys
import os
import json
import requests
import psutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from backend.database import get_db, test_connection
    from backend.models import Noticia, EstadisticaScraping
    from sqlalchemy import func
except ImportError:
    print("⚠️  No se pudieron importar módulos de backend")

class SystemMonitor:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3000"
        self.config_file = Path("scheduler_config.json")
    
    def load_config(self) -> Dict:
        """Cargar configuración del scheduler"""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass
        return {}
    
    def check_service_status(self, url: str, service_name: str) -> Dict:
        """Verificar estado de un servicio"""
        try:
            response = requests.get(url, timeout=5)
            return {
                'name': service_name,
                'status': 'online' if response.status_code == 200 else 'error',
                'response_time': response.elapsed.total_seconds(),
                'status_code': response.status_code
            }
        except requests.exceptions.ConnectionError:
            return {
                'name': service_name,
                'status': 'offline',
                'response_time': None,
                'status_code': None
            }
        except Exception as e:
            return {
                'name': service_name,
                'status': 'error',
                'response_time': None,
                'status_code': None,
                'error': str(e)
            }
    
    def check_database_status(self) -> Dict:
        """Verificar estado de la base de datos"""
        try:
            if test_connection():
                db = next(get_db())
                try:
                    # Contar noticias
                    total_noticias = db.query(Noticia).count()
                    
                    # Última noticia
                    ultima_noticia = db.query(Noticia).order_by(
                        Noticia.fecha_extraccion.desc()
                    ).first()
                    
                    # Estadísticas recientes
                    hace_24h = datetime.now() - timedelta(hours=24)
                    noticias_24h = db.query(Noticia).filter(
                        Noticia.fecha_extraccion >= hace_24h
                    ).count()
                    
                    return {
                        'status': 'online',
                        'total_noticias': total_noticias,
                        'noticias_ultimas_24h': noticias_24h,
                        'ultima_extraccion': ultima_noticia.fecha_extraccion.isoformat() if ultima_noticia else None
                    }
                finally:
                    db.close()
            else:
                return {'status': 'offline', 'error': 'No connection'}
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
    
    def check_processes(self) -> List[Dict]:
        """Verificar procesos relacionados con el sistema"""
        processes = []
        
        for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'create_time', 'memory_info']):
            try:
                cmdline = ' '.join(proc.info['cmdline'] or [])
                
                # Buscar procesos relacionados
                if any(keyword in cmdline.lower() for keyword in [
                    'uvicorn', 'main:app', 'scheduler', 'npm start', 'react-scripts'
                ]):
                    processes.append({
                        'pid': proc.info['pid'],
                        'name': proc.info['name'],
                        'cmdline': cmdline[:100] + '...' if len(cmdline) > 100 else cmdline,
                        'started': datetime.fromtimestamp(proc.info['create_time']).isoformat(),
                        'memory_mb': round(proc.info['memory_info'].rss / 1024 / 1024, 1) if proc.info['memory_info'] else 0
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        return processes
    
    def get_log_summary(self) -> Dict:
        """Obtener resumen de logs"""
        log_dir = Path("logs")
        summary = {
            'log_files': [],
            'total_size_mb': 0,
            'latest_entries': []
        }
        
        if log_dir.exists():
            for log_file in log_dir.glob("*.log"):
                try:
                    stat = log_file.stat()
                    size_mb = stat.st_size / 1024 / 1024
                    summary['log_files'].append({
                        'name': log_file.name,
                        'size_mb': round(size_mb, 2),
                        'modified': datetime.fromtimestamp(stat.st_mtime).isoformat()
                    })
                    summary['total_size_mb'] += size_mb
                except:
                    continue
            
            summary['total_size_mb'] = round(summary['total_size_mb'], 2)
            
            # Leer últimas entradas del log más reciente
            if summary['log_files']:
                latest_log = max(summary['log_files'], key=lambda x: x['modified'])
                latest_log_path = log_dir / latest_log['name']
                
                try:
                    with open(latest_log_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        summary['latest_entries'] = [line.strip() for line in lines[-10:] if line.strip()]
                except:
                    pass
        
        return summary
    
    def get_scraping_statistics(self) -> Dict:
        """Obtener estadísticas de scraping"""
        try:
            db = next(get_db())
            try:
                # Estadísticas de las últimas 24 horas
                hace_24h = datetime.now() - timedelta(hours=24)
                
                # Noticias por diario (últimas 24h)
                noticias_por_diario = db.query(
                    func.count(Noticia.id).label('cantidad'),
                    Noticia.diario_id
                ).filter(
                    Noticia.fecha_extraccion >= hace_24h
                ).group_by(Noticia.diario_id).all()
                
                # Últimas ejecuciones del scheduler
                ultimas_ejecuciones = db.query(EstadisticaScraping).filter(
                    EstadisticaScraping.categoria == 'scheduler_execution'
                ).order_by(EstadisticaScraping.fecha_scraping.desc()).limit(5).all()
                
                return {
                    'noticias_24h': sum(n.cantidad for n in noticias_por_diario),
                    'noticias_por_diario_24h': [
                        {'diario_id': n.diario_id, 'cantidad': n.cantidad} 
                        for n in noticias_por_diario
                    ],
                    'ultimas_ejecuciones': [
                        {
                            'fecha': e.fecha_scraping.isoformat(),
                            'estado': e.estado,
                            'duracion': e.duracion_segundos,
                            'noticias': e.cantidad_noticias
                        }
                        for e in ultimas_ejecuciones
                    ]
                }
            finally:
                db.close()
        except Exception as e:
            return {'error': str(e)}
    
    def get_system_resources(self) -> Dict:
        """Obtener información de recursos del sistema"""
        try:
            # CPU
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memoria
            memory = psutil.virtual_memory()
            
            # Disco
            disk = psutil.disk_usage('.')
            
            return {
                'cpu_percent': cpu_percent,
                'memory': {
                    'total_gb': round(memory.total / 1024**3, 2),
                    'available_gb': round(memory.available / 1024**3, 2),
                    'used_percent': memory.percent
                },
                'disk': {
                    'total_gb': round(disk.total / 1024**3, 2),
                    'free_gb': round(disk.free / 1024**3, 2),
                    'used_percent': round((disk.used / disk.total) * 100, 1)
                }
            }
        except Exception as e:
            return {'error': str(e)}
    
    def generate_report(self) -> Dict:
        """Generar reporte completo del sistema"""
        print("🔍 Generando reporte del sistema...")
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'config': self.load_config(),
            'services': {
                'backend': self.check_service_status(self.backend_url, 'Backend API'),
                'frontend': self.check_service_status(self.frontend_url, 'Frontend'),
                'database': self.check_database_status()
            },
            'processes': self.check_processes(),
            'logs': self.get_log_summary(),
            'scraping_stats': self.get_scraping_statistics(),
            'system_resources': self.get_system_resources()
        }
        
        return report
    
    def print_status_summary(self, report: Dict):
        """Imprimir resumen de estado"""
        print("\n" + "=" * 80)
        print("📊 ESTADO DEL SISTEMA DE SCRAPING")
        print("=" * 80)
        print(f"🕒 Timestamp: {report['timestamp']}")
        
        # Estado de servicios
        print("\n🔧 SERVICIOS:")
        for service_name, service_data in report['services'].items():
            status = service_data['status']
            if status == 'online':
                icon = "🟢"
                extra = f"({service_data.get('response_time', 0):.3f}s)" if 'response_time' in service_data else ""
            elif status == 'offline':
                icon = "🔴"
                extra = "OFFLINE"
            else:
                icon = "🟡"
                extra = "ERROR"
            
            print(f"  {icon} {service_name.capitalize()}: {status.upper()} {extra}")
        
        # Procesos
        processes = report.get('processes', [])
        print(f"\n⚙️  PROCESOS ACTIVOS: {len(processes)}")
        for proc in processes[:3]:  # Mostrar solo los primeros 3
            print(f"  • PID {proc['pid']}: {proc['name']} ({proc['memory_mb']} MB)")
        
        # Base de datos
        db_data = report['services'].get('database', {})
        if db_data.get('status') == 'online':
            print(f"\n💾 BASE DE DATOS:")
            print(f"  📰 Total noticias: {db_data.get('total_noticias', 0):,}")
            print(f"  🆕 Últimas 24h: {db_data.get('noticias_ultimas_24h', 0)}")
            if db_data.get('ultima_extraccion'):
                ultima = datetime.fromisoformat(db_data['ultima_extraccion'])
                tiempo_transcurrido = datetime.now() - ultima
                horas = int(tiempo_transcurrido.total_seconds() / 3600)
                print(f"  ⏰ Última extracción: hace {horas}h")
        
        # Recursos del sistema
        resources = report.get('system_resources', {})
        if 'error' not in resources:
            print(f"\n🖥️  RECURSOS DEL SISTEMA:")
            print(f"  🔥 CPU: {resources.get('cpu_percent', 0):.1f}%")
            memory = resources.get('memory', {})
            print(f"  🧠 RAM: {memory.get('used_percent', 0):.1f}% ({memory.get('available_gb', 0):.1f}GB libre)")
            disk = resources.get('disk', {})
            print(f"  💽 Disco: {disk.get('used_percent', 0):.1f}% ({disk.get('free_gb', 0):.1f}GB libre)")
        
        # Configuración
        config = report.get('config', {})
        if config:
            hours = config.get('scraping_hours', [])
            if hours:
                hours_str = ", ".join([f"{h:02d}:00" for h in sorted(hours)])
                print(f"\n⏰ HORARIOS PROGRAMADOS: {hours_str}")
        
        # Logs
        logs = report.get('logs', {})
        if logs.get('log_files'):
            print(f"\n📋 LOGS: {len(logs['log_files'])} archivos ({logs.get('total_size_mb', 0):.1f} MB)")
        
        print("=" * 80)
    
    def save_report(self, report: Dict, filename: Optional[str] = None):
        """Guardar reporte a archivo"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"system_report_{timestamp}.json"
        
        try:
            reports_dir = Path("reports")
            reports_dir.mkdir(exist_ok=True)
            
            report_path = reports_dir / filename
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            
            print(f"📄 Reporte guardado en: {report_path}")
            return report_path
        except Exception as e:
            print(f"❌ Error guardando reporte: {e}")
            return None
    
    def monitor_continuous(self, interval_minutes: int = 5):
        """Monitoreo continuo"""
        print(f"🔄 Iniciando monitoreo continuo (cada {interval_minutes} minutos)")
        print("Presiona Ctrl+C para detener")
        
        try:
            while True:
                report = self.generate_report()
                self.print_status_summary(report)
                
                # Detectar problemas
                problems = []
                if report['services']['backend']['status'] != 'online':
                    problems.append("Backend offline")
                if report['services']['database']['status'] != 'online':
                    problems.append("Base de datos offline")
                
                if problems:
                    print(f"🚨 PROBLEMAS DETECTADOS: {', '.join(problems)}")
                
                print(f"\n⏳ Próxima verificación en {interval_minutes} minutos...")
                time.sleep(interval_minutes * 60)
                
        except KeyboardInterrupt:
            print("\n👋 Monitoreo detenido")

def main():
    """Función principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Monitor del Sistema de Scraping")
    parser.add_argument('--save', action='store_true', help='Guardar reporte a archivo')
    parser.add_argument('--continuous', type=int, metavar='MINUTES', 
                       help='Monitoreo continuo cada N minutos')
    parser.add_argument('--quiet', action='store_true', help='Solo mostrar errores')
    
    args = parser.parse_args()
    
    monitor = SystemMonitor()
    
    if args.continuous:
        monitor.monitor_continuous(args.continuous)
    else:
        report = monitor.generate_report()
        
        if not args.quiet:
            monitor.print_status_summary(report)
        
        if args.save:
            monitor.save_report(report)
        
        # Detectar problemas críticos
        critical_issues = []
        if report['services']['backend']['status'] != 'online':
            critical_issues.append("Backend no disponible")
        if report['services']['database']['status'] != 'online':
            critical_issues.append("Base de datos no disponible")
        
        if critical_issues:
            print(f"\n🚨 PROBLEMAS CRÍTICOS:")
            for issue in critical_issues:
                print(f"  ❌ {issue}")
            return 1
        
        return 0

if __name__ == "__main__":
    import time
    exit(main())
