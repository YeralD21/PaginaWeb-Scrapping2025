"""
Scraper para El Comercio usando Selenium
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
import requests
import os
from urllib.parse import urljoin, urlparse

# Importar scraper tradicional como fallback (opcional)
FALLBACK_AVAILABLE = False
ScraperComercioFallback = None
# No intentar importar automáticamente para evitar errores si no existe
# El fallback se cargará solo cuando sea necesario en _extract_article_data_fallback

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ScraperComercioSelenium:
    def __init__(self):
        if not SELENIUM_AVAILABLE:
            raise ImportError("Selenium no está instalado. Ejecuta: pip install selenium")
        
        self.base_url = "https://elcomercio.pe"
        self.driver = None
        self.processed_urls: Set[str] = set()
        self.processed_images: Set[str] = set()  # Rastrear imágenes usadas para evitar duplicados
        
        # Configuración de secciones
        self.sections = {
            'deportes': [
                f"{self.base_url}/deportes/",
            ],
            'economia': [
                f"{self.base_url}/economia/",
            ],
            'mundo': [
                f"{self.base_url}/mundo/",
            ],
            'politica': [
                f"{self.base_url}/politica/",
            ],
            'sociedad': [
                f"{self.base_url}/sociedad/",
            ],
            'tecnologia': [
                f"{self.base_url}/tecnologia/",
            ],
            'cultura': [
                f"{self.base_url}/cultura/",
            ],
            'espectaculos': [
                f"{self.base_url}/espectaculos/",
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
            self.driver.set_page_load_timeout(15)  # Reducido de 30 a 15 segundos
            self.driver.implicitly_wait(5)  # Reducido de 10 a 5 segundos
            logger.info("✅ Driver de Chrome inicializado para El Comercio")
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
            # Verificar que el driver esté activo
            if not self.driver:
                logger.error("Driver no inicializado")
                return False
            
            # Verificar que el driver no haya sido cerrado
            try:
                _ = self.driver.current_url
            except Exception:
                logger.warning("Driver se cerró inesperadamente, reinicializando...")
                self._init_driver()
                if not self.driver:
                    return False
            
            logger.info(f"🔍 Cargando página: {url}")
            self.driver.get(url)
            
            time.sleep(min(wait_seconds, 3))  # Máximo 3 segundos de espera
            
            # Scroll para cargar contenido lazy (más rápido)
            try:
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
                time.sleep(1)  # Reducido de 2 a 1 segundo
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(0.5)  # Reducido de 1 a 0.5 segundos
            except Exception as scroll_error:
                logger.warning(f"Error haciendo scroll (continuando de todos modos): {scroll_error}")
            
            return True
        except Exception as e:
            logger.error(f"Error cargando página {url}: {e}")
            # Si el error es de sesión inválida, intentar reinicializar
            if "invalid session id" in str(e).lower() or "session" in str(e).lower():
                logger.warning("Sesión de Selenium inválida, reinicializando driver...")
                try:
                    self._close_driver()
                    self._init_driver()
                except Exception as init_error:
                    logger.error(f"Error reinicializando driver: {init_error}")
            return False

    def _normalize_url(self, url: str) -> str:
        """Normaliza una URL eliminando parámetros y fragmentos"""
        if not url:
            return ""
        
        parsed = urlparse(url)
        normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
        return normalized.rstrip('/')

    def _is_valid_article_url(self, url: str) -> bool:
        """Valida si una URL es de un artículo válido"""
        if not url or 'elcomercio.pe' not in url:
            return False
        
        url_lower = url.lower()
        
        # Excluir categorías y páginas especiales
        excluded_patterns = [
            '/ecdata/', '/publirreportaje/', '/tag/', '/author/', '/search/',
            '/archivo/', '/terminos', '/contacto', '/suscripcion',
            '/politica-de-privacidad', '/sobre-nosotros', '/page/'
        ]
        
        for pattern in excluded_patterns:
            if pattern in url_lower:
                return False
        
        # Normalizar URL
        normalized = self._normalize_url(url)
        
        # Evitar duplicados
        if normalized in self.processed_urls:
            return False
        
        # Extraer segmentos
        segments = [s for s in normalized.split('/') if s and 'elcomercio.pe' not in s and s not in ['https:', 'http:']]
        
        # Si tiene 3+ segmentos, probablemente es un artículo
        if len(segments) >= 3:
            return True
        
        # Si tiene 2 segmentos pero NO termina en / y el segundo es largo, podría ser artículo
        if len(segments) == 2 and not normalized.endswith('/') and len(segments[1]) > 40:
            return True
        
        return False

    def _normalize_url_for_check(self, url: str) -> str:
        """Normaliza URL de imagen para verificar duplicados"""
        if not url:
            return ""
        
        # Eliminar parámetros de tamaño y calidad para comparar
        url = re.sub(r'[?&]w=\d+', '', url)
        url = re.sub(r'[?&]h=\d+', '', url)
        url = re.sub(r'[?&]q=\d+', '', url)
        url = re.sub(r'[?&]fit=\w+', '', url)
        url = re.sub(r'[?&]format=\w+', '', url)
        
        # Normalizar dominio
        url = url.replace('http://', 'https://')
        
        # Eliminar fragmentos
        if '#' in url:
            url = url.split('#')[0]
        
        return url.rstrip('/')

    def _is_valid_image_url(self, img_url: str) -> bool:
        """Valida si una URL de imagen es válida y no duplicada"""
        if not img_url or len(img_url) < 20:
            return False
        
        # Normalizar para verificar duplicados
        normalized_img = self._normalize_url_for_check(img_url)
        
        # CRÍTICO: Ya fue usada (evitar duplicados)
        if normalized_img in self.processed_images:
            logger.debug(f"⚠️ Imagen ya usada anteriormente: {normalized_img[:60]}...")
            return False
        
        img_lower = img_url.lower()
        
        # Patrones a rechazar
        invalid_patterns = [
            'logo', 'icon', 'avatar', 'sprite', 'placeholder',
            'default', 'blank', '1x1', 'pixel', 'tracking',
            'ad-', 'ads/', 'banner', 'widget', 'social-',
            'share-', 'thumbnail', '/static/', '/assets/',
            '/resources/dist/elcomercio/images/default'  # Imágenes por defecto de El Comercio
        ]
        
        if any(pattern in img_lower for pattern in invalid_patterns):
            return False
        
        # Debe tener extensión válida o estar en CDN de imágenes
        valid_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        has_extension = any(ext in img_lower for ext in valid_extensions)
        is_cdn = 'elcomercio.pe' in img_lower or 'cdn' in img_lower or 'cloudfront' in img_lower
        
        if not (has_extension or is_cdn):
            return False
        
        # Verificar tamaño en URL si está disponible (preferir imágenes grandes)
        size_match = re.search(r'[?&]w=(\d+)', img_lower)
        if size_match:
            width = int(size_match.group(1))
            if width < 400:  # Preferir imágenes de al menos 400px de ancho
                logger.debug(f"Imagen rechazada por tamaño pequeño: {width}px")
                return False
        
        return True

    def _extract_image_selenium(self, soup: BeautifulSoup, article_url: str) -> str:
        """Extrae la imagen principal del artículo con validación estricta"""
        try:
            # MÉTODO 1: Meta tags (más confiable y mejor calidad)
            meta_tags = [
                ('meta', {'property': 'og:image'}),
                ('meta', {'name': 'og:image'}),
                ('meta', {'property': 'twitter:image'}),
                ('meta', {'name': 'twitter:image'}),
                ('meta', {'itemprop': 'image'}),
                ('link', {'rel': 'image_src'})
            ]
            
            for tag_name, attrs in meta_tags:
                meta = soup.find(tag_name, attrs)
                if meta:
                    img_url = meta.get('content') or meta.get('href')
                    if img_url and self._is_valid_image_url(img_url):
                        normalized = self._normalize_url_for_check(img_url)
                        if normalized not in self.processed_images:
                            # Normalizar URL completa
                            if not img_url.startswith('http'):
                                img_url = urljoin(self.base_url, img_url)
                            
                            # Preferir imágenes de alta resolución
                            # Intentar obtener versión de mayor calidad si es posible
                            if 'elcomercio.pe' in img_url and '?' in img_url:
                                # Si tiene parámetros, intentar aumentar calidad
                                if 'w=' in img_url:
                                    img_url = re.sub(r'w=\d+', 'w=1200', img_url)
                                elif '?' in img_url:
                                    img_url += '&w=1200'
                                else:
                                    img_url += '?w=1200'
                            
                            self.processed_images.add(normalized)
                            logger.info(f"✅ Imagen encontrada en meta tag: {img_url[:80]}...")
                            return img_url
            
            # MÉTODO 2: Selectores específicos de El Comercio (imágenes de alta calidad)
            comercio_selectors = [
                'div.story-image img',
                'div.story__image img',
                'div.article-image img',
                'div.article__image img',
                'div.media-image img',
                'div.media__image img',
                'figure.story-image img',
                'figure.article-image img',
                'div[class*="story-image"] img',
                'div[class*="story__image"] img',
                'div[class*="article-image"] img',
                'div[class*="article__image"] img',
                'img[class*="story-image"]',
                'img[class*="article-image"]',
                'img[class*="media-image"]',
                'img[data-src]',
                'img[data-lazy-src]',
                'img[data-original]'
            ]
            
            for selector in comercio_selectors:
                imgs = soup.select(selector)
                for img in imgs:
                    img_url = (img.get('src') or 
                              img.get('data-src') or 
                              img.get('data-lazy-src') or 
                              img.get('data-original'))
                    
                    if img_url and self._is_valid_image_url(img_url):
                        # Normalizar URL
                        if not img_url.startswith('http'):
                            img_url = urljoin(self.base_url, img_url)
                        
                        # Preferir imágenes de alta resolución
                        if 'elcomercio.pe' in img_url:
                            # Intentar obtener versión de mayor calidad
                            if '?' in img_url:
                                if 'w=' not in img_url:
                                    img_url += '&w=1200'
                                else:
                                    img_url = re.sub(r'w=\d+', 'w=1200', img_url)
                            else:
                                img_url += '?w=1200'
                        
                        normalized = self._normalize_url_for_check(img_url)
                        if normalized not in self.processed_images:
                            self.processed_images.add(normalized)
                            logger.info(f"✅ Imagen encontrada con selector '{selector}': {img_url[:80]}...")
                            return img_url
            
            # MÉTODO 3: Buscar en srcset (para imágenes responsivas de alta calidad)
            img_with_srcset = soup.find('img', srcset=True)
            if img_with_srcset:
                srcset = img_with_srcset.get('srcset', '')
                if srcset:
                    # Extraer todas las URLs del srcset y elegir la más grande
                    urls_with_sizes = re.findall(r'([^\s,]+)\s+(\d+)[wx]', srcset)
                    if urls_with_sizes:
                        # Ordenar por tamaño y tomar la más grande
                        urls_with_sizes.sort(key=lambda x: int(x[1]), reverse=True)
                        for url, size in urls_with_sizes:
                            if self._is_valid_image_url(url):
                                normalized = self._normalize_url_for_check(url)
                                if normalized not in self.processed_images:
                                    if not url.startswith('http'):
                                        url = urljoin(self.base_url, url)
                                    self.processed_images.add(normalized)
                                    logger.info(f"✅ Imagen encontrada en srcset (tamaño {size}): {url[:80]}...")
                                    return url
            
            # MÉTODO 4: Buscar primera imagen grande en el contenido del artículo
            article_content = soup.find('article') or soup.find('div', class_=lambda x: x and ('content' in str(x).lower() or 'article' in str(x).lower() or 'story' in str(x).lower()))
            if article_content:
                images = article_content.find_all('img')
                for img in images:
                    img_url = img.get('src') or img.get('data-src') or img.get('data-lazy-src') or img.get('data-original')
                    if img_url and self._is_valid_image_url(img_url):
                        # Verificar dimensiones si están disponibles
                        width = img.get('width')
                        height = img.get('height')
                        if width and height:
                            try:
                                w, h = int(width), int(height)
                                if w >= 400 and h >= 300:  # Solo imágenes grandes
                                    normalized = self._normalize_url_for_check(img_url)
                                    if normalized not in self.processed_images:
                                        if not img_url.startswith('http'):
                                            img_url = urljoin(self.base_url, img_url)
                                        self.processed_images.add(normalized)
                                        logger.info(f"✅ Imagen grande encontrada en contenido ({w}x{h}): {img_url[:80]}...")
                                        return img_url
                            except (ValueError, TypeError):
                                pass
                        
                        # Si no tiene dimensiones pero parece válida, usar de todos modos
                        normalized = self._normalize_url_for_check(img_url)
                        if normalized not in self.processed_images:
                            if not img_url.startswith('http'):
                                img_url = urljoin(self.base_url, img_url)
                            self.processed_images.add(normalized)
                            logger.info(f"✅ Imagen encontrada en contenido: {img_url[:80]}...")
                            return img_url
            
            logger.warning(f"⚠️ No se encontró imagen válida para {article_url[:80]}...")
            return ""
            
        except Exception as e:
            logger.error(f"Error extrayendo imagen de {article_url}: {e}")
            return ""

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
                elif href.startswith('http') and 'elcomercio.pe' in href:
                    full_url = href
                else:
                    continue
                
                # Normalizar URL
                normalized = self._normalize_url(full_url)
                
                # Validar URL de artículo
                if self._is_valid_article_url(normalized):
                    self.processed_urls.add(normalized)
                    article_links.append(normalized)
            
            # Eliminar duplicados manteniendo el orden
            seen = set()
            unique_links = []
            for link in article_links:
                if link not in seen:
                    seen.add(link)
                    unique_links.append(link)
            
            logger.info(f"✅ Encontrados {len(unique_links)} artículos únicos en {section_url}")
            # Limitar a 30 artículos por sección (se puede ajustar si se necesita más)
            return unique_links[:30]
            
        except Exception as e:
            logger.error(f"Error extrayendo enlaces de {section_url}: {e}")
            return []

    def _extract_title_selenium(self, soup: BeautifulSoup) -> str:
        """Extrae el título del artículo"""
        try:
            # Meta tags primero
            meta_title = soup.find('meta', property='og:title')
            if meta_title:
                title = meta_title.get('content', '').strip()
                if title:
                    return title.encode('utf-8').decode('utf-8')
            
            # Selectores específicos de El Comercio
            title_selectors = [
                'h1.story-title',
                'h1.story__title',
                'h1.article-title',
                'h1.article__title',
                'h1[class*="title"]',
                'h1',
                'h2.story-title',
                'h2.article-title'
            ]
            
            for selector in title_selectors:
                title_elem = soup.select_one(selector)
                if title_elem:
                    title = title_elem.get_text(strip=True)
                    if title and len(title) > 10:
                        return title.encode('utf-8').decode('utf-8')
            
            return ""
        except Exception as e:
            logger.error(f"Error extrayendo título: {e}")
            return ""

    def _extract_content_selenium(self, soup: BeautifulSoup) -> str:
        """Extrae el contenido completo del artículo"""
        try:
            content_selectors = [
                'div.story-contents',
                'div.story-body',
                'div.article-body',
                'div.entry-content',
                'div.post-content',
                'div[class*="story"] p',
                'div[class*="article"] p',
                'article p',
                '.main p'
            ]
            
            content_paragraphs = []
            
            for selector in content_selectors:
                elements = soup.select(selector)
                if elements:
                    for element in elements:
                        paragraphs = element.find_all('p')
                        for p in paragraphs:
                            text = p.get_text(strip=True)
                            if text and len(text) > 50:
                                content_paragraphs.append(text)
                    
                    if content_paragraphs:
                        break
            
            # Si no encontramos contenido con los selectores, buscar todos los párrafos
            if not content_paragraphs:
                all_paragraphs = soup.find_all('p')
                for p in all_paragraphs:
                    text = p.get_text(strip=True)
                    if text and len(text) > 50:
                        content_paragraphs.append(text)
            
            full_content = '\n\n'.join(content_paragraphs)
            
            # Limitar longitud
            if len(full_content) > 3000:
                full_content = full_content[:3000] + "..."
            
            return full_content
            
        except Exception as e:
            logger.error(f"Error extrayendo contenido: {e}")
            return ""

    def _extract_date_selenium(self, soup: BeautifulSoup, article_url: str) -> Optional[datetime]:
        """Extrae la fecha de publicación del artículo"""
        try:
            # Meta tags primero
            meta_date = soup.find('meta', property='article:published_time')
            if meta_date:
                date_str = meta_date.get('content', '')
                if date_str:
                    try:
                        return datetime.strptime(date_str.split('T')[0], '%Y-%m-%d')
                    except ValueError:
                        pass
            
            # Buscar en elementos time
            time_elem = soup.find('time')
            if time_elem:
                datetime_attr = time_elem.get('datetime')
                if datetime_attr:
                    try:
                        return datetime.strptime(datetime_attr.split('T')[0], '%Y-%m-%d')
                    except ValueError:
                        pass
            
            # Buscar en la URL si contiene fecha
            date_match = re.search(r'/(\d{4})/(\d{1,2})/(\d{1,2})/', article_url)
            if date_match:
                year, month, day = date_match.groups()
                try:
                    return datetime.strptime(f"{year}-{month}-{day}", '%Y-%m-%d')
                except ValueError:
                    pass
            
            return None
        except Exception as e:
            logger.error(f"Error extrayendo fecha: {e}")
            return None

    def _extract_category_selenium(self, soup: BeautifulSoup, article_url: str) -> str:
        """Extrae la categoría del artículo"""
        try:
            # Meta tags
            meta_category = soup.find('meta', property='article:section')
            if meta_category:
                category = meta_category.get('content', '').strip()
                if category:
                    return category
            
            # Buscar en la URL
            url_lower = article_url.lower()
            category_mapping = {
                '/deportes/': 'Deportes',
                '/economia/': 'Economía',
                '/mundo/': 'Mundo',
                '/politica/': 'Política',
                '/sociedad/': 'Sociedad',
                '/tecnologia/': 'Tecnología',
                '/cultura/': 'Cultura',
                '/espectaculos/': 'Espectáculos'
            }
            
            for pattern, category in category_mapping.items():
                if pattern in url_lower:
                    return category
            
            return 'General'
        except Exception as e:
            logger.error(f"Error extrayendo categoría: {e}")
            return 'General'

    def _extract_article_data_selenium(self, article_url: str) -> Optional[Dict]:
        """Extrae todos los datos de un artículo individual con fallback a BeautifulSoup"""
        try:
            # Verificar que el driver esté activo
            if not self.driver:
                logger.warning(f"Driver no inicializado para {article_url}, usando fallback...")
                return self._extract_article_data_fallback(article_url)
            
            # Intentar con Selenium primero
            try:
                if self._load_page_with_js(article_url, wait_seconds=3):
                    # Verificar que el driver siga activo después de cargar
                    try:
                        _ = self.driver.current_url
                    except Exception:
                        logger.warning(f"Driver se cerró inesperadamente para {article_url}, usando fallback...")
                        return self._extract_article_data_fallback(article_url)
                    
                    page_source = self.driver.page_source
                    soup = BeautifulSoup(page_source, 'html.parser')
                    
                    # Extraer título
                    title = self._extract_title_selenium(soup)
                    if not title or len(title) < 10:
                        logger.warning(f"Título inválido o muy corto para {article_url}, intentando fallback...")
                        return self._extract_article_data_fallback(article_url)
                    
                    # Extraer contenido
                    content = self._extract_content_selenium(soup)
                    
                    # Extraer imagen (con detección de duplicados)
                    image_url = self._extract_image_selenium(soup, article_url)
                    
                    # Extraer fecha
                    published_at = self._extract_date_selenium(soup, article_url)
                    
                    # Extraer categoría
                    category = self._extract_category_selenium(soup, article_url)
                    
                    logger.info(f"✅ Datos extraídos con Selenium para {article_url[:80]}...")
                    if image_url:
                        logger.info(f"   📷 Imagen: {image_url[:60]}...")
                    
                    return {
                        'titulo': title,
                        'contenido': content if content else f"Noticia de {category} de El Comercio.",
                        'enlace': article_url,
                        'imagen_url': image_url or '',
                        'categoria': category,
                        'diario': 'El Comercio',
                        'fecha_publicacion': published_at.date() if published_at else datetime.now().date(),
                        'fecha_extraccion': datetime.now().isoformat()
                    }
                else:
                    # Si Selenium falla, usar fallback
                    logger.warning(f"Selenium falló para {article_url}, usando fallback BeautifulSoup...")
                    return self._extract_article_data_fallback(article_url)
            except Exception as selenium_error:
                logger.error(f"Error con Selenium para {article_url}: {selenium_error}")
                logger.warning(f"Intentando fallback BeautifulSoup para {article_url}...")
                return self._extract_article_data_fallback(article_url)
            
        except Exception as e:
            logger.error(f"Error extrayendo datos de {article_url} con Selenium: {e}")
            logger.warning(f"Intentando fallback BeautifulSoup para {article_url}...")
            return self._extract_article_data_fallback(article_url)
    
    def _extract_article_data_fallback(self, article_url: str) -> Optional[Dict]:
        """Fallback usando BeautifulSoup si Selenium falla"""
        try:
            # Usar requests + BeautifulSoup directamente (sin depender del scraper tradicional)
            logger.info("Usando requests + BeautifulSoup como fallback")
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            })
            
            response = session.get(article_url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extraer título
            title = self._extract_title_selenium(soup)  # Reutilizar método que funciona con BeautifulSoup
            if not title or len(title) < 10:
                meta_title = soup.find('meta', property='og:title')
                if meta_title:
                    title = meta_title.get('content', '').strip()
                if not title:
                    h1 = soup.find('h1')
                    if h1:
                        title = h1.get_text(strip=True)
            
            if not title or len(title) < 10:
                logger.warning(f"No se pudo extraer título válido para {article_url}")
                return None
            
            # Extraer contenido
            content = self._extract_content_selenium(soup)
            
            # Extraer imagen (con detección de duplicados)
            image_url = self._extract_image_selenium(soup, article_url)
            
            # Extraer categoría
            category = self._extract_category_selenium(soup, article_url)
            
            # Usar fecha actual si no se puede extraer
            fecha_publicacion = datetime.now().date()
            
            logger.info(f"✅ Datos extraídos con fallback BeautifulSoup para {article_url[:80]}...")
            if image_url:
                logger.info(f"   📷 Imagen: {image_url[:60]}...")
            
            return {
                'titulo': title.encode('utf-8').decode('utf-8') if isinstance(title, str) else str(title),
                'contenido': content if content else f"Noticia de {category} de El Comercio.",
                'enlace': article_url,
                'imagen_url': image_url or '',
                'categoria': category,
                'diario': 'El Comercio',
                'fecha_publicacion': fecha_publicacion,
                'fecha_extraccion': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error en fallback BeautifulSoup para {article_url}: {e}")
            return None

    def get_deportes(self, limit: Optional[int] = None) -> List[Dict]:
        """Extrae noticias de la sección Deportes"""
        try:
            self._init_driver()
            self.processed_urls.clear()
            self.processed_images.clear()
            
            noticias = []
            section_urls = self.sections.get('deportes', [])
            
            for section_url in section_urls:
                article_links = self._extract_article_links_selenium(section_url)
                
                # Si hay un límite, priorizar noticias con imágenes
                if limit:
                    # Primero procesar todas las URLs para obtener datos
                    temp_noticias = []
                    for link in article_links[:limit * 2]:  # Procesar más para tener opciones
                        try:
                            article_data = self._extract_article_data_selenium(link)
                            if article_data:
                                temp_noticias.append(article_data)
                        except Exception as e:
                            logger.error(f"Error procesando artículo {link}: {e}")
                            continue
                    
                    # Priorizar noticias con imágenes
                    noticias_con_imagen = [n for n in temp_noticias if n.get('imagen_url') and n.get('imagen_url').strip()]
                    noticias_sin_imagen = [n for n in temp_noticias if not (n.get('imagen_url') and n.get('imagen_url').strip())]
                    
                    # Combinar priorizando imágenes
                    noticias = (noticias_con_imagen + noticias_sin_imagen)[:limit]
                    break
                else:
                    # Sin límite, procesar todas
                    for link in article_links:
                        try:
                            article_data = self._extract_article_data_selenium(link)
                            if article_data:
                                noticias.append(article_data)
                                time.sleep(random.uniform(0.5, 1))  # Reducido de 1-2 a 0.5-1 segundos
                        except Exception as e:
                            logger.error(f"Error procesando artículo {link}: {e}")
                            continue
            
            logger.info(f"✅ Deportes: {len(noticias)} noticias extraídas")
            return noticias
            
        except Exception as e:
            logger.error(f"Error obteniendo deportes: {e}")
            return []
        finally:
            self._close_driver()

    def get_economia(self, limit: Optional[int] = None) -> List[Dict]:
        """Extrae noticias de la sección Economía con fallback a BeautifulSoup"""
        try:
            self._init_driver()
            self.processed_urls.clear()
            self.processed_images.clear()
            
            noticias = []
            section_urls = self.sections.get('economia', [])
            
            for section_url in section_urls:
                try:
                    article_links = self._extract_article_links_selenium(section_url)
                except Exception as e:
                    logger.error(f"Error extrayendo enlaces con Selenium de {section_url}: {e}")
                    logger.warning("Intentando fallback BeautifulSoup para extraer enlaces...")
                    if FALLBACK_AVAILABLE and ScraperComercioFallback:
                        try:
                            fallback_scraper = ScraperComercioFallback()
                            fallback_news = fallback_scraper.get_economia(max_pages=1)
                            article_links = [n['enlace'] for n in fallback_news[:30]]
                            logger.info(f"✅ Fallback obtuvo {len(article_links)} enlaces")
                        except Exception as e2:
                            logger.error(f"Error en fallback: {e2}")
                            article_links = []
                    else:
                        article_links = []
                
                # Si hay un límite, priorizar noticias con imágenes
                if limit:
                    temp_noticias = []
                    for link in article_links[:limit * 2]:
                        try:
                            article_data = self._extract_article_data_selenium(link)
                            if article_data:
                                temp_noticias.append(article_data)
                        except Exception as e:
                            logger.error(f"Error procesando artículo {link}: {e}")
                            continue
                    
                    noticias_con_imagen = [n for n in temp_noticias if n.get('imagen_url') and n.get('imagen_url').strip()]
                    noticias_sin_imagen = [n for n in temp_noticias if not (n.get('imagen_url') and n.get('imagen_url').strip())]
                    noticias = (noticias_con_imagen + noticias_sin_imagen)[:limit]
                    break
                else:
                    for link in article_links:
                        try:
                            article_data = self._extract_article_data_selenium(link)
                            if article_data:
                                noticias.append(article_data)
                                time.sleep(random.uniform(0.5, 1))
                        except Exception as e:
                            logger.error(f"Error procesando artículo {link}: {e}")
                            continue
            
            logger.info(f"✅ Economía: {len(noticias)} noticias extraídas")
            return noticias
            
        except Exception as e:
            logger.error(f"Error obteniendo economía: {e}")
            if FALLBACK_AVAILABLE and ScraperComercioFallback:
                logger.warning("Usando completamente el scraper tradicional como último recurso...")
                try:
                    fallback_scraper = ScraperComercioFallback()
                    return fallback_scraper.get_economia(max_pages=1)
                except Exception as e2:
                    logger.error(f"Error en último recurso: {e2}")
            return []
        finally:
            self._close_driver()

    def get_mundo(self) -> List[Dict]:
        """Extrae noticias de la sección Mundo con fallback a BeautifulSoup"""
        try:
            self._init_driver()
            self.processed_urls.clear()
            self.processed_images.clear()
            
            noticias = []
            section_urls = self.sections.get('mundo', [])
            
            for section_url in section_urls:
                try:
                    article_links = self._extract_article_links_selenium(section_url)
                except Exception as e:
                    logger.error(f"Error extrayendo enlaces con Selenium de {section_url}: {e}")
                    logger.warning("Intentando fallback BeautifulSoup para extraer enlaces...")
                    if FALLBACK_AVAILABLE and ScraperComercioFallback:
                        try:
                            fallback_scraper = ScraperComercioFallback()
                            fallback_news = fallback_scraper.get_mundo(max_pages=1)
                            article_links = [n['enlace'] for n in fallback_news[:30]]
                            logger.info(f"✅ Fallback obtuvo {len(article_links)} enlaces")
                        except Exception as e2:
                            logger.error(f"Error en fallback: {e2}")
                            article_links = []
                    else:
                        article_links = []
                
                for link in article_links:
                    try:
                        article_data = self._extract_article_data_selenium(link)
                        if article_data:
                            noticias.append(article_data)
                            time.sleep(random.uniform(1, 2))
                    except Exception as e:
                        logger.error(f"Error procesando artículo {link}: {e}")
                        continue
            
            logger.info(f"✅ Mundo: {len(noticias)} noticias extraídas")
            return noticias
            
        except Exception as e:
            logger.error(f"Error obteniendo mundo: {e}")
            if FALLBACK_AVAILABLE and ScraperComercioFallback:
                logger.warning("Usando completamente el scraper tradicional como último recurso...")
                try:
                    fallback_scraper = ScraperComercioFallback()
                    return fallback_scraper.get_mundo(max_pages=1)
                except Exception as e2:
                    logger.error(f"Error en último recurso: {e2}")
            return []
        finally:
            self._close_driver()

    def get_politica(self, limit: Optional[int] = None) -> List[Dict]:
        """Extrae noticias de la sección Política con fallback a BeautifulSoup"""
        try:
            self._init_driver()
            self.processed_urls.clear()
            self.processed_images.clear()
            
            noticias = []
            section_urls = self.sections.get('politica', [])
            
            for section_url in section_urls:
                try:
                    article_links = self._extract_article_links_selenium(section_url)
                except Exception as e:
                    logger.error(f"Error extrayendo enlaces con Selenium de {section_url}: {e}")
                    logger.warning("Intentando fallback BeautifulSoup para extraer enlaces...")
                    if FALLBACK_AVAILABLE and ScraperComercioFallback:
                        try:
                            fallback_scraper = ScraperComercioFallback()
                            fallback_news = fallback_scraper.get_politica(max_pages=1)
                            article_links = [n['enlace'] for n in fallback_news[:30]]
                            logger.info(f"✅ Fallback obtuvo {len(article_links)} enlaces")
                        except Exception as e2:
                            logger.error(f"Error en fallback: {e2}")
                            article_links = []
                    else:
                        article_links = []
                
                # Si hay un límite, priorizar noticias con imágenes
                if limit:
                    temp_noticias = []
                    for link in article_links[:limit * 2]:
                        try:
                            article_data = self._extract_article_data_selenium(link)
                            if article_data:
                                temp_noticias.append(article_data)
                        except Exception as e:
                            logger.error(f"Error procesando artículo {link}: {e}")
                            continue
                    
                    noticias_con_imagen = [n for n in temp_noticias if n.get('imagen_url') and n.get('imagen_url').strip()]
                    noticias_sin_imagen = [n for n in temp_noticias if not (n.get('imagen_url') and n.get('imagen_url').strip())]
                    noticias = (noticias_con_imagen + noticias_sin_imagen)[:limit]
                    break
                else:
                    for link in article_links:
                        try:
                            article_data = self._extract_article_data_selenium(link)
                            if article_data:
                                noticias.append(article_data)
                                time.sleep(random.uniform(0.5, 1))
                        except Exception as e:
                            logger.error(f"Error procesando artículo {link}: {e}")
                            continue
            
            logger.info(f"✅ Política: {len(noticias)} noticias extraídas")
            return noticias
            
        except Exception as e:
            logger.error(f"Error obteniendo política: {e}")
            if FALLBACK_AVAILABLE and ScraperComercioFallback:
                logger.warning("Usando completamente el scraper tradicional como último recurso...")
                try:
                    fallback_scraper = ScraperComercioFallback()
                    return fallback_scraper.get_politica(max_pages=1)
                except Exception as e2:
                    logger.error(f"Error en último recurso: {e2}")
            return []
        finally:
            self._close_driver()

    def get_sociedad(self) -> List[Dict]:
        """Extrae noticias de la sección Sociedad con fallback a BeautifulSoup"""
        try:
            self._init_driver()
            self.processed_urls.clear()
            self.processed_images.clear()
            
            noticias = []
            section_urls = self.sections.get('sociedad', [])
            
            for section_url in section_urls:
                try:
                    article_links = self._extract_article_links_selenium(section_url)
                except Exception as e:
                    logger.error(f"Error extrayendo enlaces con Selenium de {section_url}: {e}")
                    logger.warning("Intentando fallback BeautifulSoup para extraer enlaces...")
                    if FALLBACK_AVAILABLE and ScraperComercioFallback:
                        try:
                            fallback_scraper = ScraperComercioFallback()
                            fallback_news = fallback_scraper.get_sociedad(max_pages=1)
                            article_links = [n['enlace'] for n in fallback_news[:30]]
                            logger.info(f"✅ Fallback obtuvo {len(article_links)} enlaces")
                        except Exception as e2:
                            logger.error(f"Error en fallback: {e2}")
                            article_links = []
                    else:
                        article_links = []
                
                for link in article_links:
                    try:
                        article_data = self._extract_article_data_selenium(link)
                        if article_data:
                            noticias.append(article_data)
                            time.sleep(random.uniform(1, 2))
                    except Exception as e:
                        logger.error(f"Error procesando artículo {link}: {e}")
                        continue
            
            logger.info(f"✅ Sociedad: {len(noticias)} noticias extraídas")
            return noticias
            
        except Exception as e:
            logger.error(f"Error obteniendo sociedad: {e}")
            if FALLBACK_AVAILABLE and ScraperComercioFallback:
                logger.warning("Usando completamente el scraper tradicional como último recurso...")
                try:
                    fallback_scraper = ScraperComercioFallback()
                    return fallback_scraper.get_sociedad(max_pages=1)
                except Exception as e2:
                    logger.error(f"Error en último recurso: {e2}")
            return []
        finally:
            self._close_driver()

    def get_all_news(self, limit_per_category: int = 10) -> List[Dict]:
        """Obtiene noticias de todas las categorías
        
        Args:
            limit_per_category: Número máximo de noticias por categoría (default: 10)
        """
        all_news = []
        logger.info(f"Iniciando scraping de todas las categorías de El Comercio con Selenium (máx {limit_per_category} por categoría)...")
        
        try:
            # Limitar noticias por categoría para obtener las más recientes
            categorias = [
                ('deportes', self.get_deportes),
                ('economia', self.get_economia),
                ('mundo', self.get_mundo),
                ('politica', self.get_politica),
                ('sociedad', self.get_sociedad),
            ]
            
            for categoria_nombre, categoria_method in categorias:
                try:
                    noticias_categoria = categoria_method()
                    # Limitar y priorizar noticias con imágenes
                    noticias_con_imagen = [n for n in noticias_categoria if n.get('imagen_url') and n.get('imagen_url').strip()]
                    noticias_sin_imagen = [n for n in noticias_categoria if not (n.get('imagen_url') and n.get('imagen_url').strip())]
                    
                    # Tomar primero las que tienen imagen
                    if len(noticias_con_imagen) >= limit_per_category:
                        noticias_categoria = noticias_con_imagen[:limit_per_category]
                    else:
                        noticias_categoria = noticias_con_imagen + noticias_sin_imagen[:limit_per_category - len(noticias_con_imagen)]
                    
                    logger.info(f"{categoria_nombre.capitalize()}: {len(noticias_categoria)} noticias (con imagen: {len(noticias_con_imagen)})")
                    all_news.extend(noticias_categoria)
                except Exception as e:
                    logger.error(f"Error obteniendo {categoria_nombre}: {e}")
                    continue
            
            logger.info(f"Total de noticias extraídas: {len(all_news)}")
            logger.info(f"Total de imágenes únicas usadas: {len(self.processed_images)}")
            
            # Ordenar por fecha de extracción (más recientes primero)
            all_news.sort(key=lambda x: x.get('fecha_extraccion', ''), reverse=True)
            
        except Exception as e:
            logger.error(f"Error en get_all_news: {e}")
        
        return all_news

if __name__ == "__main__":
    scraper = ScraperComercioSelenium()
    noticias = scraper.get_all_news()
    print(f"\n{'='*60}")
    print(f"Total de noticias extraídas: {len(noticias)}")
    print(f"Total de imágenes únicas: {len(scraper.processed_images)}")
    print(f"{'='*60}")
    if noticias:
        print("\nPrimeras 5 noticias:")
        for i, noticia in enumerate(noticias[:5], 1):
            print(f"{i}. [{noticia['categoria']}] {noticia['titulo'][:80]}...")
            print(f"   URL: {noticia['enlace']}")
            print(f"   Imagen: {'✅' if noticia['imagen_url'] else '❌'} {noticia['imagen_url'][:60] if noticia['imagen_url'] else ''}")

