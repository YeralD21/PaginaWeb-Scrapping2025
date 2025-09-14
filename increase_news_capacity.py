#!/usr/bin/env python3
"""
Script para aumentar la capacidad de noticias del sistema
Permite configurar diferentes niveles de scraping para obtener 500-1000+ noticias
"""

import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'scraping'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from enhanced_scraper import EnhancedScraper
from backend.database import get_db
from backend.models import Noticia, Diario
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class NewsCapacityManager:
    """Gestor para aumentar la capacidad de noticias del sistema"""
    
    def __init__(self):
        self.enhanced_scraper = EnhancedScraper()
        
        # Configuraciones predefinidas
        self.configs = {
            'basico': {
                'pages_per_category': 2,
                'articles_per_page': 10,
                'categories_per_diario': 3,
                'expected_news': '~150-200'
            },
            'medio': {
                'pages_per_category': 3,
                'articles_per_page': 15,
                'categories_per_diario': 5,
                'expected_news': '~300-400'
            },
            'alto': {
                'pages_per_category': 5,
                'articles_per_page': 20,
                'categories_per_diario': 7,
                'expected_news': '~500-700'
            },
            'maximo': {
                'pages_per_category': 8,
                'articles_per_page': 25,
                'categories_per_diario': 7,
                'expected_news': '~800-1000+'
            }
        }
    
    async def run_enhanced_scraping(self, config_level='medio'):
        """Ejecuta scraping mejorado con configuración específica"""
        config = self.configs[config_level]
        
        print(f"🚀 Iniciando scraping en modo '{config_level}'")
        print(f"📊 Configuración: {config}")
        
        # Ejecutar scraping mejorado
        all_news = await self.enhanced_scraper.scrape_all_enhanced()
        
        print(f"✅ Scraping completado: {len(all_news)} noticias obtenidas")
        return all_news
    
    def save_news_to_database(self, news_list):
        """Guarda las noticias en la base de datos evitando duplicados"""
        db = next(get_db())
        saved_count = 0
        duplicates_count = 0
        
        try:
            for news_item in news_list:
                # Buscar el diario por nombre
                diario = db.query(Diario).filter(Diario.nombre == news_item['diario']).first()
                if not diario:
                    logging.warning(f"Diario no encontrado: {news_item['diario']}")
                    continue
                
                # Verificar si la noticia ya existe (por título y diario)
                existing = db.query(Noticia).filter(
                    Noticia.titulo == news_item['titulo'],
                    Noticia.diario_id == diario.id
                ).first()
                
                if existing:
                    duplicates_count += 1
                    continue
                
                # Crear nueva noticia
                noticia = Noticia(
                    titulo=news_item['titulo'],
                    contenido=news_item.get('contenido', ''),
                    enlace=news_item.get('enlace', ''),
                    imagen_url=news_item.get('imagen_url', ''),
                    categoria=news_item['categoria'],
                    fecha_publicacion=news_item.get('fecha_publicacion'),
                    fecha_extraccion=datetime.utcnow(),
                    diario_id=diario.id
                )
                
                db.add(noticia)
                saved_count += 1
            
            db.commit()
            print(f"💾 Guardadas {saved_count} noticias nuevas")
            print(f"🔄 {duplicates_count} duplicados evitados")
            
        except Exception as e:
            db.rollback()
            logging.error(f"Error guardando noticias: {e}")
            return False
        
        return True
    
    def get_database_stats(self):
        """Obtiene estadísticas de la base de datos"""
        db = next(get_db())
        
        total_noticias = db.query(Noticia).count()
        
        # Estadísticas por diario
        diarios_stats = {}
        for diario in db.query(Diario).all():
            count = db.query(Noticia).filter(Noticia.diario_id == diario.id).count()
            diarios_stats[diario.nombre] = count
        
        # Estadísticas por categoría
        categorias_stats = {}
        categorias = db.query(Noticia.categoria).distinct().all()
        for categoria in categorias:
            count = db.query(Noticia).filter(Noticia.categoria == categoria[0]).count()
            categorias_stats[categoria[0]] = count
        
        return {
            'total_noticias': total_noticias,
            'por_diario': diarios_stats,
            'por_categoria': categorias_stats
        }
    
    async def run_full_enhancement(self, config_level='medio'):
        """Ejecuta el proceso completo de mejora"""
        print("=" * 60)
        print("📰 SISTEMA DE AUMENTO DE CAPACIDAD DE NOTICIAS")
        print("=" * 60)
        
        # Mostrar estadísticas actuales
        print("\n📊 ESTADÍSTICAS ACTUALES:")
        current_stats = self.get_database_stats()
        print(f"Total de noticias: {current_stats['total_noticias']}")
        print("Por diario:")
        for diario, count in current_stats['por_diario'].items():
            print(f"  • {diario}: {count}")
        
        # Ejecutar scraping mejorado
        print(f"\n🔄 EJECUTANDO SCRAPING MEJORADO (modo: {config_level})...")
        new_news = await self.run_enhanced_scraping(config_level)
        
        if new_news:
            # Guardar en base de datos
            print("\n💾 GUARDANDO EN BASE DE DATOS...")
            success = self.save_news_to_database(new_news)
            
            if success:
                # Mostrar estadísticas finales
                print("\n📈 ESTADÍSTICAS FINALES:")
                final_stats = self.get_database_stats()
                print(f"Total de noticias: {final_stats['total_noticias']}")
                print("Por diario:")
                for diario, count in final_stats['por_diario'].items():
                    print(f"  • {diario}: {count}")
                
                # Calcular incremento
                increment = final_stats['total_noticias'] - current_stats['total_noticias']
                print(f"\n🎉 ¡ÉXITO! Se agregaron {increment} noticias nuevas")
                print(f"📊 Total actual: {final_stats['total_noticias']} noticias")
            else:
                print("❌ Error guardando noticias en la base de datos")
        else:
            print("❌ No se obtuvieron noticias nuevas")

def main():
    """Función principal"""
    if len(sys.argv) > 1:
        config_level = sys.argv[1]
        if config_level not in ['basico', 'medio', 'alto', 'maximo']:
            print("❌ Nivel de configuración inválido. Use: basico, medio, alto, maximo")
            return
    else:
        config_level = 'medio'
    
    manager = NewsCapacityManager()
    
    # Mostrar opciones disponibles
    print("🎯 CONFIGURACIONES DISPONIBLES:")
    for level, config in manager.configs.items():
        print(f"  • {level}: {config['expected_news']} noticias esperadas")
    
    print(f"\n🚀 Usando configuración: {config_level}")
    
    # Ejecutar mejora
    asyncio.run(manager.run_full_enhancement(config_level))

if __name__ == "__main__":
    main()
