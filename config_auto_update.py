#!/usr/bin/env python3
"""
Configurador del sistema de actualización automática
Permite personalizar la frecuencia de scraping y otros parámetros
"""

import os
import json
from pathlib import Path

class AutoUpdateConfig:
    def __init__(self):
        self.config_file = Path("auto_update_config.json")
        self.default_config = {
            "schedule_interval_minutes": 15,
            "max_news_per_scraping": 50,
            "enable_notifications": True,
            "notification_sound": True,
            "auto_refresh_frontend": True,
            "frontend_refresh_interval_seconds": 30,
            "log_level": "INFO",
            "backup_database": True,
            "cleanup_old_news_days": 30
        }
        self.config = self.load_config()
    
    def load_config(self):
        """Cargar configuración desde archivo"""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                # Combinar con valores por defecto
                for key, value in self.default_config.items():
                    if key not in config:
                        config[key] = value
                return config
            except Exception as e:
                print(f"Error cargando configuración: {e}")
                return self.default_config.copy()
        else:
            return self.default_config.copy()
    
    def save_config(self):
        """Guardar configuración a archivo"""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
            print("✅ Configuración guardada correctamente")
        except Exception as e:
            print(f"❌ Error guardando configuración: {e}")
    
    def show_current_config(self):
        """Mostrar configuración actual"""
        print("=" * 50)
        print("📋 CONFIGURACIÓN ACTUAL DEL SISTEMA")
        print("=" * 50)
        print(f"⏱️  Frecuencia de scraping: {self.config['schedule_interval_minutes']} minutos")
        print(f"📰 Máximo noticias por scraping: {self.config['max_news_per_scraping']}")
        print(f"🔔 Notificaciones habilitadas: {'Sí' if self.config['enable_notifications'] else 'No'}")
        print(f"🔊 Sonido de notificaciones: {'Sí' if self.config['notification_sound'] else 'No'}")
        print(f"🔄 Auto-refresh frontend: {'Sí' if self.config['auto_refresh_frontend'] else 'No'}")
        print(f"⏰ Intervalo refresh frontend: {self.config['frontend_refresh_interval_seconds']} segundos")
        print(f"📝 Nivel de logs: {self.config['log_level']}")
        print(f"💾 Backup automático BD: {'Sí' if self.config['backup_database'] else 'No'}")
        print(f"🗑️  Limpiar noticias antiguas: {self.config['cleanup_old_news_days']} días")
        print("=" * 50)
    
    def configure_frequency(self):
        """Configurar frecuencia de scraping"""
        print("\n⏱️  CONFIGURAR FRECUENCIA DE SCRAPING")
        print("Opciones recomendadas:")
        print("• 5 minutos: Muy frecuente (para desarrollo/testing)")
        print("• 15 minutos: Frecuente (recomendado para producción)")
        print("• 30 minutos: Moderado")
        print("• 60 minutos: Espaciado")
        print("• 120 minutos: Muy espaciado")
        
        while True:
            try:
                minutes = int(input("\nIngresa la frecuencia en minutos (5-120): "))
                if 5 <= minutes <= 120:
                    self.config['schedule_interval_minutes'] = minutes
                    print(f"✅ Frecuencia configurada a {minutes} minutos")
                    break
                else:
                    print("❌ Por favor ingresa un valor entre 5 y 120 minutos")
            except ValueError:
                print("❌ Por favor ingresa un número válido")
    
    def configure_notifications(self):
        """Configurar notificaciones"""
        print("\n🔔 CONFIGURAR NOTIFICACIONES")
        
        enable = input("¿Habilitar notificaciones de nuevas noticias? (s/n): ").lower()
        self.config['enable_notifications'] = enable in ['s', 'si', 'sí', 'y', 'yes']
        
        if self.config['enable_notifications']:
            sound = input("¿Reproducir sonido en notificaciones? (s/n): ").lower()
            self.config['notification_sound'] = sound in ['s', 'si', 'sí', 'y', 'yes']
    
    def configure_frontend_refresh(self):
        """Configurar auto-refresh del frontend"""
        print("\n🔄 CONFIGURAR AUTO-REFRESH DEL FRONTEND")
        
        enable = input("¿Habilitar auto-refresh del frontend? (s/n): ").lower()
        self.config['auto_refresh_frontend'] = enable in ['s', 'si', 'sí', 'y', 'yes']
        
        if self.config['auto_refresh_frontend']:
            while True:
                try:
                    seconds = int(input("Intervalo de refresh en segundos (10-300): "))
                    if 10 <= seconds <= 300:
                        self.config['frontend_refresh_interval_seconds'] = seconds
                        break
                    else:
                        print("❌ Por favor ingresa un valor entre 10 y 300 segundos")
                except ValueError:
                    print("❌ Por favor ingresa un número válido")
    
    def configure_cleanup(self):
        """Configurar limpieza de noticias antiguas"""
        print("\n🗑️  CONFIGURAR LIMPIEZA DE NOTICIAS ANTIGUAS")
        
        while True:
            try:
                days = int(input("Días para mantener noticias (7-365): "))
                if 7 <= days <= 365:
                    self.config['cleanup_old_news_days'] = days
                    print(f"✅ Se mantendrán noticias de los últimos {days} días")
                    break
                else:
                    print("❌ Por favor ingresa un valor entre 7 y 365 días")
            except ValueError:
                print("❌ Por favor ingresa un número válido")
    
    def interactive_config(self):
        """Configuración interactiva"""
        print("🔧 CONFIGURADOR DEL SISTEMA DE ACTUALIZACIÓN AUTOMÁTICA")
        print("Este asistente te ayudará a configurar el sistema")
        
        while True:
            self.show_current_config()
            print("\nOpciones:")
            print("1. Configurar frecuencia de scraping")
            print("2. Configurar notificaciones")
            print("3. Configurar auto-refresh del frontend")
            print("4. Configurar limpieza de noticias")
            print("5. Guardar configuración y salir")
            print("6. Salir sin guardar")
            
            choice = input("\nSelecciona una opción (1-6): ")
            
            if choice == '1':
                self.configure_frequency()
            elif choice == '2':
                self.configure_notifications()
            elif choice == '3':
                self.configure_frontend_refresh()
            elif choice == '4':
                self.configure_cleanup()
            elif choice == '5':
                self.save_config()
                print("✅ Configuración guardada. Reinicia el sistema para aplicar cambios.")
                break
            elif choice == '6':
                print("👋 Saliendo sin guardar cambios")
                break
            else:
                print("❌ Opción no válida")

def main():
    """Función principal"""
    config = AutoUpdateConfig()
    config.interactive_config()

if __name__ == "__main__":
    main()
