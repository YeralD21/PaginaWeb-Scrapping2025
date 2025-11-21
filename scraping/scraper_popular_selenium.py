"""
Scraper para El Popular usando Selenium
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
from datetime import datetime
import logging
import re
import time
import random
from urllib.parse import urljoin, urlparse, urlunparse
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend'))
from date_extraction_utils import get_publication_date

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ScraperPopularSelenium:
    def __init__(self):
        if not SELENIUM_AVAILABLE:
            raise ImportError("Selenium no está instalado. Ejecuta: pip install selenium")
        
        self.base_url = "https://elpopular.pe"
        self.driver = None
        self.processed_urls: Set[str] = set()
        self.processed_images: Set[str] = set()  # Rastrear imágenes usadas para evitar duplicados
        
        # Configuración de secciones
        self.sections = {
            'deportes': [
                f"{self.base_url}/deportes/",
                f"{self.base_url}/futbol/",
                f"{self.base_url}/deportes/futbol/",
                f"{self.base_url}/deportes/otros-deportes/"
            ],
            'espectaculos': [
                f"{self.base_url}/espectaculos/",
                f"{self.base_url}/entretenimiento/",
                f"{self.base_url}/espectaculos/farandula/"
            ],
            'mundo': [
                f"{self.base_url}/mundo/",
                f"{self.base_url}/internacional/",
                f"{self.base_url}/mundo/internacional/"
            ]
        }

    def _init_driver(self):
        """Inicializa el driver de Chrome con opciones optimizadas"""
        if self.driver:
            return
        
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_page_load_timeout(30)
            self.driver.implicitly_wait(10)
            logger.info("✅ Driver de Chrome inicializado para El Popular")
        except Exception as e:
            logger.error(f"❌ Error inicializando Chrome driver: {e}")
            raise

    def _close_driver(self):
        """Cierra el driver"""
        if self.driver:
            self.driver.quit()
            self.driver = None

    def _load_page_with_js(self, url: str, wait_seconds: int = 5) -> bool:
        """Carga una página y espera a que se ejecute JavaScript"""
        try:
            logger.info(f"🔍 Cargando página El Popular: {url}")
            self.driver.get(url)
            
            time.sleep(wait_seconds)
            
            # Scroll para cargar contenido lazy
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(2)
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1)
            
            return True
        except Exception as e:
            logger.error(f"Error cargando página {url}: {e}")
            return False

    def _normalize_url(self, url: str) -> str:
        """Normaliza una URL eliminando parámetros de consulta y fragmentos"""
        if not url:
            return ""
        try:
            parsed = urlparse(url)
            normalized = urlunparse((
                parsed.scheme,
                parsed.netloc,
                parsed.path,
                parsed.params,
                '',  # Sin query params
                ''   # Sin fragment
            ))
            return normalized.rstrip('/')
        except Exception:
            return url

    def _is_valid_article_url(self, url: str) -> bool:
        """Verifica si una URL es válida para un artículo"""
        if not url or 'elpopular.pe' not in url:
            return False
        
        # Excluir URLs que no son artículos
        excluded_patterns = [
            '/tag/',
            '/author/',
            '/category/',
            '/page/',
            '/search',
            '/wp-admin',
            '/wp-content',
            '/feed',
            '.jpg',
            '.png',
            '.gif',
            '.pdf',
            '#',
            'javascript:'
        ]
        
        for pattern in excluded_patterns:
            if pattern in url.lower():
                return False
        
        # Debe tener al menos una estructura de artículo
        if len(url.split('/')) < 4:
            return False
        
        return True

    def _extract_article_links_selenium(self, section_url: str) -> List[str]:
        """Extrae enlaces de artículos usando Selenium"""
        article_links = []
        
        if not self._load_page_with_js(section_url, wait_seconds=5):
            return []
        
        try:
            page_source = self.driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Buscar enlaces de artículos
            links = soup.find_all('a', href=True)
            
            for link in links:
                href = link.get('href', '').strip()
                if not href:
                    continue
                
                # Construir URL completa
                if href.startswith('/'):
                    full_url = self.base_url + href
                elif href.startswith('http') and 'elpopular.pe' in href:
                    full_url = href
                else:
                    continue
                
                # Normalizar URL
                normalized = self._normalize_url(full_url)
                
                # Validar URL de artículo
                if self._is_valid_article_url(normalized):
                    if normalized not in self.processed_urls:
                        article_links.append(normalized)
            
            # Eliminar duplicados manteniendo orden
            seen = set()
            unique_links = []
            for link in article_links:
                if link not in seen:
                    seen.add(link)
                    unique_links.append(link)
            
            logger.info(f"📰 Encontrados {len(unique_links)} artículos únicos en {section_url}")
            return unique_links[:30]  # Limitar a 30 artículos por sección
            
        except Exception as e:
            logger.error(f"Error extrayendo enlaces de {section_url}: {e}")
            return []

    def _is_valid_image_url(self, url: str) -> bool:
        """Verifica si una URL de imagen es válida"""
        if not url or len(url) < 10:
            return False
        
        # Normalizar URL de imagen para comparación (usa método específico para imágenes)
        normalized = self._normalize_image_url(url)
        
        # Verificar si ya fue usada
        if normalized in self.processed_images:
            logger.debug(f"⚠️ Imagen duplicada detectada: {normalized[:60]}...")
            return False
        
        # Verificar extensiones válidas
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        url_lower = url.lower()
        
        if not any(ext in url_lower for ext in valid_extensions):
            return False
        
        # Excluir imágenes pequeñas o de baja calidad
        excluded_patterns = [
            'logo',
            'icon',
            'avatar',
            'thumbnail',
            'thumb',
            'placeholder',
            '1x1',
            'pixel'
        ]
        
        for pattern in excluded_patterns:
            if pattern in url_lower:
                return False
        
        return True

    def _normalize_image_url(self, url: str) -> str:
        """Normaliza una URL de imagen para comparación"""
        if not url:
            return ""
        try:
            parsed = urlparse(url)
            # Remover parámetros de tamaño y calidad
            path = parsed.path
            # Remover parámetros comunes de imágenes (ej: imagen-300x200.jpg -> imagen.jpg)
            path = re.sub(r'-\d+x\d+\.(jpg|jpeg|png|gif|webp)$', r'.\1', path, flags=re.IGNORECASE)
            
            normalized = urlunparse((
                parsed.scheme,
                parsed.netloc,
                path,
                '',
                '',  # Sin query params
                ''
            ))
            return normalized.rstrip('/')
        except Exception:
            return url.split('?')[0].split('#')[0]

    def _extract_image_selenium(self, soup: BeautifulSoup, article_url: str = None) -> Optional[str]:
        """Extrae la imagen principal de un artículo usando Selenium"""
        if not soup:
            return None
        
        # Selectores específicos de El Popular
        image_selectors = [
            'meta[property="og:image"]',
            'meta[name="twitter:image"]',
            'img.article-image',
            'img.wp-post-image',
            'article img',
            '.entry-content img',
            '.article-content img',
            'figure img',
            '.post-thumbnail img'
        ]
        
        for selector in image_selectors:
            try:
                if selector.startswith('meta'):
                    meta = soup.select_one(selector)
                    if meta:
                        image_url = meta.get('content', '')
                        if image_url and self._is_valid_image_url(image_url):
                            normalized = self._normalize_image_url(image_url)
                            if normalized not in self.processed_images:
                                self.processed_images.add(normalized)
                                return image_url
                else:
                    img = soup.select_one(selector)
                    if img:
                        # Probar src primero
                        image_url = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                        if image_url:
                            # Construir URL completa si es relativa
                            if image_url.startswith('/'):
                                image_url = self.base_url + image_url
                            elif not image_url.startswith('http'):
                                if article_url:
                                    image_url = urljoin(article_url, image_url)
                            
                            if self._is_valid_image_url(image_url):
                                normalized = self._normalize_image_url(image_url)
                                if normalized not in self.processed_images:
                                    self.processed_images.add(normalized)
                                    return image_url
            except Exception as e:
                logger.debug(f"Error con selector {selector}: {e}")
                continue
        
        return None

    def _extract_content_selenium(self, soup: BeautifulSoup) -> str:
        """Extrae el contenido completo del artículo"""
        if not soup:
            return ""
        
        content_selectors = [
            'div.article-content',
            'div.entry-content',
            'div.post-content',
            'div.content',
            'article div[class*="content"]',
            'div.story-body',
            'div.article-body',
            '.main-content',
            'article p'
        ]
        
        content_paragraphs = []
        
        for selector in content_selectors:
            try:
                elements = soup.select(selector)
                if elements:
                    for element in elements:
                        paragraphs = element.find_all('p')
                        for p in paragraphs:
                            text = p.get_text(strip=True)
                            # Filtrar texto de navegación y publicidad
                            if text and len(text) > 30:
                                excluded_texts = [
                                    'siguiente', 'anterior', 'compartir', 'comentar',
                                    'publicidad', 'advertisement', 'sponsor'
                                ]
                                if not any(excluded in text.lower() for excluded in excluded_texts):
                                    content_paragraphs.append(text)
                    
                    if content_paragraphs:
                        break
            except Exception as e:
                logger.debug(f"Error con selector {selector}: {e}")
                continue
        
        # Si no encontramos contenido con selectores específicos, buscar todos los párrafos
        if not content_paragraphs:
            try:
                article = soup.find('article') or soup.find('main')
                if article:
                    paragraphs = article.find_all('p')
                    for p in paragraphs:
                        text = p.get_text(strip=True)
                        if text and len(text) > 30:
                            content_paragraphs.append(text)
            except Exception:
                pass
        
        # Combinar párrafos
        full_content = '\n\n'.join(content_paragraphs)
        
        # También intentar obtener meta description
        try:
            meta_desc = soup.find('meta', {'name': 'description'})
            if meta_desc:
                desc = meta_desc.get('content', '')
                if desc and desc not in full_content:
                    full_content = desc + '\n\n' + full_content
        except Exception:
            pass
        
        return full_content.strip()

    def _extract_date_selenium(self, soup: BeautifulSoup, article_url: str = None) -> Optional[datetime]:
        """Extrae la fecha de publicación del artículo"""
        try:
            # Intentar usar la función de utilidad existente
            fecha = get_publication_date(soup, 'El Popular')
            if fecha:
                return fecha
            
            # Selectores específicos de El Popular
            date_selectors = [
                'meta[property="article:published_time"]',
                'meta[name="publish-date"]',
                'time[datetime]',
                '.published-date',
                '.post-date',
                '.article-date'
            ]
            
            for selector in date_selectors:
                try:
                    if selector.startswith('meta'):
                        meta = soup.select_one(selector)
                        if meta:
                            date_str = meta.get('content', '')
                            if date_str:
                                # Intentar parsear diferentes formatos
                                for fmt in ['%Y-%m-%dT%H:%M:%S', '%Y-%m-%d', '%d/%m/%Y']:
                                    try:
                                        return datetime.strptime(date_str[:10], '%Y-%m-%d')
                                    except:
                                        continue
                    else:
                        elem = soup.select_one(selector)
                        if elem:
                            date_str = elem.get('datetime') or elem.get_text(strip=True)
                            if date_str:
                                for fmt in ['%Y-%m-%dT%H:%M:%S', '%Y-%m-%d', '%d/%m/%Y']:
                                    try:
                                        return datetime.strptime(date_str[:10], '%Y-%m-%d')
                                    except:
                                        continue
                except Exception:
                    continue
            
            return None
        except Exception as e:
            logger.debug(f"Error extrayendo fecha: {e}")
            return None

    def _extract_article_data_selenium(self, article_url: str) -> Optional[Dict]:
        """Extrae datos completos de un artículo individual"""
        try:
            if not self._load_page_with_js(article_url, wait_seconds=3):
                return None
            
            page_source = self.driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Extraer título
            title = None
            title_selectors = [
                'h1.entry-title',
                'h1.post-title',
                'h1.article-title',
                'h1',
                'meta[property="og:title"]',
                'title'
            ]
            
            for selector in title_selectors:
                try:
                    if selector.startswith('meta'):
                        meta = soup.select_one(selector)
                        if meta:
                            title = meta.get('content', '').strip()
                    else:
                        elem = soup.select_one(selector)
                        if elem:
                            title = elem.get_text(strip=True)
                    
                    if title and len(title) > 10:
                        break
                except Exception:
                    continue
            
            if not title or len(title) < 10:
                logger.warning(f"No se pudo extraer título de {article_url}")
                return None
            
            # Extraer contenido
            content = self._extract_content_selenium(soup)
            if not content:
                content = f"Noticia de El Popular. Para más información, visita el enlace completo."
            
            # Extraer imagen
            imagen_url = self._extract_image_selenium(soup, article_url)
            
            # Extraer fecha
            fecha_publicacion = self._extract_date_selenium(soup, article_url)
            
            # Marcar URL como procesada
            normalized_url = self._normalize_url(article_url)
            self.processed_urls.add(normalized_url)
            
            return {
                'titulo': title,
                'contenido': content,
                'enlace': article_url,
                'imagen_url': imagen_url or '',
                'categoria': '',  # Se asignará según la sección
                'diario': 'El Popular',
                'fecha_publicacion': fecha_publicacion.date() if fecha_publicacion else datetime.now().date(),
                'fecha_extraccion': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error extrayendo datos de {article_url}: {e}")
            return None

    def get_deportes(self) -> List[Dict]:
        """Extrae noticias de Deportes"""
        noticias = []
        
        try:
            self._init_driver()
            
            for url in self.sections['deportes']:
                article_links = self._extract_article_links_selenium(url)
                
                for link in article_links[:15]:  # Máximo 15 por URL
                    article_data = self._extract_article_data_selenium(link)
                    if article_data:
                        article_data['categoria'] = 'Deportes'
                        noticias.append(article_data)
                        time.sleep(random.uniform(1, 2))  # Delay aleatorio
            
            logger.info(f"✅ Deportes: {len(noticias)} noticias extraídas")
            
        except Exception as e:
            logger.error(f"Error en get_deportes: {e}")
        finally:
            self._close_driver()
        
        return noticias

    def get_espectaculos(self) -> List[Dict]:
        """Extrae noticias de Espectáculos"""
        noticias = []
        
        try:
            self._init_driver()
            
            for url in self.sections['espectaculos']:
                article_links = self._extract_article_links_selenium(url)
                
                for link in article_links[:15]:  # Máximo 15 por URL
                    article_data = self._extract_article_data_selenium(link)
                    if article_data:
                        article_data['categoria'] = 'Espectáculos'
                        noticias.append(article_data)
                        time.sleep(random.uniform(1, 2))  # Delay aleatorio
            
            logger.info(f"✅ Espectáculos: {len(noticias)} noticias extraídas")
            
        except Exception as e:
            logger.error(f"Error en get_espectaculos: {e}")
        finally:
            self._close_driver()
        
        return noticias

    def get_mundo(self) -> List[Dict]:
        """Extrae noticias de Mundo"""
        noticias = []
        
        try:
            self._init_driver()
            
            for url in self.sections['mundo']:
                article_links = self._extract_article_links_selenium(url)
                
                for link in article_links[:15]:  # Máximo 15 por URL
                    article_data = self._extract_article_data_selenium(link)
                    if article_data:
                        article_data['categoria'] = 'Mundo'
                        noticias.append(article_data)
                        time.sleep(random.uniform(1, 2))  # Delay aleatorio
            
            logger.info(f"✅ Mundo: {len(noticias)} noticias extraídas")
            
        except Exception as e:
            logger.error(f"Error en get_mundo: {e}")
        finally:
            self._close_driver()
        
        return noticias

    def get_all_news(self) -> List[Dict]:
        """Obtiene todas las noticias de todas las categorías"""
        # Limpiar URLs e imágenes procesadas al inicio
        self.processed_urls.clear()
        self.processed_images.clear()
        
        all_news = []
        all_news.extend(self.get_deportes())
        all_news.extend(self.get_espectaculos())
        all_news.extend(self.get_mundo())
        
        total_processed = len(self.processed_urls)
        logger.info(f"📊 El Popular (Selenium): {len(all_news)} noticias únicas procesadas de {total_processed} URLs encontradas")
        
        return all_news

if __name__ == "__main__":
    if not SELENIUM_AVAILABLE:
        print("❌ Selenium no está disponible. Instala con: pip install selenium")
    else:
        scraper = ScraperPopularSelenium()
        noticias = scraper.get_all_news()
        print(f"\n✅ Total de noticias extraídas: {len(noticias)}")
        
        # Mostrar estadísticas por categoría
        categorias = {}
        for noticia in noticias:
            cat = noticia['categoria']
            categorias[cat] = categorias.get(cat, 0) + 1
        
        print("\n📊 Por categoría:")
        for cat, count in categorias.items():
            print(f"  • {cat}: {count} noticias")
        
        # Mostrar algunas noticias de ejemplo
        print("\n📰 Ejemplos de noticias:")
        for noticia in noticias[:3]:
            print(f"  - [{noticia['categoria']}] {noticia['titulo'][:60]}...")
            print(f"    Imagen: {'✅' if noticia['imagen_url'] else '❌'}")

