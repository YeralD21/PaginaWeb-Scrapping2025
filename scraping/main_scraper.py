import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scraper_correo import ScraperCorreo
from scraper_comercio import ScraperComercio
from scraper_popular import ScraperPopular
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class MainScraper:
    def __init__(self):
        self.scrapers = {
            'correo': ScraperCorreo(),
            'comercio': ScraperComercio(),
            'popular': ScraperPopular()
        }
    
    def scrape_all(self):
        """Ejecuta el scraping de todos los diarios"""
        all_news = []
        
        for name, scraper in self.scrapers.items():
            try:
                logging.info(f"Iniciando scraping de {name}")
                news = scraper.get_all_news()
                all_news.extend(news)
                logging.info(f"Scraping de {name} completado. Noticias obtenidas: {len(news)}")
            except Exception as e:
                logging.error(f"Error en scraping de {name}: {e}")
                continue
        
        logging.info(f"Scraping total completado. Total de noticias: {len(all_news)}")
        return all_news
    
    def get_news_by_category(self, category):
        """Obtiene noticias de una categoría específica de todos los diarios"""
        all_news = []
        
        for name, scraper in self.scrapers.items():
            try:
                if hasattr(scraper, f'get_{category.lower()}'):
                    method = getattr(scraper, f'get_{category.lower()}')
                    news = method()
                    all_news.extend(news)
                    logging.info(f"Noticias de {category} de {name}: {len(news)}")
                else:
                    logging.warning(f"El diario {name} no tiene la categoría {category}")
            except Exception as e:
                logging.error(f"Error obteniendo {category} de {name}: {e}")
                continue
        
        return all_news
    
    def get_comparative_stats(self):
        """Obtiene estadísticas comparativas por diario y categoría"""
        stats = {}
        
        for name, scraper in self.scrapers.items():
            stats[name] = {}
            try:
                news = scraper.get_all_news()
                for noticia in news:
                    categoria = noticia['categoria']
                    if categoria not in stats[name]:
                        stats[name][categoria] = 0
                    stats[name][categoria] += 1
            except Exception as e:
                logging.error(f"Error obteniendo estadísticas de {name}: {e}")
                stats[name] = {'error': str(e)}
        
        return stats

if __name__ == "__main__":
    main_scraper = MainScraper()
    
    # Ejecutar scraping completo
    all_news = main_scraper.scrape_all()
    
    # Mostrar estadísticas
    stats = main_scraper.get_comparative_stats()
    print("\n=== ESTADÍSTICAS COMPARATIVAS ===")
    for diario, categorias in stats.items():
        print(f"\n{diario.upper()}:")
        for categoria, cantidad in categorias.items():
            print(f"  {categoria}: {cantidad} noticias")
    
    # Mostrar algunas noticias de ejemplo
    print(f"\n=== MUESTRA DE NOTICIAS ({len(all_news)} total) ===")
    for i, noticia in enumerate(all_news[:5]):
        print(f"{i+1}. [{noticia['diario']}] {noticia['categoria']}: {noticia['titulo']}")
