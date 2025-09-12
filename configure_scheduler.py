#!/usr/bin/env python3
"""
Script de Configuración Interactiva para el Advanced Scheduler
Permite configurar horarios, notificaciones, y otros parámetros fácilmente
"""

import json
import os
from pathlib import Path
from datetime import datetime, time
from typing import List, Dict, Any

class SchedulerConfigurator:
    def __init__(self):
        self.config_file = Path("scheduler_config.json")
        self.config = self.load_current_config()
    
    def load_current_config(self) -> Dict[str, Any]:
        """Cargar configuración actual"""
        default_config = {
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
            "run_initial_scraping": False
        }
        
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                # Combinar con valores por defecto
                for key, value in default_config.items():
                    if key not in config:
                        config[key] = value
                return config
            except Exception as e:
                print(f"⚠️  Error cargando configuración: {e}")
                return default_config
        else:
            return default_config
    
    def save_config(self):
        """Guardar configuración"""
        try:
            # Agregar metadatos
            self.config['last_updated'] = datetime.now().isoformat()
            self.config['updated_by'] = 'configure_scheduler.py'
            
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
            print("✅ Configuración guardada exitosamente")
            return True
        except Exception as e:
            print(f"❌ Error guardando configuración: {e}")
            return False
    
    def show_current_config(self):
        """Mostrar configuración actual"""
        print("\n" + "=" * 60)
        print("📋 CONFIGURACIÓN ACTUAL DEL SCHEDULER")
        print("=" * 60)
        
        # Horarios de scraping
        hours = self.config.get('scraping_hours', [])
        hours_str = ", ".join([f"{h:02d}:00" for h in sorted(hours)])
        print(f"⏰ Horarios de scraping: {hours_str}")
        print(f"🌍 Zona horaria: {self.config.get('timezone', 'America/Lima')}")
        
        # Configuración de reintentos
        print(f"🔄 Reintentos máximos: {self.config.get('max_retries', 3)}")
        print(f"⏳ Delay entre reintentos: {self.config.get('retry_delay_minutes', 5)} minutos")
        
        # Logging
        print(f"📝 Nivel de logging: {self.config.get('log_level', 'INFO')}")
        print(f"🗂️  Archivos de log máximos: {self.config.get('max_log_files', 7)}")
        print(f"🗑️  Limpiar logs después de: {self.config.get('cleanup_old_logs_days', 30)} días")
        
        # Monitoreo
        health_minutes = self.config.get('health_check_interval', 300) // 60
        print(f"🏥 Health check cada: {health_minutes} minutos")
        print(f"🚨 Parada de emergencia tras: {self.config.get('emergency_stop_after_failures', 10)} fallos")
        
        # Timeouts
        print(f"⏱️  Timeout de BD: {self.config.get('database_timeout', 30)} segundos")
        print(f"⏱️  Timeout de scraping: {self.config.get('scraping_timeout', 600)} segundos")
        
        # Otros
        print(f"🔔 Notificaciones: {'Habilitadas' if self.config.get('enable_notifications', True) else 'Deshabilitadas'}")
        print(f"🚀 Scraping inicial: {'Sí' if self.config.get('run_initial_scraping', False) else 'No'}")
        
        print("=" * 60)
    
    def configure_scraping_hours(self):
        """Configurar horarios de scraping"""
        print("\n⏰ CONFIGURAR HORARIOS DE SCRAPING")
        print("Horarios actuales:", [f"{h:02d}:00" for h in sorted(self.config.get('scraping_hours', []))])
        print("\nOpciones:")
        print("1. Usar horarios predefinidos")
        print("2. Configurar horarios personalizados")
        print("3. Mantener horarios actuales")
        
        while True:
            choice = input("\nSelecciona una opción (1-3): ").strip()
            
            if choice == '1':
                return self.select_predefined_hours()
            elif choice == '2':
                return self.configure_custom_hours()
            elif choice == '3':
                print("✅ Manteniendo horarios actuales")
                return
            else:
                print("❌ Opción no válida")
    
    def select_predefined_hours(self):
        """Seleccionar horarios predefinidos"""
        presets = {
            '1': {'name': 'Muy Frecuente (cada 2 horas)', 'hours': [6, 8, 10, 12, 14, 16, 18, 20, 22]},
            '2': {'name': 'Frecuente (cada 3 horas)', 'hours': [6, 9, 12, 15, 18, 21]},
            '3': {'name': 'Moderado (cada 4 horas)', 'hours': [6, 10, 14, 18, 22]},
            '4': {'name': 'Espaciado (cada 6 horas)', 'hours': [6, 12, 18]},
            '5': {'name': 'Solo horarios laborales', 'hours': [8, 12, 16, 20]},
            '6': {'name': 'Mañana y tarde', 'hours': [8, 14, 20]},
            '7': {'name': 'Solo una vez al día', 'hours': [9]}
        }
        
        print("\n📅 Horarios predefinidos:")
        for key, preset in presets.items():
            hours_str = ", ".join([f"{h:02d}:00" for h in preset['hours']])
            print(f"{key}. {preset['name']}: {hours_str}")
        
        while True:
            choice = input("\nSelecciona un preset (1-7): ").strip()
            if choice in presets:
                selected = presets[choice]
                self.config['scraping_hours'] = selected['hours']
                print(f"✅ Configurado: {selected['name']}")
                break
            else:
                print("❌ Opción no válida")
    
    def configure_custom_hours(self):
        """Configurar horarios personalizados"""
        print("\n🛠️  CONFIGURAR HORARIOS PERSONALIZADOS")
        print("Ingresa las horas en formato 24h (0-23), separadas por comas")
        print("Ejemplo: 6,9,12,15,18,21")
        
        while True:
            try:
                hours_input = input("\nHoras (0-23): ").strip()
                if not hours_input:
                    print("❌ Debes ingresar al menos una hora")
                    continue
                
                # Parsear horas
                hours = []
                for hour_str in hours_input.split(','):
                    hour = int(hour_str.strip())
                    if 0 <= hour <= 23:
                        hours.append(hour)
                    else:
                        print(f"❌ Hora inválida: {hour}. Debe estar entre 0 y 23")
                        raise ValueError("Hora inválida")
                
                if not hours:
                    print("❌ No se ingresaron horas válidas")
                    continue
                
                # Remover duplicados y ordenar
                hours = sorted(list(set(hours)))
                
                # Confirmar
                hours_str = ", ".join([f"{h:02d}:00" for h in hours])
                print(f"\n📅 Horarios configurados: {hours_str}")
                confirm = input("¿Confirmar estos horarios? (s/n): ").lower()
                
                if confirm in ['s', 'si', 'sí', 'y', 'yes']:
                    self.config['scraping_hours'] = hours
                    print("✅ Horarios configurados exitosamente")
                    break
                else:
                    print("❌ Configuración cancelada")
                    break
                    
            except ValueError as e:
                print(f"❌ Error: {e}. Intenta nuevamente.")
    
    def configure_retries_and_timeouts(self):
        """Configurar reintentos y timeouts"""
        print("\n🔄 CONFIGURAR REINTENTOS Y TIMEOUTS")
        
        # Reintentos
        while True:
            try:
                current = self.config.get('max_retries', 3)
                retries = input(f"Reintentos máximos (actual: {current}, recomendado: 3): ").strip()
                if not retries:
                    break
                
                retries = int(retries)
                if 1 <= retries <= 10:
                    self.config['max_retries'] = retries
                    print(f"✅ Reintentos configurados: {retries}")
                    break
                else:
                    print("❌ Debe estar entre 1 y 10")
            except ValueError:
                print("❌ Ingresa un número válido")
        
        # Delay entre reintentos
        while True:
            try:
                current = self.config.get('retry_delay_minutes', 5)
                delay = input(f"Delay entre reintentos en minutos (actual: {current}): ").strip()
                if not delay:
                    break
                
                delay = int(delay)
                if 1 <= delay <= 60:
                    self.config['retry_delay_minutes'] = delay
                    print(f"✅ Delay configurado: {delay} minutos")
                    break
                else:
                    print("❌ Debe estar entre 1 y 60 minutos")
            except ValueError:
                print("❌ Ingresa un número válido")
        
        # Timeout de scraping
        while True:
            try:
                current = self.config.get('scraping_timeout', 600)
                timeout = input(f"Timeout de scraping en segundos (actual: {current}): ").strip()
                if not timeout:
                    break
                
                timeout = int(timeout)
                if 60 <= timeout <= 3600:
                    self.config['scraping_timeout'] = timeout
                    print(f"✅ Timeout configurado: {timeout} segundos")
                    break
                else:
                    print("❌ Debe estar entre 60 y 3600 segundos")
            except ValueError:
                print("❌ Ingresa un número válido")
    
    def configure_logging(self):
        """Configurar logging"""
        print("\n📝 CONFIGURAR LOGGING")
        
        # Nivel de logging
        levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        print("Niveles disponibles:")
        for i, level in enumerate(levels, 1):
            print(f"{i}. {level}")
        
        while True:
            current = self.config.get('log_level', 'INFO')
            choice = input(f"Nivel de logging (actual: {current}): ").strip().upper()
            if not choice:
                break
            
            if choice in levels:
                self.config['log_level'] = choice
                print(f"✅ Nivel configurado: {choice}")
                break
            else:
                print("❌ Nivel no válido")
        
        # Días para mantener logs
        while True:
            try:
                current = self.config.get('cleanup_old_logs_days', 30)
                days = input(f"Días para mantener logs (actual: {current}): ").strip()
                if not days:
                    break
                
                days = int(days)
                if 1 <= days <= 365:
                    self.config['cleanup_old_logs_days'] = days
                    print(f"✅ Configurado: mantener logs por {days} días")
                    break
                else:
                    print("❌ Debe estar entre 1 y 365 días")
            except ValueError:
                print("❌ Ingresa un número válido")
    
    def configure_monitoring(self):
        """Configurar monitoreo"""
        print("\n🏥 CONFIGURAR MONITOREO")
        
        # Health check interval
        while True:
            try:
                current_seconds = self.config.get('health_check_interval', 300)
                current_minutes = current_seconds // 60
                minutes = input(f"Intervalo de health check en minutos (actual: {current_minutes}): ").strip()
                if not minutes:
                    break
                
                minutes = int(minutes)
                if 1 <= minutes <= 60:
                    self.config['health_check_interval'] = minutes * 60
                    print(f"✅ Health check cada {minutes} minutos")
                    break
                else:
                    print("❌ Debe estar entre 1 y 60 minutos")
            except ValueError:
                print("❌ Ingresa un número válido")
        
        # Emergency stop threshold
        while True:
            try:
                current = self.config.get('emergency_stop_after_failures', 10)
                failures = input(f"Parada de emergencia tras N fallos (actual: {current}): ").strip()
                if not failures:
                    break
                
                failures = int(failures)
                if 3 <= failures <= 50:
                    self.config['emergency_stop_after_failures'] = failures
                    print(f"✅ Parada de emergencia tras {failures} fallos")
                    break
                else:
                    print("❌ Debe estar entre 3 y 50")
            except ValueError:
                print("❌ Ingresa un número válido")
    
    def configure_notifications(self):
        """Configurar notificaciones"""
        print("\n🔔 CONFIGURAR NOTIFICACIONES")
        
        current = self.config.get('enable_notifications', True)
        print(f"Estado actual: {'Habilitadas' if current else 'Deshabilitadas'}")
        
        enable = input("¿Habilitar notificaciones? (s/n): ").lower().strip()
        if enable in ['s', 'si', 'sí', 'y', 'yes']:
            self.config['enable_notifications'] = True
            print("✅ Notificaciones habilitadas")
        elif enable in ['n', 'no']:
            self.config['enable_notifications'] = False
            print("✅ Notificaciones deshabilitadas")
    
    def test_configuration(self):
        """Probar la configuración"""
        print("\n🧪 PROBAR CONFIGURACIÓN")
        
        # Validar horarios
        hours = self.config.get('scraping_hours', [])
        if not hours:
            print("❌ Error: No hay horarios configurados")
            return False
        
        if len(hours) > 24:
            print("⚠️  Advertencia: Muchos horarios configurados (>24)")
        
        # Validar valores numéricos
        numeric_fields = {
            'max_retries': (1, 10),
            'retry_delay_minutes': (1, 60),
            'scraping_timeout': (60, 3600),
            'health_check_interval': (60, 3600),
            'emergency_stop_after_failures': (3, 50)
        }
        
        for field, (min_val, max_val) in numeric_fields.items():
            value = self.config.get(field, 0)
            if not (min_val <= value <= max_val):
                print(f"❌ Error: {field} = {value} fuera del rango [{min_val}, {max_val}]")
                return False
        
        print("✅ Configuración válida")
        
        # Mostrar resumen
        hours_str = ", ".join([f"{h:02d}:00" for h in sorted(hours)])
        print(f"📅 Se ejecutará scraping en: {hours_str}")
        print(f"🔄 Con {self.config.get('max_retries', 3)} reintentos máximos")
        print(f"⏱️  Timeout de {self.config.get('scraping_timeout', 600)} segundos")
        
        return True
    
    def interactive_menu(self):
        """Menú interactivo principal"""
        while True:
            print("\n" + "=" * 60)
            print("🔧 CONFIGURADOR DEL ADVANCED SCHEDULER")
            print("=" * 60)
            
            self.show_current_config()
            
            print("\n📋 OPCIONES:")
            print("1. Configurar horarios de scraping")
            print("2. Configurar reintentos y timeouts")
            print("3. Configurar logging")
            print("4. Configurar monitoreo")
            print("5. Configurar notificaciones")
            print("6. Probar configuración")
            print("7. Guardar y salir")
            print("8. Salir sin guardar")
            
            choice = input("\nSelecciona una opción (1-8): ").strip()
            
            if choice == '1':
                self.configure_scraping_hours()
            elif choice == '2':
                self.configure_retries_and_timeouts()
            elif choice == '3':
                self.configure_logging()
            elif choice == '4':
                self.configure_monitoring()
            elif choice == '5':
                self.configure_notifications()
            elif choice == '6':
                self.test_configuration()
            elif choice == '7':
                if self.save_config():
                    print("✅ Configuración guardada. ¡Reinicia el sistema para aplicar cambios!")
                    break
                else:
                    print("❌ Error guardando configuración")
            elif choice == '8':
                print("👋 Saliendo sin guardar cambios")
                break
            else:
                print("❌ Opción no válida")

def main():
    """Función principal"""
    print("🔧 Configurador del Advanced Scheduler")
    print("Este script te ayudará a configurar el sistema de scraping automático")
    
    configurator = SchedulerConfigurator()
    configurator.interactive_menu()

if __name__ == "__main__":
    main()
