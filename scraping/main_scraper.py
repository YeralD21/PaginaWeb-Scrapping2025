import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scraper_correo_optimized import ScraperCorreoOptimized
from scraper_comercio import ScraperComercio
from scraper_popular_improved import ScraperPopularImproved
from scraper_cnn_final import ScraperCNNFinal
from scraper_twitter import ScraperTwitter
from scraper_facebook import ScraperFacebook
from scraper_instagram import ScraperInstagram
from scraper_youtube import ScraperYouTube

# Importar scrapers con Selenium (si existen)
try:
    from scraper_facebook_selenium import ScraperFacebookSelenium
    from scraper_twitter_selenium import ScraperTwitterSelenium
    from scraper_instagram_selenium import ScraperInstagramSelenium
    from scraper_youtube_selenium import ScraperYouTubeSelenium
    HAS_SELENIUM_SCRAPERS = True
except ImportError:
    HAS_SELENIUM_SCRAPERS = False

from datetime import datetime
import logging
import os

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class MainScraper:
    def __init__(self):
        self.scrapers = {
            'correo': ScraperCorreoOptimized(),
            'comercio': ScraperComercio(),
            'popular': ScraperPopularImproved(),
            'cnn': ScraperCNNFinal()
        }
        
        # Scrapers de redes sociales (usar Selenium si está disponible, si no usar mock)
        use_selenium = HAS_SELENIUM_SCRAPERS and os.getenv('USE_SELENIUM', 'False').lower() == 'true'
        
        if use_selenium:
            logging.info("🚀 Usando Selenium para scraping REAL de redes sociales")
            self.social_scrapers = {
                'twitter': ScraperTwitterSelenium(),
                'facebook': ScraperFacebookSelenium(),
                'instagram': ScraperInstagramSelenium(),
                'youtube': ScraperYouTubeSelenium()
            }
            self.use_real_scraping = True
        else:
            logging.info("📦 Usando scrapers MOCK para redes sociales (configura USE_SELENIUM=true para usar Selenium)")
            self.social_scrapers = {
                'twitter': ScraperTwitter(),
                'facebook': ScraperFacebook(),
                'instagram': ScraperInstagram(),
                'youtube': ScraperYouTube()
            }
            self.use_real_scraping = False
    
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
    
    def scrape_social_media(self):
        """Ejecuta el scraping solo de redes sociales"""
        all_news = []
        
        for name, scraper in self.social_scrapers.items():
            try:
                logging.info(f"Iniciando scraping de {name}")
                # Los scrapers Selenium tienen parámetro use_real, los mock no
                if hasattr(scraper, 'get_all_news') and self.use_real_scraping:
                    news = scraper.get_all_news(use_real=self.use_real_scraping)
                else:
                    news = scraper.get_all_news()
                all_news.extend(news)
                logging.info(f"Scraping de {name} completado. Noticias obtenidas: {len(news)}")
            except Exception as e:
                logging.error(f"Error en scraping de {name}: {e}")
                continue
        
        logging.info(f"Scraping de redes sociales completado. Total de noticias: {len(all_news)}")
        return all_news
    
    def scrape_all_sources(self):
        """Ejecuta el scraping de todas las fuentes (diarios + redes sociales)"""
        all_news = []
        
        # Scrapear diarios tradicionales
        all_news.extend(self.scrape_all())
        
        # Scrapear redes sociales
        all_news.extend(self.scrape_social_media())
        
        logging.info(f"Scraping completo de todas las fuentes: {len(all_news)} noticias")
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
