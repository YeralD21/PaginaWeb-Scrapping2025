"""
Scraper avanzado para CNN en Español usando Selenium
Requiere: pip install selenium
Y descargar ChromeDriver desde: https://chromedriver.chromium.org/
"""

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

from bs4 import BeautifulSoup
from typing import List, Dict, Optional, Set
from datetime import datetime, timedelta
import logging
import re
import time
import random
from urllib.parse import urljoin, urlparse

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class ScraperCNNSelenium:
    def __init__(self):
        if not SELENIUM_AVAILABLE:
            raise ImportError("Selenium no está instalado. Ejecuta: pip install selenium")
        
        self.base_url = "https://cnnespanol.cnn.com"
        self.driver = None
        self.processed_urls: Set[str] = set()
        self.processed_images: Set[str] = set()
        
        # Configuración de secciones
        self.sections = {
            'mundo': [
                f"{self.base_url}/",
                f"{self.base_url}/mundo/",
                f"{self.base_url}/categoria/mundo/"
            ],
            'deportes': [
                f"{self.base_url}/deportes/",
                f"{self.base_url}/categoria/deportes/"
            ],
            'economia': [
                f"{self.base_url}/economia/",
                f"{self.base_url}/categoria/economia/"
            ]
        }

    def _init_driver(self):
        """Inicializa el driver de Chrome con opciones optimizadas"""
        if self.driver:
            return
        
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # Ejecutar sin ventana
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Deshabilitar imágenes para mayor velocidad (opcional)
        # chrome_options.add_argument('--blink-settings=imagesEnabled=false')
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_page_load_timeout(30)
            self.driver.implicitly_wait(10)
            logging.info("✅ Driver de Chrome inicializado")
        except Exception as e:
            logging.error(f"❌ Error inicializando Chrome driver: {e}")
            logging.error("Asegúrate de tener ChromeDriver instalado y en PATH")
            raise

    def _close_driver(self):
        """Cierra el driver"""
        if self.driver:
            self.driver.quit()
            self.driver = None

    def _load_page_with_js(self, url: str, wait_seconds: int = 5) -> bool:
        """Carga una página y espera a que se ejecute JavaScript"""
        try:
            logging.info(f"🔍 Cargando página: {url}")
            self.driver.get(url)
            
            # Esperar a que se cargue el contenido
            time.sleep(wait_seconds)
            
            # Intentar hacer scroll para cargar contenido lazy
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(2)
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            return True
            
        except TimeoutException:
            logging.warning(f"Timeout cargando {url}")
            return False
        except Exception as e:
            logging.error(f"Error cargando {url}: {e}")
            return False

    def _extract_article_links_selenium(self, url: str) -> List[str]:
        """Extrae enlaces de artículos usando Selenium"""
        if not self._load_page_with_js(url):
            return []
        
        article_links = set()
        
        # Selectores para enlaces de artículos
        selectors = [
            'a[href*="/2025/"]',
            'a[href*="/2024/"]',
            'a[data-link-type="article"]',
            '.headline a',
            '.story a',
            '.card a',
            'article a',
            'h1 a', 'h2 a', 'h3 a',
            '.media a',
            '.news-item a'
        ]
        
        for selector in selectors:
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    href = element.get_attribute('href')
                    if href and self._is_valid_article_url(href):
                        article_links.add(href)
            except Exception as e:
                logging.debug(f"Error con selector {selector}: {e}")
        
        # También buscar en el HTML renderizado
        page_source = self.driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')
        
        all_links = soup.find_all('a', href=True)
        for link in all_links:
            href = link['href']
            if href.startswith('/'):
                href = self.base_url + href
            elif not href.startswith('http'):
                continue
            
            if self._is_valid_article_url(href):
                article_links.add(href)
        
        return list(article_links)

    def _is_valid_article_url(self, url: str) -> bool:
        """Verifica si una URL es válida para artículos"""
        if not url or 'cnnespanol.cnn.com' not in url:
            return False
        
        # Debe contener fecha o ser un artículo válido
        if not (re.search(r'/20(24|25)/', url) or 'noticia' in url.lower()):
            return False
        
        # Filtrar URLs no deseadas
        invalid_patterns = [
            '/video/', '/videos/', '/gallery/', '/galerias/',
            '/live/', '/en-vivo/', '/podcast/', '/audio/',
            '/author/', '/autor/', '/tag/', '/tags/',
            '/search/', '/buscar/', '/category/', '/categoria/',
            '/page/', '/pagina/', '/feed/', '/rss/',
            '.jpg', '.png', '.gif', '.pdf',
            '#', 'javascript:', 'mailto:',
            'facebook.com', 'twitter.com', 'instagram.com'
        ]
        
        url_lower = url.lower()
        for pattern in invalid_patterns:
            if pattern in url_lower:
                return False
        
        return True

    def _extract_article_data_selenium(self, article_url: str) -> Optional[Dict]:
        """Extrae datos de un artículo usando Selenium"""
        if article_url in self.processed_urls:
            return None
        
        if not self._load_page_with_js(article_url, wait_seconds=3):
            return None
        
        try:
            # Obtener el HTML renderizado
            page_source = self.driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Extraer título
            title = self._extract_title_selenium(soup)
            if not title or len(title) < 10:
                logging.warning(f"Título inválido en {article_url}")
                return None
            
            # Extraer resumen
            summary = self._extract_summary_selenium(soup)
            
            # Extraer imagen
            image_url = self._extract_image_selenium(soup)
            
            # Extraer fecha
            published_at = self._extract_date_selenium(soup, article_url)
            
            # Determinar categoría
            category = self._determine_category(article_url)
            
            self.processed_urls.add(article_url)
            
            return {
                'titulo': title,
                'contenido': summary if summary else f"Noticia de {category} de CNN en Español.",
                'enlace': article_url,
                'imagen_url': image_url,
                'categoria': category,
                'diario': 'CNN en Español',
                'fecha_publicacion': published_at or datetime.now().isoformat(),
                'fecha_extraccion': datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Error extrayendo datos de {article_url}: {e}")
            return None

    def _extract_title_selenium(self, soup: BeautifulSoup) -> str:
        """Extrae título del artículo"""
        selectors = [
            'h1.pg-headline',
            'h1[data-testid="headline"]',
            'h1.headline',
            'h1.Article__title',
            'h1',
            'meta[property="og:title"]',
            'title'
        ]
        
        for selector in selectors:
            if selector.startswith('meta') or selector == 'title':
                element = soup.select_one(selector)
                if element:
                    if selector.startswith('meta'):
                        title = element.get('content', '').strip()
                    else:
                        title = element.get_text(strip=True)
                    
                    if len(title) > 10:
                        return self._clean_title(title)
            else:
                element = soup.select_one(selector)
                if element:
                    title = element.get_text(strip=True)
                    if len(title) > 10:
                        return self._clean_title(title)
        
        return ""

    def _extract_summary_selenium(self, soup: BeautifulSoup) -> str:
        """Extrae resumen del artículo"""
        selectors = [
            'meta[property="og:description"]',
            'meta[name="description"]',
            '.pg-summary',
            '.Article__subtitle',
            '.summary',
            '.excerpt',
            '.lead'
        ]
        
        for selector in selectors:
            if selector.startswith('meta'):
                element = soup.select_one(selector)
                if element and element.get('content'):
                    summary = element['content'].strip()
                    if 20 < len(summary) < 500:
                        return summary
            else:
                element = soup.select_one(selector)
                if element:
                    summary = element.get_text(strip=True)
                    if 20 < len(summary) < 500:
                        return summary
        
        # Primer párrafo
        first_p = soup.select_one('.pg-rail-tall__body p, .Article__content p, article p')
        if first_p:
            summary = first_p.get_text(strip=True)
            if 20 < len(summary) < 500:
                return summary
        
        return ""

    def _extract_image_selenium(self, soup: BeautifulSoup) -> str:
        """Extrae imagen principal"""
        # Meta tags primero
        meta_img = soup.select_one('meta[property="og:image"]')
        if meta_img and meta_img.get('content'):
            img_url = meta_img['content']
            if self._is_valid_image_url(img_url):
                return self._normalize_image_url(img_url)
        
        # Imágenes en el contenido
        img_selectors = [
            '.pg-rail-tall__head img',
            '.Article__media img',
            '.hero-image img',
            'figure img',
            '.media img',
            '.pg-rail-tall__body img:first-of-type'
        ]
        
        for selector in img_selectors:
            img = soup.select_one(selector)
            if img:
                img_url = img.get('data-src') or img.get('src')
                if img_url and self._is_valid_image_url(img_url):
                    return self._normalize_image_url(img_url)
        
        return "No Image"

    def _extract_date_selenium(self, soup: BeautifulSoup, url: str) -> Optional[str]:
        """Extrae fecha de publicación"""
        # Meta tags
        meta_date = soup.select_one('meta[property="article:published_time"]')
        if meta_date and meta_date.get('content'):
            return meta_date['content']
        
        # Elemento time
        time_elem = soup.select_one('time[datetime]')
        if time_elem and time_elem.get('datetime'):
            return time_elem['datetime']
        
        # Extraer de URL
        date_match = re.search(r'/(\d{4})/(\d{2})/(\d{2})/', url)
        if date_match:
            year, month, day = date_match.groups()
            return f"{year}-{month}-{day}"
        
        return None

    def _determine_category(self, url: str) -> str:
        """Determina categoría desde URL"""
        url_lower = url.lower()
        
        if any(word in url_lower for word in ['mundo', 'internacional', 'americas']):
            return 'Mundo'
        elif any(word in url_lower for word in ['deportes', 'futbol', 'tenis']):
            return 'Deportes'
        elif any(word in url_lower for word in ['economia', 'negocios', 'finanzas']):
            return 'Economía'
        elif any(word in url_lower for word in ['tecnologia', 'ciencia', 'salud']):
            return 'Tecnología'
        elif any(word in url_lower for word in ['opinion', 'analisis']):
            return 'Opinión'
        
        return 'Sin categoría'

    def _is_valid_image_url(self, url: str) -> bool:
        """Valida URL de imagen"""
        if not url or url == "No Image":
            return False
        
        invalid_patterns = ['logo', 'icon', 'avatar', 'placeholder', 'ad-', 'banner']
        url_lower = url.lower()
        
        for pattern in invalid_patterns:
            if pattern in url_lower:
                return False
        
        return any(ext in url_lower for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif']) or 'image' in url_lower

    def _normalize_image_url(self, url: str) -> str:
        """Normaliza URL de imagen"""
        if not url:
            return "No Image"
        
        if url.startswith('//'):
            url = 'https:' + url
        elif url.startswith('/'):
            url = self.base_url + url
        
        if url in self.processed_images:
            return "No Image"
        
        self.processed_images.add(url)
        return url

    def _clean_title(self, title: str) -> str:
        """Limpia título"""
        unwanted = ['- CNN en Español', '| CNN en Español', 'CNN en Español', '- CNN', '| CNN']
        for unwanted_text in unwanted:
            title = title.replace(unwanted_text, '')
        return title.strip()

    def scrape_section(self, section_name: str, max_articles: int = 20) -> List[Dict]:
        """Extrae noticias de una sección"""
        if section_name not in self.sections:
            logging.error(f"Sección '{section_name}' no encontrada")
            return []
        
        logging.info(f"🔍 Iniciando scraping de sección: {section_name}")
        articles = []
        
        for section_url in self.sections[section_name]:
            logging.info(f"📄 Procesando: {section_url}")
            
            # Extraer enlaces
            article_links = self._extract_article_links_selenium(section_url)
            logging.info(f"📰 Encontrados {len(article_links)} enlaces")
            
            # Procesar artículos
            for link in article_links[:max_articles//len(self.sections[section_name])]:
                if len(articles) >= max_articles:
                    break
                
                article_data = self._extract_article_data_selenium(link)
                if article_data:
                    articles.append(article_data)
                
                # Delay entre artículos
                time.sleep(random.uniform(1, 3))
            
            if len(articles) >= max_articles:
                break
            
            # Delay entre secciones
            time.sleep(2)
        
        logging.info(f"✅ Sección {section_name} completada: {len(articles)} artículos")
        return articles

    def get_all_news(self, max_articles_per_section: int = 15) -> List[Dict]:
        """Método principal compatible con el sistema existente"""
        self.processed_urls.clear()
        self.processed_images.clear()
        
        try:
            self._init_driver()
            
            all_news = []
            for section_name in self.sections.keys():
                try:
                    articles = self.scrape_section(section_name, max_articles_per_section)
                    all_news.extend(articles)
                    time.sleep(3)  # Delay entre secciones
                except Exception as e:
                    logging.error(f"Error en sección {section_name}: {e}")
            
            logging.info(f"🎉 Scraping completado: {len(all_news)} noticias totales")
            return all_news
            
        finally:
            self._close_driver()

if __name__ == "__main__":
    if not SELENIUM_AVAILABLE:
        print("❌ Selenium no está instalado.")
        print("Para usar este scraper, instala Selenium:")
        print("pip install selenium")
        print("Y descarga ChromeDriver desde: https://chromedriver.chromium.org/")
        exit(1)
    
    scraper = ScraperCNNSelenium()
    
    print("🚀 Iniciando scraping con Selenium...")
    try:
        all_news = scraper.get_all_news(max_articles_per_section=10)
        
        # Estadísticas
        print(f"\n📊 RESULTADOS:")
        print(f"Total noticias: {len(all_news)}")
        
        categories = {}
        images_count = 0
        for news in all_news:
            cat = news['categoria']
            categories[cat] = categories.get(cat, 0) + 1
            if news['imagen_url'] != 'No Image':
                images_count += 1
        
        print(f"Con imágenes: {images_count}")
        print(f"Sin imágenes: {len(all_news) - images_count}")
        
        print("\n📈 Por categoría:")
        for cat, count in categories.items():
            print(f"  {cat}: {count} noticias")
        
        # Ejemplos
        print(f"\n📋 Ejemplos:")
        for i, news in enumerate(all_news[:3]):
            print(f"{i+1}. [{news['categoria']}] {news['titulo'][:60]}...")
            print(f"   Imagen: {'Sí' if news['imagen_url'] != 'No Image' else 'No'}")
            print(f"   URL: {news['enlace']}")
            print()
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Asegúrate de tener ChromeDriver instalado y configurado correctamente.")
