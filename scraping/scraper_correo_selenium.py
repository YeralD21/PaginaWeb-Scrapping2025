"""
Scraper para Diario Correo usando Selenium
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
from urllib.parse import urljoin, urlparse

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ScraperCorreoSelenium:
    def __init__(self):
        if not SELENIUM_AVAILABLE:
            raise ImportError("Selenium no está instalado. Ejecuta: pip install selenium")
        
        self.base_url = "https://diariocorreo.pe"
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
            'espectaculos': [
                f"{self.base_url}/espectaculos/",
            ],
            'mundo': [
                f"{self.base_url}/mundo/",
            ],
            'politica': [
                f"{self.base_url}/politica/",
            ],
            'tecnologia': [
                f"{self.base_url}/tecnologia/",
            ],
            'cultura': [
                f"{self.base_url}/cultura/",
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
            logger.info("✅ Driver de Chrome inicializado")
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
            logger.info(f"🔍 Cargando página: {url}")
            self.driver.get(url)
            
            time.sleep(wait_seconds)
            
            # Scroll para cargar contenido lazy
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(2)
            
            return True
        except Exception as e:
            logger.error(f"Error cargando página {url}: {e}")
            return False

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
                elif href.startswith('http') and 'diariocorreo.pe' in href:
                    full_url = href
                else:
                    continue
                
                # Normalizar URL
                normalized = self._normalize_url(full_url)
                
                # Validar URL de artículo
                if self._is_valid_article_url(normalized):
                    # Validación adicional: verificar texto del enlace
                    link_text = link.get_text(strip=True).lower()
                    if link_text:
                        invalid_link_texts = [
                            'política de privacidad', 'politica de privacidad',
                            'política de cookies', 'politica de cookies',
                            'términos y condiciones', 'terminos y condiciones',
                            'prensmart', 'aviso legal'
                        ]
                        if any(invalid_text in link_text for invalid_text in invalid_link_texts):
                            logger.debug(f"⚠️ Enlace rechazado por texto administrativo: {link_text[:50]}")
                            continue
                    
                    if normalized not in self.processed_urls:
                        article_links.append(normalized)
            
            # Eliminar duplicados manteniendo orden
            seen = set()
            unique_links = []
            for link in article_links:
                if link not in seen:
                    seen.add(link)
                    unique_links.append(link)
            
            return unique_links
            
        except Exception as e:
            logger.error(f"Error extrayendo enlaces de {section_url}: {e}")
            return []

    def _normalize_url(self, url: str) -> str:
        """Normaliza URL eliminando parámetros y fragmentos"""
        if not url:
            return ""
        return url.split('?')[0].split('#')[0]

    def _is_valid_article_url(self, url: str) -> bool:
        """Verifica si una URL es de un artículo válido"""
        if not url or 'diariocorreo.pe' not in url:
            return False
        
        url_lower = url.lower()
        
        # Patrones a rechazar (páginas administrativas, legales, etc.)
        invalid_patterns = [
            '/video/', '/videos/', '/galeria/', '/galerias/',
            '/live/', '/en-vivo/', '/autor/', '/author/',
            '/tag/', '/search/', '/buscar/', '/page/',
            '.jpg', '.png', '.pdf', 'javascript:', 'mailto:',
            'facebook.com', 'twitter.com', 'instagram.com',
            '/inicio', '/home', '/contacto', '/nosotros',
            # Páginas administrativas y legales
            '/politica-de-privacidad', '/politica-de-cookies', '/politica-privacidad',
            '/politica-cookies', '/privacidad', '/cookies', '/cookie',
            '/terminos-y-condiciones', '/terminos', '/condiciones',
            '/aviso-legal', '/legal', '/aviso',
            '/politica/',  # Excluir sección de política si es página administrativa
            '/prensmart',  # Excluir páginas de PRENSMART
            '/sobre-nosotros', '/about', '/quienes-somos',
            '/ayuda', '/help', '/faq', '/preguntas-frecuentes'
        ]
        
        if any(pattern in url_lower for pattern in invalid_patterns):
            logger.debug(f"⚠️ URL rechazada por patrón inválido: {url}")
            return False
        
        # Verificar palabras clave en la URL que indiquen páginas administrativas
        admin_keywords = [
            'politica', 'privacidad', 'cookie', 'termino', 'condicion',
            'legal', 'aviso', 'prensmart', 'administracion', 'admin'
        ]
        
        # Solo rechazar si la URL contiene estas palabras Y no es una noticia de política válida
        path_parts = urlparse(url).path.strip('/').split('/')
        if len(path_parts) >= 2:
            # Si tiene estructura de noticia (ej: /politica/noticia-titulo), permitir
            # Pero rechazar si es solo /politica-de-privacidad o similar
            if any(keyword in url_lower for keyword in admin_keywords):
                # Verificar si parece una página administrativa (sin estructura de noticia)
                if len(path_parts) == 1 or any(part in ['politica-de-privacidad', 'politica-de-cookies', 
                                                          'terminos-y-condiciones', 'prensmart'] for part in path_parts):
                    logger.debug(f"⚠️ URL rechazada por palabra clave administrativa: {url}")
                    return False
        
        # Debe tener estructura de artículo (al menos 1 segmento después del dominio)
        if len(path_parts) < 1:
            return False
        
        return True

    def _is_valid_image_url(self, img_url: str) -> bool:
        """Valida URL de imagen con validación estricta para evitar duplicados"""
        if not img_url or len(img_url) < 20:
            return False
        
        # CRÍTICO: Verificar si ya fue usada (evitar duplicados)
        normalized_url = self._normalize_url_for_check(img_url)
        if normalized_url in self.processed_images:
            logger.debug(f"⚠️ Imagen ya usada anteriormente: {normalized_url[:60]}...")
            return False
        
        invalid_patterns = [
            'logo', 'icon', 'avatar', 'placeholder', 'ad-', 'banner',
            'default', 'blank', '1x1', 'pixel', 'tracking', 'widget',
            'social-', 'share-', 'thumbnail', '/static/', '/assets/'
        ]
        img_lower = img_url.lower()
        
        for pattern in invalid_patterns:
            if pattern in img_lower:
                return False
        
        # Debe tener extensión válida o estar en CDN
        valid_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        has_extension = any(ext in img_lower for ext in valid_extensions)
        is_cdn = 'cdn' in img_lower or 'cloudfront' in img_lower or 'diariocorreo.pe' in img_lower
        
        return has_extension or is_cdn or 'image' in img_lower
    
    def _normalize_url_for_check(self, url: str) -> str:
        """Normaliza URL para verificación de duplicados"""
        if not url:
            return ""
        # Eliminar parámetros de query y fragmentos
        return url.split('?')[0].split('#')[0]

    def _extract_image_selenium(self, soup: BeautifulSoup) -> str:
        """Extrae imagen principal con validación estricta para evitar duplicados"""
        # MÉTODO 1: Meta tags (más confiable)
        meta_tags = [
            ('meta', {'property': 'og:image'}),
            ('meta', {'property': 'twitter:image'}),
            ('meta', {'name': 'twitter:image'}),
            ('meta', {'itemprop': 'image'})
        ]
        
        for tag_name, attrs in meta_tags:
            meta = soup.find(tag_name, attrs)
            if meta:
                img_url = meta.get('content', '').strip()
                if img_url and self._is_valid_image_url(img_url):
                    normalized = self._normalize_url_for_check(img_url)
                    if normalized not in self.processed_images:
                        self.processed_images.add(normalized)
                        logger.info(f"✅ Imagen única asignada: {normalized[:80]}...")
                        return img_url
        
        # MÉTODO 2: Selectores específicos de Diario Correo
        correo_selectors = [
            'div.story-image img',
            'div.featured-image img',
            'div.main-image img',
            'article img',
            'div[class*="story"] img',
            'div[class*="featured"] img',
            'img[class*="featured"]',
            'img[class*="main"]'
        ]
        
        for selector in correo_selectors:
            imgs = soup.select(selector)
            for img in imgs:
                img_url = (
                    img.get('data-src-full') or
                    img.get('data-src-large') or
                    img.get('data-src') or
                    img.get('data-lazy-src') or
                    img.get('src')
                )
                
                if img_url and self._is_valid_image_url(img_url):
                    # Verificar clases del img (evitar logos, etc.)
                    img_classes = ' '.join(img.get('class', [])).lower()
                    if any(bad in img_classes for bad in ['logo', 'icon', 'avatar']):
                        continue
                    
                    normalized = self._normalize_url_for_check(img_url)
                    if normalized not in self.processed_images:
                        self.processed_images.add(normalized)
                        logger.info(f"✅ Imagen única asignada: {normalized[:80]}...")
                        return img_url
        
        return ""

    def _extract_article_data_selenium(self, article_url: str, category: str) -> Optional[Dict]:
        """Extrae datos de un artículo usando Selenium - SIN IMÁGENES (pero con lógica de prevención de duplicados)"""
        if article_url in self.processed_urls:
            return None
        
        if not self._load_page_with_js(article_url, wait_seconds=3):
            return None
        
        try:
            page_source = self.driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Extraer título
            title = self._extract_title_selenium(soup)
            if not title or len(title) < 10:
                logger.warning(f"Título inválido en {article_url}")
                return None
            
            # Asegurar encoding UTF-8 correcto
            if isinstance(title, bytes):
                title = title.decode('utf-8', errors='replace')
            elif not isinstance(title, str):
                title = str(title)
            
            # Limpiar caracteres de control y espacios extra
            title = title.strip().replace('\n', ' ').replace('\r', ' ')
            title = ' '.join(title.split())  # Normalizar espacios múltiples
            
            # Validar título - rechazar páginas administrativas/legales
            title_lower = title.lower()
            invalid_title_keywords = [
                'política de privacidad', 'politica de privacidad', 'privacidad prensmart',
                'política de cookies', 'politica de cookies', 'política de cookie',
                'términos y condiciones', 'terminos y condiciones', 'términos y condicion',
                'aviso legal', 'política de', 'politica de', 'prensmart',
                'términos de uso', 'terminos de uso', 'condiciones de uso',
                'sobre nosotros', 'quienes somos', 'ayuda', 'contacto'
            ]
            
            if any(keyword in title_lower for keyword in invalid_title_keywords):
                logger.warning(f"⚠️ Artículo rechazado por título administrativo: {title}")
                return None
            
            # Extraer contenido/resumen
            content = self._extract_content_selenium(soup)
            
            # Extraer fecha
            fecha_pub = self._extract_date_selenium(soup, article_url)
            
            # Extraer imagen con prevención de duplicados
            imagen_url = self._extract_image_selenium(soup)
            
            self.processed_urls.add(article_url)
            
            return {
                'titulo': title,
                'contenido': content if content else f"Noticia de {category} de Diario Correo.",
                'enlace': article_url,
                'imagen_url': imagen_url,
                'categoria': category,
                'diario': 'Diario Correo',
                'fecha_publicacion': fecha_pub.date() if isinstance(fecha_pub, datetime) else (datetime.fromisoformat(fecha_pub).date() if fecha_pub and isinstance(fecha_pub, str) else datetime.now().date()),
                'fecha_extraccion': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error extrayendo datos de {article_url}: {e}")
            return None

    def _extract_title_selenium(self, soup: BeautifulSoup) -> str:
        """Extrae título del artículo"""
        selectors = [
            'h1.entry-title',
            'h1.post-title',
            'h1.article-title',
            'h1.title',
            'h1',
            'meta[property="og:title"]',
            'title'
        ]
        
        extracted_titles = []
        
        for selector in selectors:
            try:
                if selector.startswith('meta') or selector == 'title':
                    element = soup.select_one(selector)
                    if element:
                        if selector.startswith('meta'):
                            title = element.get('content', '').strip()
                        else:
                            title = element.get_text(strip=True)
                        
                        if title and len(title) > 10:
                            cleaned = self._clean_title(title)
                            # Asegurar encoding UTF-8
                            if isinstance(cleaned, bytes):
                                cleaned = cleaned.decode('utf-8', errors='replace')
                            cleaned = cleaned.strip().replace('\n', ' ').replace('\r', ' ')
                            cleaned = ' '.join(cleaned.split())
                            if cleaned and len(cleaned) > 10:
                                extracted_titles.append(cleaned)
                else:
                    element = soup.select_one(selector)
                    if element:
                        title = element.get_text(strip=True)
                        if title and len(title) > 10:
                            cleaned = self._clean_title(title)
                            # Asegurar encoding UTF-8
                            if isinstance(cleaned, bytes):
                                cleaned = cleaned.decode('utf-8', errors='replace')
                            cleaned = cleaned.strip().replace('\n', ' ').replace('\r', ' ')
                            cleaned = ' '.join(cleaned.split())
                            if cleaned and len(cleaned) > 10:
                                extracted_titles.append(cleaned)
            except Exception as e:
                logger.debug(f"Error con selector {selector}: {e}")
                continue
        
        # Retornar el primer título válido encontrado
        if extracted_titles:
            return extracted_titles[0]
        
        logger.warning("No se pudo extraer título válido del artículo")
        return ""

    def _extract_content_selenium(self, soup: BeautifulSoup) -> str:
        """Extrae contenido completo del artículo (sin truncar)"""
        selectors = [
            'div.story-content',
            'div.post-content',
            'div.entry-content',
            'div.article-content',
            'div.content',
            'article',
            'main article',
            '.excerpt',
            '.summary'
        ]
        
        # Intentar primero con meta tags para obtener descripción inicial
        meta_description = None
        for meta_selector in ['meta[property="og:description"]', 'meta[name="description"]']:
            meta = soup.select_one(meta_selector)
            if meta and meta.get('content'):
                meta_description = meta['content'].strip()
                if len(meta_description) > 20:
                    break
        
        # Buscar contenido completo en contenedores principales
        full_content_paragraphs = []
        for selector in selectors:
            if selector.startswith('meta'):
                continue
            
            container = soup.select_one(selector)
            if container:
                paragraphs = container.find_all('p')
                if paragraphs:
                    for p in paragraphs:
                        text = p.get_text(strip=True)
                        # Filtrar párrafos muy cortos o que parezcan navegación
                        if text and len(text) > 30 and not any(skip in text.lower() for skip in ['leer más', 'siguiente', 'anterior', 'compartir', 'comentar']):
                            full_content_paragraphs.append(text)
                    
                    if full_content_paragraphs:
                        break
        
        # Si encontramos párrafos completos, unirlos
        if full_content_paragraphs:
            full_content = '\n\n'.join(full_content_paragraphs)
            # Si tenemos meta description, agregarla al inicio
            if meta_description and meta_description not in full_content:
                return f"{meta_description}\n\n{full_content}"
            return full_content
        
        # Fallback: usar meta description si existe
        if meta_description:
            return meta_description
        
        # Fallback: primer párrafo largo
        all_paragraphs = soup.find_all('p')
        for p in all_paragraphs:
            content = p.get_text(strip=True)
            if len(content) > 50:
                return content
        
        return ""

    def _truncate_content(self, content: str, max_length: int = 300) -> str:
        """Trunca el contenido a un máximo de caracteres (solo para display en cards)"""
        # NOTA: Esta función ya no se usa en la extracción principal
        # El contenido completo se guarda en la base de datos
        # El truncado se hace en el frontend para las cards
        if len(content) <= max_length:
            return content
        
        # Truncar en el último espacio antes del límite
        truncated = content[:max_length].rsplit(' ', 1)[0]
        return truncated + "..."

    def _extract_date_selenium(self, soup: BeautifulSoup, url: str) -> Optional[datetime]:
        """Extrae fecha de publicación como objeto datetime"""
        try:
            # Meta tags
            meta_date = soup.select_one('meta[property="article:published_time"]')
            if meta_date and meta_date.get('content'):
                date_str = meta_date['content']
                try:
                    return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                except:
                    for fmt in ['%Y-%m-%dT%H:%M:%S', '%Y-%m-%d']:
                        try:
                            return datetime.strptime(date_str[:19], fmt)
                        except:
                            continue
            
            # Elemento time
            time_elem = soup.select_one('time[datetime]')
            if time_elem and time_elem.get('datetime'):
                date_str = time_elem['datetime']
                try:
                    return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                except:
                    for fmt in ['%Y-%m-%dT%H:%M:%S', '%Y-%m-%d']:
                        try:
                            return datetime.strptime(date_str[:19], fmt)
                        except:
                            continue
            
            # Extraer de URL si tiene formato de fecha
            date_match = re.search(r'/(\d{4})/(\d{2})/(\d{2})/', url)
            if date_match:
                year, month, day = map(int, date_match.groups())
                return datetime(year, month, day)
            
            return None
        except Exception as e:
            logger.warning(f"Error extrayendo fecha: {e}")
            return None

    def _clean_title(self, title: str) -> str:
        """Limpia título y valida que no sea una página administrativa"""
        if not title:
            return ""
        
        # Primero validar si es una página administrativa
        title_lower = title.lower()
        invalid_keywords = [
            'política de privacidad', 'politica de privacidad', 'privacidad prensmart',
            'política de cookies', 'politica de cookies', 'política de cookie',
            'términos y condiciones', 'terminos y condiciones',
            'aviso legal', 'prensmart', 'términos de uso', 'terminos de uso'
        ]
        
        if any(keyword in title_lower for keyword in invalid_keywords):
            return ""  # Retornar vacío para que sea rechazado
        
        # Limpiar texto no deseado del título (solo remover sufijos, no el título completo)
        unwanted_suffixes = [
            ' - Diario Correo', ' | Diario Correo', ' - Correo', ' | Correo',
            '| Diario Correo', '| CORREO', ' - CORREO'
        ]
        
        cleaned_title = title
        for suffix in unwanted_suffixes:
            if cleaned_title.endswith(suffix):
                cleaned_title = cleaned_title[:-len(suffix)].strip()
        
        # Si después de limpiar el título está vacío o es muy corto, usar el original
        if not cleaned_title or len(cleaned_title) < 10:
            return title.strip()
        
        return cleaned_title.strip()

    def _determine_category(self, url: str) -> str:
        """Determina categoría desde URL"""
        url_lower = url.lower()
        
        if 'deportes' in url_lower:
            return 'Deportes'
        elif 'economia' in url_lower or 'economía' in url_lower:
            return 'Economía'
        elif 'espectaculos' in url_lower or 'espectáculos' in url_lower:
            return 'Espectáculos'
        elif 'mundo' in url_lower:
            return 'Mundo'
        elif 'politica' in url_lower or 'política' in url_lower:
            return 'Política'
        elif 'tecnologia' in url_lower or 'tecnología' in url_lower:
            return 'Tecnología'
        elif 'cultura' in url_lower:
            return 'Cultura'
        
        return 'General'

    def scrape_section(self, section_name: str, max_articles: int = 20) -> List[Dict]:
        """Extrae noticias de una sección"""
        if section_name not in self.sections:
            logger.error(f"Sección '{section_name}' no encontrada")
            return []
        
        logger.info(f"🔍 Iniciando scraping de sección: {section_name}")
        articles = []
        
        for section_url in self.sections[section_name]:
            logger.info(f"📄 Procesando: {section_url}")
            
            # Extraer enlaces
            article_links = self._extract_article_links_selenium(section_url)
            logger.info(f"📰 Encontrados {len(article_links)} enlaces")
            
            # Procesar artículos
            for link in article_links[:max_articles]:
                if len(articles) >= max_articles:
                    break
                
                category = self._determine_category(link)
                article_data = self._extract_article_data_selenium(link, category)
                if article_data:
                    articles.append(article_data)
                
                time.sleep(random.uniform(1, 2))
            
            if len(articles) >= max_articles:
                break
            
            time.sleep(2)
        
        logger.info(f"✅ Sección {section_name} completada: {len(articles)} artículos")
        return articles

    def get_deportes(self, max_articles: int = 15) -> List[Dict]:
        """Extrae noticias de Deportes"""
        return self.scrape_section('deportes', max_articles)
    
    def get_economia(self, max_articles: int = 15) -> List[Dict]:
        """Extrae noticias de Economía"""
        return self.scrape_section('economia', max_articles)
    
    def get_espectaculos(self, max_articles: int = 15) -> List[Dict]:
        """Extrae noticias de Espectáculos"""
        return self.scrape_section('espectaculos', max_articles)
    
    def get_mundo(self, max_articles: int = 15) -> List[Dict]:
        """Extrae noticias de Mundo"""
        return self.scrape_section('mundo', max_articles)
    
    def get_politica(self, max_articles: int = 15) -> List[Dict]:
        """Extrae noticias de Política"""
        return self.scrape_section('politica', max_articles)
    
    def get_tecnologia(self, max_articles: int = 15) -> List[Dict]:
        """Extrae noticias de Tecnología"""
        return self.scrape_section('tecnologia', max_articles)
    
    def get_cultura(self, max_articles: int = 15) -> List[Dict]:
        """Extrae noticias de Cultura"""
        return self.scrape_section('cultura', max_articles)

    def get_all_news(self, max_articles_per_section: int = 15) -> List[Dict]:
        """Método principal compatible con el sistema existente"""
        self.processed_urls.clear()
        self.processed_images.clear()  # Limpiar imágenes procesadas al inicio
        
        try:
            self._init_driver()
            
            all_news = []
            for section_name in self.sections.keys():
                try:
                    articles = self.scrape_section(section_name, max_articles_per_section)
                    all_news.extend(articles)
                    time.sleep(2)
                except Exception as e:
                    logger.error(f"Error en sección {section_name}: {e}")
            
            # Estadísticas de imágenes extraídas
            image_urls = [n['imagen_url'] for n in all_news if n['imagen_url']]
            unique_images = len(set(image_urls))
            duplicates = len(image_urls) - unique_images
            noticias_con_imagen = len(image_urls)
            
            logger.info(f"🎉 Scraping completado: {len(all_news)} noticias totales")
            logger.info(f"📊 Noticias con imágenes: {noticias_con_imagen}/{len(all_news)}")
            if duplicates > 0:
                logger.warning(f"⚠️ ADVERTENCIA: {duplicates} imágenes duplicadas detectadas")
            else:
                logger.info(f"✅ Sistema de prevención de duplicados activo - Todas las imágenes son únicas")
            
            return all_news
            
        finally:
            self._close_driver()

if __name__ == "__main__":
    import sys
    import io
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    
    if not SELENIUM_AVAILABLE:
        print("ERROR: Selenium no esta instalado.")
        print("Para usar este scraper, instala Selenium:")
        print("pip install selenium")
        exit(1)
    
    scraper = ScraperCorreoSelenium()
    
    print("Iniciando scraping de Diario Correo con Selenium...")
    try:
        all_news = scraper.get_all_news(max_articles_per_section=10)
        
        print(f"\n{'='*60}")
        print(f"RESULTADOS")
        print(f"{'='*60}")
        print(f"Total noticias: {len(all_news)}")
        
        categories = {}
        for n in all_news:
            cat = n['categoria']
            categories[cat] = categories.get(cat, 0) + 1
        
        print(f"\nPor categoria:")
        for cat, count in categories.items():
            print(f"  - {cat}: {count}")
        
        print(f"\nEjemplos:")
        for i, n in enumerate(all_news[:5], 1):
            print(f"{i}. [{n['categoria']}] {n['titulo'][:60]}...")
            print(f"   Contenido: {n['contenido'][:80]}...")
            print(f"   URL: {n['enlace']}")
            print()
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

