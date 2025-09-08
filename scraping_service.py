import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

from scraping.main_scraper import MainScraper
from backend.database import get_db
from backend.models import Noticia, Diario
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def save_news_to_database(news_list):
    """Guarda las noticias en la base de datos"""
    db = next(get_db())
    try:
        saved_count = 0
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
                logging.info(f"Noticia ya existe: {news_item['titulo']}")
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
        logging.info(f"Guardadas {saved_count} noticias en la base de datos")
        return saved_count
        
    except Exception as e:
        logging.error(f"Error guardando noticias: {e}")
        db.rollback()
        return 0
    finally:
        db.close()

def main():
    """Función principal para ejecutar scraping y guardar en BD"""
    logging.info("Iniciando scraping y guardado en base de datos...")
    
    # Ejecutar scraping
    main_scraper = MainScraper()
    all_news = main_scraper.scrape_all()
    
    if not all_news:
        logging.warning("No se obtuvieron noticias del scraping")
        return
    
    # Guardar en base de datos
    saved_count = save_news_to_database(all_news)
    
    # Mostrar estadísticas
    stats = main_scraper.get_comparative_stats()
    print("\n=== ESTADÍSTICAS COMPARATIVAS ===")
    for diario, categorias in stats.items():
        print(f"\n{diario.upper()}:")
        for categoria, cantidad in categorias.items():
            print(f"  {categoria}: {cantidad} noticias")
    
    print(f"\n=== RESUMEN ===")
    print(f"Noticias extraídas: {len(all_news)}")
    print(f"Noticias guardadas en BD: {saved_count}")
    
    # Verificar total en BD
    db = next(get_db())
    total_in_db = db.query(Noticia).count()
    db.close()
    print(f"Total noticias en BD: {total_in_db}")

if __name__ == "__main__":
    main()
