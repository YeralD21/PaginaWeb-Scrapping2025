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
            
            # Extraer contenido completo
            content = self._extract_content_selenium(soup)
            
            # Extraer video primero (prioridad sobre imagen)
            video_url = self._extract_video_selenium(soup, article_url)
            
            # Extraer imagen solo si no hay video
            image_url = ''
            if not video_url:
                image_url = self._extract_image_selenium(soup)
            
            # Extraer fecha
            published_at = self._extract_date_selenium(soup, article_url)
            
            # Determinar categoría
            category = self._determine_category(article_url)
            
            self.processed_urls.add(article_url)
            
            return {
                'titulo': title,
                'contenido': content if content else f"Noticia de {category} de CNN en Español.",
                'enlace': article_url,
                'imagen_url': image_url or '',  # Usar string vacío si no hay imagen
                'video_url': video_url or '',  # URL del video si existe
                'categoria': category,
                'diario': 'CNN en Español',
                'fecha_publicacion': published_at.date() if isinstance(published_at, datetime) else (datetime.fromisoformat(published_at).date() if published_at and isinstance(published_at, str) else datetime.now().date()),
                'fecha_extraccion': datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Error extrayendo datos de {article_url}: {e}")
            return None

    def _extract_title_selenium(self, soup: BeautifulSoup) -> str:
        """Extrae título del artículo asegurando encoding UTF-8"""
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
                        cleaned = self._clean_title(title)
                        # Asegurar encoding UTF-8
                        if isinstance(cleaned, bytes):
                            cleaned = cleaned.decode('utf-8', errors='replace')
                        cleaned = cleaned.strip().replace('\n', ' ').replace('\r', ' ')
                        cleaned = ' '.join(cleaned.split())
                        if cleaned:
                            return cleaned
            else:
                element = soup.select_one(selector)
                if element:
                    title = element.get_text(strip=True)
                    if len(title) > 10:
                        cleaned = self._clean_title(title)
                        # Asegurar encoding UTF-8
                        if isinstance(cleaned, bytes):
                            cleaned = cleaned.decode('utf-8', errors='replace')
                        cleaned = cleaned.strip().replace('\n', ' ').replace('\r', ' ')
                        cleaned = ' '.join(cleaned.split())
                        if cleaned:
                            return cleaned
        
        return ""

    def _extract_content_selenium(self, soup: BeautifulSoup) -> str:
        """Extrae contenido completo del artículo (sin truncar)"""
        # Selectores específicos para CNN en Español
        content_selectors = [
            'div.zn-body__paragraph',
            'div.Article__content',
            'div.pg-rail-tall__body',
            'div.story-body',
            'div.article-body',
            'div.entry-content',
            'div.post-content',
            'div[class*="story"]',
            'div[class*="article"]',
            'div[class*="content"]',
            'article',
            'main article'
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
        for selector in content_selectors:
            container = soup.select_one(selector)
            if container:
                # Buscar todos los párrafos dentro del contenedor
                paragraphs = container.find_all('p')
                if paragraphs:
                    for p in paragraphs:
                        text = p.get_text(strip=True)
                        # Filtrar párrafos muy cortos o que parezcan navegación/publicidad
                        if text and len(text) > 30 and not any(skip in text.lower() for skip in [
                            'leer más', 'siguiente', 'anterior', 'compartir', 'comentar',
                            'suscríbete', 'newsletter', 'síguenos', 'follow us', 'related',
                            'relacionado', 'más noticias', 'more news', 'advertisement', 'publicidad'
                        ]):
                            # Evitar duplicados
                            if text not in full_content_paragraphs:
                                full_content_paragraphs.append(text)
                    
                    if full_content_paragraphs:
                        break
        
        # Si encontramos párrafos completos, unirlos
        if full_content_paragraphs:
            full_content = '\n\n'.join(full_content_paragraphs)
            # Si tenemos meta description y no está ya incluida, agregarla al inicio
            if meta_description and meta_description not in full_content:
                return f"{meta_description}\n\n{full_content}"
            return full_content
        
        # Fallback: buscar todos los párrafos del artículo
        if not full_content_paragraphs:
            article_container = soup.select_one('article, main, .main-content, .content-wrapper')
            if article_container:
                all_paragraphs = article_container.find_all('p')
                for p in all_paragraphs:
                    text = p.get_text(strip=True)
                    if text and len(text) > 50 and text not in full_content_paragraphs:
                        if not any(skip in text.lower() for skip in [
                            'leer más', 'siguiente', 'anterior', 'compartir', 'comentar',
                            'suscríbete', 'newsletter', 'síguenos', 'follow us'
                        ]):
                            full_content_paragraphs.append(text)
            
            if full_content_paragraphs:
                full_content = '\n\n'.join(full_content_paragraphs)
                if meta_description and meta_description not in full_content:
                    return f"{meta_description}\n\n{full_content}"
                return full_content
        
        # Fallback: usar meta description si existe
        if meta_description:
            return meta_description
        
        # Último fallback: primer párrafo largo encontrado
        first_p = soup.select_one('.pg-rail-tall__body p, .Article__content p, article p, main p')
        if first_p:
            content = first_p.get_text(strip=True)
            if len(content) > 50:
                return content
        
        return ""

    def _extract_video_selenium(self, soup: BeautifulSoup, article_url: str) -> str:
        """Extrae URL de video de CNN si existe"""
        try:
            # MÉTODO 1: Meta tags para videos
            video_meta_tags = [
                ('meta', {'property': 'og:video'}),
                ('meta', {'property': 'og:video:url'}),
                ('meta', {'property': 'og:video:secure_url'}),
                ('meta', {'name': 'twitter:player'}),
                ('meta', {'itemprop': 'video'}),
            ]
            
            for tag_name, attrs in video_meta_tags:
                meta = soup.find(tag_name, attrs)
                if meta:
                    video_url = meta.get('content', '').strip()
                    if video_url and ('video' in video_url.lower() or 'youtube' in video_url.lower() or 'cnn' in video_url.lower()):
                        logging.info(f"✅ Video encontrado (meta) en {article_url[:60]}...: {video_url[:80]}...")
                        return video_url
            
            # MÉTODO 2: Buscar iframes de video (YouTube, CNN Video Player, etc.)
            iframe_selectors = [
                'iframe[src*="youtube"]',
                'iframe[src*="youtu.be"]',
                'iframe[src*="cnn.com/video"]',
                'iframe[src*="player"]',
                'iframe[data-src*="youtube"]',
                'iframe[data-src*="video"]',
            ]
            
            for selector in iframe_selectors:
                iframes = soup.select(selector)
                for iframe in iframes:
                    video_src = iframe.get('src') or iframe.get('data-src') or iframe.get('data-lazy-src')
                    if video_src:
                        # Extraer ID de YouTube si es un embed de YouTube
                        if 'youtube.com/embed' in video_src or 'youtu.be' in video_src:
                            youtube_id_match = re.search(r'(?:embed/|v/|youtu\.be/)([a-zA-Z0-9_-]{11})', video_src)
                            if youtube_id_match:
                                youtube_id = youtube_id_match.group(1)
                                video_url = f"https://www.youtube.com/embed/{youtube_id}"
                                logging.info(f"✅ Video de YouTube encontrado: {video_url}")
                                return video_url
                        elif 'cnn.com' in video_src or 'video' in video_src.lower():
                            logging.info(f"✅ Video de CNN encontrado: {video_src}")
                            return video_src
            
            # MÉTODO 3: Buscar elementos de video de CNN específicos
            cnn_video_selectors = [
                'div.video-container',
                'div.cnn-video',
                'div.media-video',
                'div.video-player',
                'div[class*="video"]',
                'div[data-video-id]',
                'div[data-video-url]',
            ]
            
            for selector in cnn_video_selectors:
                video_elements = soup.select(selector)
                for video_elem in video_elements:
                    # Buscar atributos de video
                    video_id = video_elem.get('data-video-id') or video_elem.get('data-id')
                    video_url_attr = video_elem.get('data-video-url') or video_elem.get('data-url')
                    
                    if video_id:
                        # Construir URL de video de CNN
                        video_url = f"https://www.cnn.com/video/data/3.0/video/{video_id}.html"
                        logging.info(f"✅ Video ID encontrado: {video_url}")
                        return video_url
                    elif video_url_attr:
                        logging.info(f"✅ Video URL encontrado: {video_url_attr}")
                        return video_url_attr
            
            # MÉTODO 4: Buscar enlaces a videos en el contenido
            video_links = soup.find_all('a', href=re.compile(r'(video|youtube|youtu\.be)', re.I))
            for link in video_links[:3]:  # Revisar solo los primeros 3
                href = link.get('href', '')
                if href and ('video' in href.lower() or 'youtube' in href.lower()):
                    if not href.startswith('http'):
                        href = urljoin(self.base_url, href)
                    logging.info(f"✅ Enlace de video encontrado: {href}")
                    return href
            
            return ''
            
        except Exception as e:
            logging.warning(f"Error extrayendo video de {article_url}: {e}")
            return ''

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
                    normalized = self._normalize_image_url(img_url)
                    if normalized:
                        return normalized
        
        # MÉTODO 2: Selectores específicos de CNN
        cnn_selectors = [
            'div.image__picture img',
            'div.media__image img',
            'figure.media img',
            'div.Article__media img',
            'div.lead-media img',
            'picture.image__picture img',
            '.pg-rail-tall__head img',
            '.Article__media img',
            '.hero-image img',
            'figure img',
            '.media img',
            '.pg-rail-tall__body img:first-of-type'
        ]
        
        for selector in cnn_selectors:
            imgs = soup.select(selector)
            for img in imgs:
                # Buscar en múltiples atributos
                img_url = (
                    img.get('data-src-full') or
                    img.get('data-src-large') or
                    img.get('data-src') or
                    img.get('data-lazy-src') or
                    img.get('data-original') or
                    img.get('src')
                )
                
                if img_url and self._is_valid_image_url(img_url):
                    # Verificar clases del img (evitar logos, etc.)
                    img_classes = ' '.join(img.get('class', [])).lower()
                    if any(bad in img_classes for bad in ['logo', 'icon', 'avatar']):
                        continue
                    
                    normalized = self._normalize_image_url(img_url)
                    if normalized:
                        return normalized
        
        # MÉTODO 3: Buscar en elementos <picture>
        pictures = soup.find_all('picture', limit=3)
        for picture in pictures:
            source = picture.find('source')
            if source:
                srcset = source.get('srcset', '')
                if srcset:
                    img_url = srcset.split(',')[-1].split(' ')[0].strip()
                    if img_url and self._is_valid_image_url(img_url):
                        normalized = self._normalize_image_url(img_url)
                        if normalized:
                            return normalized
            
            img = picture.find('img')
            if img:
                img_url = img.get('src') or img.get('data-src')
                if img_url and self._is_valid_image_url(img_url):
                    normalized = self._normalize_image_url(img_url)
                    if normalized:
                        return normalized
        
        return ""

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
            
            # Extraer de URL
            date_match = re.search(r'/(\d{4})/(\d{2})/(\d{2})/', url)
            if date_match:
                year, month, day = map(int, date_match.groups())
                return datetime(year, month, day)
            
            return None
        except Exception as e:
            logging.warning(f"Error extrayendo fecha: {e}")
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
        """Valida URL de imagen con validación estricta para evitar duplicados"""
        if not url or url == "No Image" or len(url) < 20:
            return False
        
        # CRÍTICO: Verificar si ya fue usada (evitar duplicados)
        normalized_url = self._normalize_url_for_check(url)
        if normalized_url in self.processed_images:
            logging.debug(f"⚠️ Imagen ya usada anteriormente: {normalized_url[:60]}...")
            return False
        
        invalid_patterns = [
            'logo', 'icon', 'avatar', 'placeholder', 'ad-', 'banner',
            'default', 'blank', '1x1', 'pixel', 'tracking', 'widget',
            'social-', 'share-', 'thumbnail', '/static/', '/assets/'
        ]
        url_lower = url.lower()
        
        for pattern in invalid_patterns:
            if pattern in url_lower:
                return False
        
        # Debe tener extensión válida o estar en CDN de CNN
        valid_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        has_extension = any(ext in url_lower for ext in valid_extensions)
        is_cdn = 'cdn.cnn.com' in url_lower or 'cloudfront' in url_lower or 'cnn.io' in url_lower
        
        return has_extension or is_cdn or 'image' in url_lower
    
    def _normalize_url_for_check(self, url: str) -> str:
        """Normaliza URL para verificación de duplicados"""
        if not url:
            return ""
        # Eliminar parámetros de query y fragmentos
        return url.split('?')[0].split('#')[0]

    def _normalize_image_url(self, url: str) -> str:
        """Normaliza URL de imagen y marca como usada"""
        if not url:
            return ""
        
        # Normalizar URL
        if url.startswith('//'):
            url = 'https:' + url
        elif url.startswith('/'):
            url = self.base_url + url
        
        # Normalizar para verificación de duplicados
        normalized = self._normalize_url_for_check(url)
        
        # CRÍTICO: Verificar si ya fue usada
        if normalized in self.processed_images:
            logging.warning(f"⚠️ Imagen duplicada rechazada: {normalized[:60]}...")
            return ""
        
        # Marcar como usada
        self.processed_images.add(normalized)
        logging.info(f"✅ Imagen única asignada: {normalized[:80]}...")
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

    def get_mundo(self, max_articles: int = 15) -> List[Dict]:
        """Extrae noticias de Mundo (compatible con sistema existente)"""
        return self.scrape_section('mundo', max_articles)
    
    def get_deportes(self, max_articles: int = 15) -> List[Dict]:
        """Extrae noticias de Deportes (compatible con sistema existente)"""
        return self.scrape_section('deportes', max_articles)
    
    def get_economia(self, max_articles: int = 15) -> List[Dict]:
        """Extrae noticias de Economía (compatible con sistema existente)"""
        return self.scrape_section('economia', max_articles)
    
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
            
            # Estadísticas de imágenes
            with_images = sum(1 for n in all_news if n['imagen_url'])
            image_urls = [n['imagen_url'] for n in all_news if n['imagen_url']]
            unique_images = len(set(image_urls))
            duplicates = len(image_urls) - unique_images
            
            logging.info(f"🎉 Scraping completado: {len(all_news)} noticias totales")
            logging.info(f"📊 Con imágenes: {with_images}/{len(all_news)}")
            if duplicates > 0:
                logging.warning(f"⚠️ ADVERTENCIA: {duplicates} imágenes duplicadas detectadas")
            else:
                logging.info(f"✅ Sin imágenes duplicadas - Todas las imágenes son únicas")
            
            return all_news
            
        finally:
            self._close_driver()

if __name__ == "__main__":
    import sys
    import io
    # Configurar stdout para UTF-8 en Windows
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    
    if not SELENIUM_AVAILABLE:
        print("ERROR: Selenium no esta instalado.")
        print("Para usar este scraper, instala Selenium:")
        print("pip install selenium")
        print("Y descarga ChromeDriver desde: https://chromedriver.chromium.org/")
        exit(1)
    
    scraper = ScraperCNNSelenium()
    
    print("Iniciando scraping con Selenium...")
    try:
        all_news = scraper.get_all_news(max_articles_per_section=10)
        
        # Estadísticas
        print(f"\n{'='*60}")
        print(f"RESULTADOS")
        print(f"{'='*60}")
        print(f"Total noticias: {len(all_news)}")
        
        categories = {}
        images_count = 0
        for news in all_news:
            cat = news['categoria']
            categories[cat] = categories.get(cat, 0) + 1
            if news['imagen_url']:
                images_count += 1
        
        print(f"Con imagenes: {images_count}")
        print(f"Sin imagenes: {len(all_news) - images_count}")
        
        print("\nPor categoria:")
        for cat, count in categories.items():
            print(f"  - {cat}: {count} noticias")
        
        # Verificar duplicados de imágenes
        image_urls = [n['imagen_url'] for n in all_news if n['imagen_url']]
        duplicates = len(image_urls) - len(set(image_urls))
        if duplicates > 0:
            print(f"\nADVERTENCIA: {duplicates} imagenes duplicadas detectadas")
            from collections import Counter
            img_counts = Counter(image_urls)
            print("\nImagenes duplicadas:")
            for img_url, count in img_counts.items():
                if count > 1:
                    print(f"  - {img_url[:70]}... ({count} veces)")
        else:
            print(f"\nOK: Sin imagenes duplicadas - Todas las imagenes son unicas")
        
        # Ejemplos
        print(f"\nEjemplos:")
        for i, news in enumerate(all_news[:5], 1):
            print(f"{i}. [{news['categoria']}] {news['titulo'][:60]}...")
            print(f"   Imagen: {'SI' if news['imagen_url'] else 'NO'}")
            if news['imagen_url']:
                print(f"   URL imagen: {news['imagen_url'][:70]}...")
            print(f"   URL articulo: {news['enlace']}")
            print()
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        print("\nAsegurate de tener ChromeDriver instalado y configurado correctamente.")
