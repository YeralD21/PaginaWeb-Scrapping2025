import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging
from typing import List, Dict, Optional, Set
import sys
import os
import time
import re
from urllib.parse import urljoin, urlparse
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend'))
from image_extractor import extract_image_from_element
from date_extraction_utils import get_publication_date

class ScraperCorreoOptimized:
    def __init__(self):
        self.base_url = "https://diariocorreo.pe"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        })
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)
        
        # Rastrear imágenes usadas para evitar duplicados
        self.processed_images: Set[str] = set()
        
        # URLs válidas identificadas en el análisis
        self.valid_sections = [
            '/deportes/',
            '/economia/',
            '/espectaculos/',
            '/mundo/',
            '/politica/',
            '/tecnologia/',
            '/cultura/'
        ]
        
        # Selectores optimizados basados en el análisis
        self.article_selectors = [
            'article',
            'div[class*="story"]',
            'div[class*="item"]',
            'div[class*="news"]',
            'div[class*="post"]',
            'div[class*="article"]'
        ]
        
        self.title_selectors = [
            'h1', 'h2', 'h3', 'h4',
            'a[class*="title"]',
            'a[class*="headline"]',
            '.title', '.headline', '.titulo'
        ]
        
        self.content_selectors = [
            'div.story-content',
            'div.post-content',
            'div.entry-content',
            'div.article-content',
            'div.content',
            'div[class*="story"] p',
            'div[class*="post"] p',
            'div[class*="content"] p',
            'article p',
            '.main p',
            '.excerpt',
            '.summary'
        ]
        
        self.image_selectors = [
            'img[class*="featured"]',
            'img[class*="main"]',
            'img[class*="story"]',
            'img[class*="article"]',
            'img[class*="post"]',
            '.featured-image img',
            '.main-image img',
            '.story-image img',
            'article img',
            'div[class*="story"] img',
            'div[class*="item"] img'
        ]
    
    def make_request(self, url: str, max_retries: int = 3) -> Optional[requests.Response]:
        """Realiza una petición HTTP con reintentos y manejo de errores"""
        for attempt in range(max_retries):
            try:
                response = self.session.get(url, timeout=15)
                response.raise_for_status()
                return response
            except requests.exceptions.RequestException as e:
                self.logger.warning(f"Intento {attempt + 1} fallido para {url}: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Backoff exponencial
                else:
                    self.logger.error(f"Error definitivo para {url}: {e}")
                    return None
        return None
    
    def extract_article_content(self, article_url: str) -> str:
        """Extrae el contenido completo de un artículo individual"""
        try:
            if not article_url or not self.is_valid_article_url(article_url):
                return ""
            
            response = self.make_request(article_url)
            if not response:
                return ""
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Buscar contenido con múltiples selectores
            content_paragraphs = []
            
            for selector in self.content_selectors:
                elements = soup.select(selector)
                if elements:
                    for element in elements:
                        paragraphs = element.find_all('p')
                        for p in paragraphs:
                            text = p.get_text(strip=True)
                            if text and len(text) > 30 and not self.is_navigation_text(text):
                                content_paragraphs.append(text)
                    
                    if content_paragraphs:
                        break
            
            # Si no encontramos contenido con los selectores específicos, buscar todos los párrafos
            if not content_paragraphs:
                all_paragraphs = soup.find_all('p')
                for p in all_paragraphs:
                    text = p.get_text(strip=True)
                    if text and len(text) > 30 and not self.is_navigation_text(text):
                        content_paragraphs.append(text)
            
            # Unir los párrafos y limpiar
            full_content = '\n\n'.join(content_paragraphs)
            
            # NO truncar aquí - guardar contenido completo para la página de detalle
            # El truncado se hará en el frontend para las cards de la lista
            
            return full_content
            
        except Exception as e:
            self.logger.warning(f"Error extrayendo contenido de {article_url}: {e}")
            return ""
    
    def is_valid_article_url(self, url: str) -> bool:
        """Valida si una URL es de un artículo válido"""
        if not url:
            return False
        
        # Verificar que sea del dominio correcto
        if 'diariocorreo.pe' not in url:
            return False
        
        # Excluir URLs que no son artículos
        excluded_patterns = [
            '/terminos-y-condiciones/',
            '/politica-de-privacidad/',
            '/oficinas-concesionarias/',
            '/contacto/',
            '/sobre-nosotros/',
            '/categoria/',
            '/tag/',
            '/author/',
            '/page/',
            '/search/',
            '/archivo/'
        ]
        
        for pattern in excluded_patterns:
            if pattern in url:
                return False
        
        return True
    
    def is_navigation_text(self, text: str) -> bool:
        """Identifica si un texto es de navegación y no contenido"""
        navigation_keywords = [
            'ver más', 'leer más', 'más información', 'continuar leyendo',
            'siguiente', 'anterior', 'página', 'categoría', 'etiqueta',
            'compartir', 'comentar', 'síguenos', 'suscripción',
            'publicidad', 'anuncio', 'patrocinado', 'sponsored'
        ]
        
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in navigation_keywords)
    
    def extract_news_from_page(self, url: str, category: str, max_articles: int = 50) -> List[Dict]:
        """Extrae noticias de una página específica con múltiples estrategias"""
        noticias = []
        processed_urls = set()
        
        try:
            response = self.make_request(url)
            if not response:
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Estrategia 1: Buscar artículos con selectores específicos
            articles_found = []
            for selector in self.article_selectors:
                articles = soup.select(selector)
                if articles:
                    articles_found.extend(articles)
            
            # Estrategia 2: Si no encontramos artículos, buscar enlaces que parecen noticias
            if not articles_found:
                links = soup.find_all('a', href=True)
                for link in links:
                    href = link.get('href', '')
                    if self.is_valid_article_url(href):
                        # Crear un pseudo-artículo con el enlace
                        pseudo_article = BeautifulSoup('<div></div>', 'html.parser')
                        pseudo_article.div.append(link)
                        articles_found.append(pseudo_article.div)
            
            # Procesar artículos encontrados
            for article in articles_found[:max_articles]:
                try:
                    news_data = self.extract_news_data(article, category)
                    if news_data and news_data['enlace'] not in processed_urls:
                        processed_urls.add(news_data['enlace'])
                        noticias.append(news_data)
                        
                except Exception as e:
                    self.logger.warning(f"Error procesando artículo: {e}")
                    continue
            
            self.logger.info(f"Obtenidas {len(noticias)} noticias de {url}")
            return noticias
            
        except Exception as e:
            self.logger.error(f"Error obteniendo {url}: {e}")
            return []
    
    def extract_news_data(self, article_element, category: str) -> Optional[Dict]:
        """Extrae los datos de una noticia de un elemento HTML"""
        try:
            # Extraer título
            title = self.extract_title(article_element)
            if not title or len(title) < 10:
                return None
            
            # Extraer enlace
            link = self.extract_link(article_element)
            if not link or not self.is_valid_article_url(link):
                return None
            
            # Extraer imagen con prevención de duplicados
            imagen_url = self.extract_image(article_element)
            
            # SIEMPRE extraer contenido completo del artículo para tener la descripción completa
            self.logger.info(f"🔍 Extrayendo contenido completo de Diario Correo: {link}")
            content = self.extract_article_content(link)
            
            # Si no se pudo extraer contenido completo, intentar con contenido básico como fallback
            if not content or len(content) < 50:
                self.logger.warning(f"⚠️ No se pudo extraer contenido completo, usando resumen básico: {link}")
                content = self.extract_basic_content(article_element)
            
            # NO truncar aquí - guardar contenido completo para la página de detalle
            # El truncado se hará en el frontend para las cards de la lista (máximo 300 caracteres)
            
            # Si aún no hay contenido, usar mensaje por defecto
            if not content:
                content = f"Noticia de {category} de Diario Correo. Para más información, visita el enlace completo."
            
            # Extraer fecha de publicación
            fecha_publicacion = get_publication_date(article_element, 'Diario Correo')
            if fecha_publicacion is None:
                fecha_publicacion = datetime.now().date()
            
            return {
                'titulo': title,
                'contenido': content,
                'enlace': link,
                'imagen_url': imagen_url,
                'categoria': category,
                'diario': 'Diario Correo',
                'fecha_publicacion': fecha_publicacion,
                'fecha_extraccion': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.warning(f"Error extrayendo datos de noticia: {e}")
            return None
    
    def extract_title(self, element) -> str:
        """Extrae el título de un elemento"""
        for selector in self.title_selectors:
            title_elem = element.find(selector)
            if title_elem:
                title = title_elem.get_text(strip=True)
                if title and len(title) > 5:
                    return title
        
        # Si no encuentra con selectores específicos, buscar en enlaces
        link_elem = element.find('a')
        if link_elem:
            title = link_elem.get_text(strip=True)
            if title and len(title) > 5:
                return title
        
        return ""
    
    def extract_link(self, element) -> str:
        """Extrae el enlace de un elemento"""
        link_elem = element.find('a', href=True)
        if link_elem:
            href = link_elem.get('href')
            if href:
                if href.startswith('/'):
                    return self.base_url + href
                elif href.startswith('http'):
                    return href
        return ""
    
    def _normalize_image_url(self, url: str) -> str:
        """Normaliza URL de imagen para verificación de duplicados"""
        if not url:
            return ""
        return url.split('?')[0].split('#')[0]
    
    def _is_image_already_used(self, img_url: str) -> bool:
        """Verifica si una imagen ya fue usada"""
        if not img_url:
            return False
        normalized = self._normalize_image_url(img_url)
        return normalized in self.processed_images
    
    def _mark_image_as_used(self, img_url: str):
        """Marca una imagen como usada"""
        if img_url:
            normalized = self._normalize_image_url(img_url)
            self.processed_images.add(normalized)
    
    def extract_image(self, element) -> Optional[str]:
        """Extrae la imagen de un elemento usando el extractor mejorado con prevención de duplicados"""
        # Obtener el enlace del artículo primero
        link = self.extract_link(element)
        if link:
            # Usar el extractor mejorado que obtiene la imagen del artículo individual
            self.logger.info(f"🖼️ Extrayendo imagen para: {link[:80]}...")
            imagen_url = extract_image_from_element(element, article_url=link, base_url=self.base_url, session=self.session)
            
            if imagen_url:
                # Verificar si la imagen ya fue usada (prevención de duplicados)
                if self._is_image_already_used(imagen_url):
                    self.logger.warning(f"⚠️ Imagen duplicada rechazada: {imagen_url[:80]}...")
                    return None
                
                # Marcar como usada
                self._mark_image_as_used(imagen_url)
                self.logger.info(f"✅ Imagen única asignada: {imagen_url[:80]}...")
            else:
                self.logger.warning(f"⚠️ No se encontró imagen para: {link[:80]}...")
            
            return imagen_url
        return None
    
    def extract_basic_content(self, element) -> str:
        """Extrae contenido básico del resumen"""
        # Buscar párrafos de resumen
        content_elem = (element.find('p') or 
                       element.find('div', class_=lambda x: x and ('summary' in x.lower() or 'excerpt' in x.lower())) or
                       element.find('span', class_=lambda x: x and 'summary' in x.lower()))
        
        if content_elem:
            content = content_elem.get_text(strip=True)
            if content and len(content) > 20 and not self.is_navigation_text(content):
                return content
        
        return ""
    
    def scrape_section(self, section: str, max_pages: int = 3) -> List[Dict]:
        """Extrae noticias de una sección específica con paginación"""
        noticias = []
        
        for page in range(1, max_pages + 1):
            try:
                if page == 1:
                    url = f"{self.base_url}{section}"
                else:
                    # Intentar diferentes formatos de paginación
                    pagination_formats = [
                        f"{self.base_url}{section}?page={page}",
                        f"{self.base_url}{section}page/{page}/",
                        f"{self.base_url}{section}p/{page}/"
                    ]
                    
                    url = None
                    for format_url in pagination_formats:
                        response = self.make_request(format_url)
                        if response and response.status_code == 200:
                            url = format_url
                            break
                    
                    if not url:
                        self.logger.info(f"No se encontró paginación para {section} página {page}")
                        break
                
                page_noticias = self.extract_news_from_page(url, section.strip('/').title(), max_articles=30)
                noticias.extend(page_noticias)
                
                # Si no hay noticias en esta página, probablemente no hay más páginas
                if len(page_noticias) < 5:
                    break
                
                # Pequeña pausa entre páginas
                time.sleep(1)
                
            except Exception as e:
                self.logger.warning(f"Error en página {page} de {section}: {e}")
                continue
        
        return noticias
    
    def get_deportes(self) -> List[Dict]:
        """Extrae noticias de la sección Deportes"""
        return self.scrape_section('/deportes/')
    
    def get_economia(self) -> List[Dict]:
        """Extrae noticias de la sección Economía"""
        return self.scrape_section('/economia/')
    
    def get_espectaculos(self) -> List[Dict]:
        """Extrae noticias de la sección Espectáculos"""
        return self.scrape_section('/espectaculos/')
    
    def get_mundo(self) -> List[Dict]:
        """Extrae noticias de la sección Mundo"""
        return self.scrape_section('/mundo/')
    
    def get_politica(self) -> List[Dict]:
        """Extrae noticias de la sección Política"""
        return self.scrape_section('/politica/')
    
    def get_tecnologia(self) -> List[Dict]:
        """Extrae noticias de la sección Tecnología"""
        return self.scrape_section('/tecnologia/')
    
    def get_cultura(self) -> List[Dict]:
        """Extrae noticias de la sección Cultura"""
        return self.scrape_section('/cultura/')
    
    def get_all_news(self) -> List[Dict]:
        """Obtiene todas las noticias de todas las secciones"""
        # Limpiar imágenes procesadas al inicio para evitar duplicados entre ejecuciones
        self.processed_images.clear()
        all_news = []
        
        # Obtener noticias de cada sección válida
        sections = [
            ('Deportes', self.get_deportes),
            ('Economía', self.get_economia),
            ('Espectáculos', self.get_espectaculos),
            ('Mundo', self.get_mundo),
            ('Política', self.get_politica),
            ('Tecnología', self.get_tecnologia),
            ('Cultura', self.get_cultura)
        ]
        
        for section_name, section_method in sections:
            try:
                self.logger.info(f"Iniciando scraping de {section_name}")
                section_noticias = section_method()
                all_news.extend(section_noticias)
                self.logger.info(f"Scraping de {section_name} completado. Noticias obtenidas: {len(section_noticias)}")
                
                # Pausa entre secciones para evitar sobrecarga
                time.sleep(2)
                
            except Exception as e:
                self.logger.error(f"Error en sección {section_name}: {e}")
                continue
        
        return all_news

if __name__ == "__main__":
    scraper = ScraperCorreoOptimized()
    noticias = scraper.get_all_news()
    print(f"Total de noticias extraídas: {len(noticias)}")
    
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
    for i, noticia in enumerate(noticias[:5]):
        print(f"{i+1}. {noticia['categoria']}: {noticia['titulo'][:70]}...")
