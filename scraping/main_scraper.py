import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime
import logging
import os

# Configurar logging PRIMERO antes de usarlo
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Intentar importar scraper tradicional de El Comercio (opcional, solo como fallback)
try:
    from scraper_comercio import ScraperComercio
    COMERCIO_TRADITIONAL_AVAILABLE = True
except ImportError:
    COMERCIO_TRADITIONAL_AVAILABLE = False
    ScraperComercio = None
    logging.debug("ScraperComercio tradicional no disponible (opcional)")

# Intentar importar scraper de El Comercio con Selenium primero
try:
    from scraper_comercio_selenium import ScraperComercioSelenium, SELENIUM_AVAILABLE as COMERCIO_SELENIUM_AVAILABLE
    if COMERCIO_SELENIUM_AVAILABLE:
        COMERCIO_SCRAPER_CLASS = ScraperComercioSelenium
        COMERCIO_SCRAPER_TYPE = "Selenium"
        logging.info("✅ Usando ScraperComercio con Selenium")
    else:
        raise ImportError("Selenium no disponible")
except (ImportError, AttributeError) as e:
    COMERCIO_SCRAPER_CLASS = None
    COMERCIO_SCRAPER_TYPE = "BeautifulSoup"
    logging.info("⚠️ ScraperComercio con Selenium no disponible, usando BeautifulSoup")

# Intentar importar scraper de El Popular con Selenium primero
try:
    from scraper_popular_selenium import ScraperPopularSelenium, SELENIUM_AVAILABLE as POPULAR_SELENIUM_AVAILABLE
    if POPULAR_SELENIUM_AVAILABLE:
        POPULAR_SCRAPER_CLASS = ScraperPopularSelenium
        POPULAR_SCRAPER_TYPE = "Selenium"
        logging.info("✅ Usando ScraperPopular con Selenium")
    else:
        raise ImportError("Selenium no disponible")
except ImportError:
    # Fallback al scraper tradicional
    try:
        from scraper_popular_improved import ScraperPopularImproved
        POPULAR_SCRAPER_CLASS = ScraperPopularImproved
        POPULAR_SCRAPER_TYPE = "BeautifulSoup"
        logging.info("⚠️ Usando ScraperPopular tradicional (BeautifulSoup)")
    except ImportError:
        POPULAR_SCRAPER_CLASS = None
        POPULAR_SCRAPER_TYPE = None
        logging.error("❌ No se pudo importar ningún scraper de El Popular")

# Intentar importar scraper de Correo con Selenium primero
try:
    from scraper_correo_selenium import ScraperCorreoSelenium, SELENIUM_AVAILABLE as CORREO_SELENIUM_AVAILABLE
    if CORREO_SELENIUM_AVAILABLE:
        CORREO_SCRAPER_CLASS = ScraperCorreoSelenium
        CORREO_SCRAPER_TYPE = "Selenium"
        logging.info("✅ Usando ScraperCorreo con Selenium")
    else:
        raise ImportError("Selenium no disponible")
except ImportError:
    # Fallback al scraper tradicional
    try:
        from scraper_correo_optimized import ScraperCorreoOptimized
        CORREO_SCRAPER_CLASS = ScraperCorreoOptimized
        CORREO_SCRAPER_TYPE = "BeautifulSoup"
        logging.info("⚠️ Usando ScraperCorreo tradicional (BeautifulSoup)")
    except ImportError:
        CORREO_SCRAPER_CLASS = None
        CORREO_SCRAPER_TYPE = None
        logging.error("❌ No se pudo importar ningún scraper de Correo")
from scraper_twitter import ScraperTwitter
from scraper_facebook import ScraperFacebook
from scraper_instagram import ScraperInstagram
from scraper_youtube import ScraperYouTube

# Intentar importar scraper de CNN con Selenium primero (mejor para contenido dinámico)
try:
    from scraper_cnn_selenium import ScraperCNNSelenium, SELENIUM_AVAILABLE
    if SELENIUM_AVAILABLE:
        CNN_SCRAPER_CLASS = ScraperCNNSelenium
        CNN_SCRAPER_TYPE = "Selenium"
        logging.info("✅ Usando ScraperCNN con Selenium (mejor para contenido dinámico)")
    else:
        raise ImportError("Selenium no disponible")
except ImportError:
    # Fallback al scraper tradicional si Selenium no está disponible
    try:
        from scraper_cnn_final import ScraperCNNFinal
        CNN_SCRAPER_CLASS = ScraperCNNFinal
        CNN_SCRAPER_TYPE = "BeautifulSoup"
        logging.warning("⚠️ Selenium no disponible, usando scraper tradicional (puede no funcionar con CNN)")
    except ImportError:
        CNN_SCRAPER_CLASS = None
        CNN_SCRAPER_TYPE = None
        logging.error("❌ No se pudo importar ningún scraper de CNN")

# Importar scrapers con Selenium para redes sociales (si existen)
try:
    from scraper_facebook_selenium import ScraperFacebookSelenium
    from scraper_twitter_selenium import ScraperTwitterSelenium
    from scraper_instagram_selenium import ScraperInstagramSelenium
    from scraper_youtube_selenium import ScraperYouTubeSelenium
    HAS_SELENIUM_SCRAPERS = True
except ImportError:
    HAS_SELENIUM_SCRAPERS = False

class MainScraper:
    def __init__(self):
        # Inicializar scraper de CNN (Selenium si está disponible, sino tradicional)
        cnn_scraper = None
        if CNN_SCRAPER_CLASS:
            try:
                cnn_scraper = CNN_SCRAPER_CLASS()
                logging.info(f"✅ Scraper CNN inicializado ({CNN_SCRAPER_TYPE})")
            except Exception as e:
                logging.error(f"❌ Error inicializando scraper CNN: {e}")
                cnn_scraper = None
        
        # Inicializar scraper de Correo (Selenium si está disponible, sino tradicional)
        correo_scraper = None
        if CORREO_SCRAPER_CLASS:
            try:
                correo_scraper = CORREO_SCRAPER_CLASS()
                logging.info(f"✅ Scraper Correo inicializado ({CORREO_SCRAPER_TYPE})")
            except Exception as e:
                logging.error(f"❌ Error inicializando scraper Correo: {e}")
                correo_scraper = None
        
        # Inicializar scraper de El Popular (Selenium si está disponible, sino tradicional)
        popular_scraper = None
        if POPULAR_SCRAPER_CLASS:
            try:
                popular_scraper = POPULAR_SCRAPER_CLASS()
                logging.info(f"✅ Scraper Popular inicializado ({POPULAR_SCRAPER_TYPE})")
            except Exception as e:
                logging.error(f"❌ Error inicializando scraper Popular: {e}")
                # Intentar fallback si Selenium falla
                if POPULAR_SCRAPER_TYPE == "Selenium":
                    try:
                        from scraper_popular_improved import ScraperPopularImproved
                        popular_scraper = ScraperPopularImproved()
                        logging.warning("⚠️ Fallback a ScraperPopular tradicional (BeautifulSoup)")
                    except Exception as e2:
                        logging.error(f"❌ Error en fallback de Popular: {e2}")
                        popular_scraper = None
                else:
                    popular_scraper = None
        
        # Inicializar scraper de El Comercio (Selenium si está disponible, sino tradicional)
        comercio_scraper = None
        if COMERCIO_SCRAPER_CLASS:
            try:
                comercio_scraper = COMERCIO_SCRAPER_CLASS()
                logging.info(f"✅ Scraper Comercio inicializado ({COMERCIO_SCRAPER_TYPE})")
            except Exception as e:
                logging.error(f"❌ Error inicializando scraper Comercio: {e}")
                # Intentar fallback si Selenium falla
                if COMERCIO_SCRAPER_TYPE == "Selenium" and COMERCIO_TRADITIONAL_AVAILABLE and ScraperComercio:
                    try:
                        comercio_scraper = ScraperComercio()
                        logging.warning("⚠️ Fallback a ScraperComercio tradicional (BeautifulSoup)")
                    except Exception as e2:
                        logging.error(f"❌ Error en fallback de Comercio: {e2}")
                        comercio_scraper = None
                else:
                    comercio_scraper = None
            else:
                # Si no hay scraper con Selenium, usar el tradicional si está disponible
                if COMERCIO_TRADITIONAL_AVAILABLE and ScraperComercio:
                    try:
                        comercio_scraper = ScraperComercio()
                        logging.info("✅ Scraper Comercio inicializado (BeautifulSoup)")
                    except Exception as e:
                        logging.error(f"❌ Error inicializando scraper Comercio tradicional: {e}")
                        comercio_scraper = None
                else:
                    logging.warning("⚠️ ScraperComercio tradicional no disponible")
                    comercio_scraper = None
        
        self.scrapers = {}
        
        # Agregar Comercio solo si se pudo inicializar
        if comercio_scraper:
            self.scrapers['comercio'] = comercio_scraper
        else:
            logging.warning("⚠️ Scraper de Comercio no disponible - se omitirá en el scraping")
        
        # Agregar Popular solo si se pudo inicializar
        if popular_scraper:
            self.scrapers['popular'] = popular_scraper
        else:
            logging.warning("⚠️ Scraper de Popular no disponible - se omitirá en el scraping")
        
        # Agregar Correo solo si se pudo inicializar
        if correo_scraper:
            self.scrapers['correo'] = correo_scraper
        else:
            logging.warning("⚠️ Scraper de Correo no disponible - se omitirá en el scraping")
        
        # Agregar CNN solo si se pudo inicializar
        if cnn_scraper:
            self.scrapers['cnn'] = cnn_scraper
        else:
            logging.warning("⚠️ Scraper de CNN no disponible - se omitirá en el scraping")
        
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
