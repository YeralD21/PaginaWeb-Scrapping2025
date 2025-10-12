import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
from datetime import datetime
import logging
import re
import time
from urllib.parse import urljoin, urlparse

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class ScraperCNNEnhanced:
    def __init__(self):
        self.base_url = "https://cnnespanol.cnn.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        })
        self.processed_urls = set()
        self.processed_images = set()

    def _get_page_soup(self, url: str, retries: int = 3) -> Optional[BeautifulSoup]:
        """Obtiene el soup de una página con reintentos"""
        for i in range(retries):
            try:
                response = self.session.get(url, timeout=15)
                response.raise_for_status()
                return BeautifulSoup(response.content, 'html.parser')
            except requests.exceptions.RequestException as e:
                logging.warning(f"Error al obtener {url} (intento {i+1}/{retries}): {e}")
                time.sleep(0.5 * (2 ** i))
        return None

    def _extract_image_url(self, soup: BeautifulSoup, article_url: str) -> str:
        """Extrae la URL de imagen de un artículo, manejando diferentes formatos"""
        try:
            # 1. Buscar meta tags (Open Graph, Twitter)
            meta_selectors = [
                'meta[property="og:image"]',
                'meta[name="twitter:image"]',
                'meta[property="twitter:image"]',
                'meta[name="og:image"]'
            ]
            
            for selector in meta_selectors:
                meta = soup.select_one(selector)
                if meta and meta.get('content'):
                    img_url = meta['content']
                    if self._is_valid_image_url(img_url):
                        return self._normalize_image_url(img_url)
            
            # 2. Buscar imágenes en el contenido principal
            img_selectors = [
                'img.media__image',
                'img.Article__image',
                'img.story-image',
                'img.article-image',
                'img[class*="hero"]',
                'img[class*="featured"]',
                'img[class*="main"]',
                'div.media img',
                'div.Article__media img',
                'figure img',
                'div[class*="image"] img'
            ]
            
            for selector in img_selectors:
                img = soup.select_one(selector)
                if img and img.get('src'):
                    img_url = img['src']
                    if self._is_valid_image_url(img_url):
                        return self._normalize_image_url(img_url)
            
            # 3. Buscar en srcset
            for selector in ['img[srcset]', 'source[srcset]']:
                element = soup.select_one(selector)
                if element:
                    srcset = element.get('srcset', '')
                    if srcset:
                        # Extraer la URL más grande del srcset
                        urls = re.findall(r'([^\s,]+)(?:\s+\d+[wx])?', srcset)
                        for url in urls:
                            if self._is_valid_image_url(url):
                                return self._normalize_image_url(url)
            
            # 4. Buscar en data-src (lazy loading)
            lazy_selectors = [
                'img[data-src]',
                'img[data-lazy]',
                'img[data-original]'
            ]
            
            for selector in lazy_selectors:
                img = soup.select_one(selector)
                if img:
                    for attr in ['data-src', 'data-lazy', 'data-original']:
                        img_url = img.get(attr)
                        if img_url and self._is_valid_image_url(img_url):
                            return self._normalize_image_url(img_url)
            
            # 5. Buscar en noscript tags
            noscript = soup.find('noscript')
            if noscript:
                noscript_img = noscript.find('img')
                if noscript_img and noscript_img.get('src'):
                    img_url = noscript_img['src']
                    if self._is_valid_image_url(img_url):
                        return self._normalize_image_url(img_url)
            
            return "No Image"
            
        except Exception as e:
            logging.warning(f"Error extrayendo imagen de {article_url}: {e}")
            return "No Image"

    def _is_valid_image_url(self, url: str) -> bool:
        """Verifica si una URL de imagen es válida"""
        if not url or url == "No Image":
            return False
        
        # Filtrar URLs no deseadas
        invalid_patterns = [
            'logo', 'icon', 'avatar', 'profile', 'thumbnail',
            'placeholder', 'default', 'loading', 'spinner',
            'advertisement', 'banner', 'ad-', 'promo'
        ]
        
        url_lower = url.lower()
        for pattern in invalid_patterns:
            if pattern in url_lower:
                return False
        
        # Verificar que sea una imagen
        image_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']
        return any(url_lower.endswith(ext) for ext in image_extensions) or 'image' in url_lower

    def _normalize_image_url(self, url: str) -> str:
        """Normaliza la URL de imagen"""
        if not url or url == "No Image":
            return "No Image"
        
        # Convertir URL relativa a absoluta
        if url.startswith('//'):
            url = 'https:' + url
        elif url.startswith('/'):
            url = self.base_url + url
        
        # Verificar que no sea una imagen duplicada
        if url in self.processed_images:
            return "No Image"
        
        self.processed_images.add(url)
        return url

    def _extract_article_data(self, article_url: str, category: str) -> Dict:
        """Extrae datos completos de un artículo"""
        if article_url in self.processed_urls:
            return {}
        
        logging.info(f"🔍 Extrayendo artículo de CNN: {article_url}")
        soup = self._get_page_soup(article_url)
        if not soup:
            return {}
        
        # Extraer título
        title_selectors = [
            'h1.Article__title',
            'h1.story-title',
            'h1.article-title',
            'h1[class*="headline"]',
            'h1[class*="title"]',
            'h1'
        ]
        
        title = "No Title"
        for selector in title_selectors:
            title_elem = soup.select_one(selector)
            if title_elem:
                title = title_elem.get_text(strip=True)
                if len(title) > 10:  # Título válido
                    break
        
        # Extraer contenido
        content_selectors = [
            'div.Article__content',
            'div.story-body',
            'div.article-body',
            'div.entry-content',
            'div[class*="story"] p',
            'div[class*="article"] p',
            'article p',
            '.main p'
        ]
        
        content = ""
        for selector in content_selectors:
            elements = soup.select(selector)
            if elements:
                paragraphs = []
                for elem in elements:
                    text = elem.get_text(strip=True)
                    if len(text) > 20:  # Párrafo válido
                        paragraphs.append(text)
                if paragraphs:
                    content = "\n".join(paragraphs[:3])  # Primeros 3 párrafos
                    break
        
        if not content:
            content = f"Noticia de {category} de CNN en Español. Para más información, visita el enlace completo."
        
        # Extraer imagen
        image_url = self._extract_image_url(soup, article_url)
        
        # Normalizar categoría
        normalized_category = self._normalize_category(category)
        
        self.processed_urls.add(article_url)
        
        return {
            'titulo': title,
            'contenido': content,
            'enlace': article_url,
            'imagen_url': image_url,
            'categoria': normalized_category,
            'diario': 'CNN en Español',
            'fecha_publicacion': datetime.now().isoformat(),
            'fecha_extraccion': datetime.now().isoformat()
        }

    def _normalize_category(self, category: str) -> str:
        """Normaliza las categorías a las estándar"""
        category_lower = category.lower()
        
        if any(word in category_lower for word in ['mundo', 'world', 'internacional', 'americas']):
            return 'Mundo'
        elif any(word in category_lower for word in ['deportes', 'sports', 'futbol', 'fútbol']):
            return 'Deportes'
        elif any(word in category_lower for word in ['economia', 'economía', 'business', 'dinero', 'negocios']):
            return 'Economía'
        else:
            return 'Sin categoría'

    def _get_category_links(self, category_url: str, max_links: int = 30) -> List[str]:
        """Obtiene enlaces de noticias de una categoría"""
        links = []
        soup = self._get_page_soup(category_url)
        if not soup:
            return links
        
        # Selectores para encontrar enlaces de noticias
        link_selectors = [
            'a[href*="/2025/"]',
            'a[href*="/2024/"]',
            'a[href*="/mundo/"]',
            'a[href*="/deportes/"]',
            'a[href*="/economia/"]',
            'a[href*="/entretenimiento/"]',
            'a[href*="/salud/"]',
            'a[href*="/tecnologia/"]',
            'a[href*="/ciencia/"]'
        ]
        
        for selector in link_selectors:
            elements = soup.select(selector)
            for elem in elements:
                href = elem.get('href')
                if not href:
                    continue
                
                # Construir URL completa
                if href.startswith('/'):
                    full_url = self.base_url + href
                elif href.startswith('http') and 'cnnespanol.cnn.com' in href:
                    full_url = href
                else:
                    continue
                
                # Filtrar enlaces no deseados
                if any(word in full_url.lower() for word in ['/video/', '/gallery/', '/live/', '/podcast/']):
                    continue
                
                # Verificar que sea un enlace de noticia válido
                title = elem.get_text(strip=True)
                if (len(title) > 20 and len(title) < 200 and 
                    not title.lower() in ['ver más', 'leer más', 'cnn', 'cnn en español']):
                    links.append(full_url)
                    
                if len(links) >= max_links:
                    break
            
            if len(links) >= max_links:
                break
        
        return list(set(links))  # Eliminar duplicados

    def get_mundo(self, max_articles: int = 25) -> List[Dict]:
        """Extrae noticias de la sección Mundo"""
        noticias = []
        urls = [
            f"{self.base_url}/mundo/",
            f"{self.base_url}/americas/",
            f"{self.base_url}/internacional/"
        ]
        
        for url in urls:
            links = self._get_category_links(url, max_articles // len(urls))
            for link in links:
                data = self._extract_article_data(link, 'Mundo')
                if data and data['titulo'] != "No Title":
                    noticias.append(data)
                time.sleep(0.1)  # Pausa entre requests
        
        return noticias

    def get_deportes(self, max_articles: int = 25) -> List[Dict]:
        """Extrae noticias de la sección Deportes"""
        noticias = []
        urls = [
            f"{self.base_url}/deportes/",
            f"{self.base_url}/olimpiadas/"
        ]
        
        for url in urls:
            links = self._get_category_links(url, max_articles // len(urls))
            for link in links:
                data = self._extract_article_data(link, 'Deportes')
                if data and data['titulo'] != "No Title":
                    noticias.append(data)
                time.sleep(0.1)
        
        return noticias

    def get_economia(self, max_articles: int = 25) -> List[Dict]:
        """Extrae noticias de la sección Economía"""
        noticias = []
        urls = [
            f"{self.base_url}/economia/",
            f"{self.base_url}/negocios/",
            f"{self.base_url}/dinero/"
        ]
        
        for url in urls:
            links = self._get_category_links(url, max_articles // len(urls))
            for link in links:
                data = self._extract_article_data(link, 'Economía')
                if data and data['titulo'] != "No Title":
                    noticias.append(data)
                time.sleep(0.1)
        
        return noticias

    def get_all_news(self) -> List[Dict]:
        """Extrae todas las noticias de CNN en Español"""
        self.processed_urls = set()
        self.processed_images = set()
        
        all_news = []
        all_news.extend(self.get_mundo())
        all_news.extend(self.get_deportes())
        all_news.extend(self.get_economia())
        
        logging.info(f"Total noticias CNN Enhanced: {len(all_news)}")
        return all_news

if __name__ == "__main__":
    scraper = ScraperCNNEnhanced()
    noticias = scraper.get_all_news()
    print(f"CNN Enhanced: {len(noticias)} noticias")
    for noticia in noticias[:5]:
        print(f"- {noticia['categoria']}: {noticia['titulo']} (Imagen: {'Sí' if noticia['imagen_url'] != 'No Image' else 'No'})")
